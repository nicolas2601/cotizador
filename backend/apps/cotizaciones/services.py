import logging
from datetime import timedelta
from decimal import Decimal
from io import BytesIO

from django.conf import settings
from django.core.files.base import ContentFile
from django.core.mail import EmailMessage, EmailMultiAlternatives
from django.template.loader import render_to_string
from django.utils import timezone
from weasyprint import HTML

from apps.cotizadores.services import FormulaError, calcular_precio
from apps.ia.client import GroqClient, AIClientError
from apps.ia.prompts import prompt_descripcion_propuesta

from .models import Cotizacion

logger = logging.getLogger(__name__)


def _resolver_respuestas_legibles(respuestas: dict, configuracion: dict) -> dict:
    """Convierte los valores raw de respuestas a labels legibles para el PDF."""
    if not respuestas or not configuracion:
        return respuestas or {}

    # Construir mapa de campos: campo_id -> campo_config
    campos_map = {}
    for paso in configuracion.get("pasos", []):
        for campo in paso.get("campos", []):
            if "id" in campo:
                campos_map[campo["id"]] = campo

    resultado = {}
    for campo_id, valor in respuestas.items():
        campo = campos_map.get(campo_id)
        if not campo or not campo.get("opciones"):
            # Campo sin opciones: usar label como key, valor como esta
            label = campo["label"] if campo else campo_id.replace("_", " ").title()
            resultado[label] = valor
            continue

        label = campo.get("label", campo_id.replace("_", " ").title())
        opciones = {o["valor"]: o["label"] for o in campo["opciones"]}

        if campo.get("tipo") == "multiple" and "|" in str(valor):
            # Campos multiple: resolver cada valor separado por |
            valores = str(valor).split("|")
            labels = [opciones.get(v, v) for v in valores if v]
            resultado[label] = ", ".join(labels) if labels else valor
        elif campo.get("tipo") == "seleccion":
            resultado[label] = opciones.get(str(valor), valor)
        else:
            resultado[label] = valor

    return resultado


def _resolver_opciones_seleccionadas(respuestas: dict, configuracion: dict) -> tuple:
    """Devuelve (lista de {campo, opcion, precio}, notas_cliente) para el PDF."""
    if not respuestas or not configuracion:
        return [], ""

    campos_map = {}
    for paso in configuracion.get("pasos", []):
        for campo in paso.get("campos", []):
            if "id" in campo:
                campos_map[campo["id"]] = campo

    items = []
    notas_cliente = ""

    for campo_id, valor in respuestas.items():
        # Ignorar valores vacios
        if not valor or not str(valor).strip():
            continue

        campo = campos_map.get(campo_id)
        if not campo:
            continue

        # Campos de texto: guardar como notas del cliente (no van en la tabla)
        if campo.get("tipo") == "texto":
            if str(valor).strip():
                notas_cliente = str(valor).strip()
            continue

        opciones = campo.get("opciones", [])
        if not opciones:
            # Campo numerico: mostrar valor directo
            if campo.get("tipo") in ("numero", "slider", "area_m2") and valor:
                items.append({
                    "campo": campo.get("label", campo_id),
                    "opcion": f"{valor} {campo.get('unidad', '')}".strip(),
                    "precio": None,
                })
            continue

        opciones_map = {o["valor"]: o for o in opciones}

        if campo.get("tipo") == "multiple":
            valores = str(valor).split("|") if "|" in str(valor) else [str(valor)]
            for v in valores:
                if v and v in opciones_map:
                    op = opciones_map[v]
                    items.append({
                        "campo": campo.get("label", campo_id),
                        "opcion": op["label"],
                        "precio": float(v) if v.replace(".", "").isdigit() else None,
                    })
        elif campo.get("tipo") == "seleccion":
            op = opciones_map.get(str(valor))
            if op:
                items.append({
                    "campo": campo.get("label", campo_id),
                    "opcion": op["label"],
                    "precio": float(valor) if str(valor).replace(".", "").isdigit() else None,
                })

    return items, notas_cliente


class CotizacionService:
    @staticmethod
    def crear_cotizacion(cotizador, datos_prospecto: dict, respuestas: dict) -> Cotizacion:
        cotizacion = Cotizacion.objects.create(
            cotizador=cotizador,
            negocio=cotizador.negocio,
            prospecto_nombre=datos_prospecto["nombre"],
            prospecto_email=datos_prospecto["email"],
            prospecto_telefono=datos_prospecto.get("telefono", ""),
            prospecto_empresa=datos_prospecto.get("empresa", ""),
            respuestas=respuestas,
            moneda=cotizador.moneda,
        )
        cotizacion.generar_token()
        return cotizacion

    @staticmethod
    def calcular_y_guardar_precio(cotizacion: Cotizacion) -> Decimal:
        resultado = calcular_precio(cotizacion.cotizador_id, cotizacion.respuestas)
        cotizacion.subtotal = resultado["subtotal"]
        cotizacion.total = resultado["total"]
        cotizacion.desglose_precio = [
            {"regla": item["regla"], "valor": str(item["valor"])}
            for item in resultado["desglose"]
        ]
        cotizacion.save(update_fields=["subtotal", "total", "desglose_precio"])
        return resultado["total"]

    @staticmethod
    def generar_descripcion_ia(cotizacion: Cotizacion) -> str:
        if not settings.GROQ_API_KEY:
            logger.info("Ollama Cloud no configurado, omitiendo descripcion IA")
            return ""

        contexto = {
            "negocio_nombre": cotizacion.negocio.nombre,
            "cotizador_nombre": cotizacion.cotizador.nombre,
            "cotizador_descripcion": cotizacion.cotizador.descripcion,
            "respuestas": cotizacion.respuestas,
            "total": float(cotizacion.total),
            "desglose": [
                {"regla": d["regla"], "valor": Decimal(d["valor"])}
                for d in cotizacion.desglose_precio
            ],
        }

        try:
            client = GroqClient()
            descripcion = client.chat_sync(
                prompt=prompt_descripcion_propuesta(contexto),
                system="Eres un asistente de ventas profesional para una agencia de software en Colombia.",
            )
            cotizacion.descripcion_ia = descripcion
            cotizacion.save(update_fields=["descripcion_ia"])
            return descripcion
        except AIClientError as e:
            logger.error(f"Error generando descripcion IA: {e}")
            return ""

    @staticmethod
    def generar_pdf(cotizacion: Cotizacion) -> bytes:
        desglose_display = [
            {"regla": d["regla"], "valor": float(Decimal(d["valor"]))}
            for d in cotizacion.desglose_precio
        ]

        negocio = cotizacion.negocio
        numero_cotizacion = f"COT-{str(cotizacion.id)[-6:].upper()}"
        fecha_vencimiento = (timezone.now() + timedelta(days=21)).strftime("%d de %B de %Y")

        # Resolver opciones seleccionadas con precios para tabla detallada
        opciones_seleccionadas, notas_cliente = _resolver_opciones_seleccionadas(
            cotizacion.respuestas, cotizacion.cotizador.configuracion
        )

        contexto = {
            "negocio_nombre": negocio.nombre,
            "negocio_logo": negocio.logo_url,
            "negocio_telefono": negocio.telefono,
            "negocio_email": negocio.owner.email,
            "negocio_web": negocio.sitio_web,
            "negocio_direccion": negocio.direccion,
            "color_primario": negocio.color_primario or "#800080",
            "cotizador_nombre": cotizacion.cotizador.nombre,
            "cotizacion_id": str(cotizacion.id),
            "numero_cotizacion": numero_cotizacion,
            "fecha": timezone.now().strftime("%d de %B de %Y"),
            "fecha_vencimiento": fecha_vencimiento,
            "estado": cotizacion.estado,
            "prospecto_nombre": cotizacion.prospecto_nombre,
            "prospecto_email": cotizacion.prospecto_email,
            "prospecto_telefono": cotizacion.prospecto_telefono,
            "prospecto_empresa": cotizacion.prospecto_empresa,
            "descripcion_ia": cotizacion.descripcion_ia,
            "descripcion_parrafos": [
                p.strip() for p in cotizacion.descripcion_ia.split("\n") if p.strip()
            ] if cotizacion.descripcion_ia else [],
            "opciones_seleccionadas": opciones_seleccionadas,
            "notas_cliente": notas_cliente,
            "desglose": desglose_display,
            "subtotal": float(cotizacion.subtotal),
            "total": float(cotizacion.total),
            "moneda": cotizacion.moneda,
            "url_aceptar": f"{settings.FRONTEND_URL}/propuesta/{cotizacion.token_aceptacion}" if cotizacion.token_aceptacion else "",
        }

        html_string = render_to_string("pdf/propuesta.html", contexto)
        pdf_bytes = HTML(string=html_string).write_pdf()
        return pdf_bytes

    @staticmethod
    def subir_pdf_supabase(cotizacion: Cotizacion, pdf_bytes: bytes) -> str:
        import httpx

        supabase_url = settings.SUPABASE_URL
        anon_key = settings.SUPABASE_ANON_KEY

        if not supabase_url or not anon_key:
            logger.warning("Supabase no configurado, PDF no subido")
            return ""

        filename = f"cotizaciones/{cotizacion.negocio.slug}/{cotizacion.id}.pdf"

        try:
            response = httpx.post(
                f"{supabase_url}/storage/v1/object/media/{filename}",
                headers={
                    "Authorization": f"Bearer {anon_key}",
                    "apikey": anon_key,
                    "Content-Type": "application/pdf",
                    "x-upsert": "true",
                },
                content=pdf_bytes,
                timeout=30,
            )

            if response.status_code in (200, 201):
                url = f"{supabase_url}/storage/v1/object/public/media/{filename}"
                cotizacion.pdf_url = url
                cotizacion.save(update_fields=["pdf_url"])
                logger.info(f"PDF subido a Supabase: {url}")
                return url
            else:
                logger.error(f"Error Supabase Storage ({response.status_code}): {response.text[:200]}")
                return ""

        except Exception as e:
            logger.error(f"Error subiendo PDF a Supabase: {e}")
            return ""

    @staticmethod
    def enviar_email_pdf(cotizacion: Cotizacion, pdf_bytes: bytes = None) -> None:
        if not cotizacion.prospecto_email:
            return

        negocio = cotizacion.negocio
        subject = f"Tu propuesta comercial - {cotizacion.cotizador.nombre} | {negocio.nombre}"

        text_body = (
            f"Hola {cotizacion.prospecto_nombre},\n\n"
            f"Adjunto encontraras tu propuesta comercial de {negocio.nombre}.\n\n"
            f"Total: ${cotizacion.total:,.0f} {cotizacion.moneda}\n\n"
            f"Quedamos atentos a tus comentarios.\n\n"
            f"Saludos,\n{negocio.nombre}"
        )

        html_body = render_to_string("email/propuesta.html", {
            "negocio_nombre": negocio.nombre,
            "negocio_logo": negocio.logo_url,
            "negocio_telefono": negocio.telefono,
            "negocio_email": negocio.owner.email,
            "negocio_web": negocio.sitio_web,
            "color_primario": negocio.color_primario or "#800080",
            "prospecto_nombre": cotizacion.prospecto_nombre,
            "cotizador_nombre": cotizacion.cotizador.nombre,
            "total": f"${cotizacion.total:,.0f}",
            "moneda": cotizacion.moneda,
            "pdf_url": cotizacion.pdf_url,
            "url_aceptar": f"{settings.FRONTEND_URL}/propuesta/{cotizacion.token_aceptacion}" if cotizacion.token_aceptacion else "",
        })

        email = EmailMultiAlternatives(
            subject=subject,
            body=text_body,
            from_email=settings.DEFAULT_FROM_EMAIL,
            to=[cotizacion.prospecto_email],
        )
        email.attach_alternative(html_body, "text/html")

        if pdf_bytes:
            email.attach(
                f"propuesta-{negocio.slug}.pdf",
                pdf_bytes,
                "application/pdf",
            )

        try:
            email.send()
            cotizacion.estado = Cotizacion.Estado.ENVIADA
            cotizacion.save(update_fields=["estado"])
            logger.info(f"Email enviado a {cotizacion.prospecto_email}")
        except Exception as e:
            logger.error(f"Error enviando email: {e}")
