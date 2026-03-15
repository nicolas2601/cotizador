import logging
from decimal import Decimal
from io import BytesIO

from django.conf import settings
from django.core.files.base import ContentFile
from django.core.mail import EmailMessage
from django.template.loader import render_to_string
from django.utils import timezone
from weasyprint import HTML

from apps.cotizadores.services import FormulaError, calcular_precio
from apps.ia.client import OllamaCloudClient, OllamaCloudError
from apps.ia.prompts import prompt_descripcion_propuesta

from .models import Cotizacion

logger = logging.getLogger(__name__)


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
        if not settings.OLLAMA_CLOUD_API_KEY:
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
            client = OllamaCloudClient()
            descripcion = client.chat_sync(
                prompt=prompt_descripcion_propuesta(contexto),
                system="Eres un asistente de ventas profesional para una agencia de software en Colombia.",
            )
            cotizacion.descripcion_ia = descripcion
            cotizacion.save(update_fields=["descripcion_ia"])
            return descripcion
        except OllamaCloudError as e:
            logger.error(f"Error generando descripcion IA: {e}")
            return ""

    @staticmethod
    def generar_pdf(cotizacion: Cotizacion) -> bytes:
        desglose_display = [
            {"regla": d["regla"], "valor": float(Decimal(d["valor"]))}
            for d in cotizacion.desglose_precio
        ]

        contexto = {
            "negocio_nombre": cotizacion.negocio.nombre,
            "negocio_logo": cotizacion.negocio.logo_url,
            "color_primario": cotizacion.negocio.color_primario or "#000000",
            "cotizador_nombre": cotizacion.cotizador.nombre,
            "cotizacion_id": str(cotizacion.id),
            "fecha": timezone.now().strftime("%d/%m/%Y"),
            "prospecto_nombre": cotizacion.prospecto_nombre,
            "prospecto_email": cotizacion.prospecto_email,
            "prospecto_telefono": cotizacion.prospecto_telefono,
            "prospecto_empresa": cotizacion.prospecto_empresa,
            "descripcion_ia": cotizacion.descripcion_ia,
            "desglose": desglose_display,
            "total": float(cotizacion.total),
            "moneda": cotizacion.moneda,
        }

        html_string = render_to_string("pdf/propuesta.html", contexto)
        pdf_bytes = HTML(string=html_string).write_pdf()
        return pdf_bytes

    @staticmethod
    def subir_pdf_supabase(cotizacion: Cotizacion, pdf_bytes: bytes) -> str:
        from django.core.files.storage import default_storage

        filename = f"cotizaciones/{cotizacion.negocio.slug}/{cotizacion.id}.pdf"

        try:
            path = default_storage.save(filename, ContentFile(pdf_bytes))
            url = default_storage.url(path)
            cotizacion.pdf_url = url
            cotizacion.save(update_fields=["pdf_url"])
            return url
        except Exception as e:
            logger.error(f"Error subiendo PDF a storage: {e}")
            cotizacion.pdf_url = ""
            cotizacion.save(update_fields=["pdf_url"])
            return ""

    @staticmethod
    def enviar_email_pdf(cotizacion: Cotizacion) -> None:
        if not cotizacion.prospecto_email:
            return

        subject = f"Propuesta comercial - {cotizacion.cotizador.nombre}"
        body = (
            f"Hola {cotizacion.prospecto_nombre},\n\n"
            f"Adjunto encontraras tu propuesta comercial de {cotizacion.negocio.nombre}.\n\n"
            f"Total: ${cotizacion.total:,.0f} {cotizacion.moneda}\n\n"
            f"Quedamos atentos a tus comentarios.\n\n"
            f"Saludos,\n{cotizacion.negocio.nombre}"
        )

        email = EmailMessage(
            subject=subject,
            body=body,
            from_email=settings.DEFAULT_FROM_EMAIL,
            to=[cotizacion.prospecto_email],
        )

        if cotizacion.pdf_url:
            try:
                pdf_bytes = CotizacionService.generar_pdf(cotizacion)
                email.attach(
                    f"propuesta-{cotizacion.id}.pdf",
                    pdf_bytes,
                    "application/pdf",
                )
            except Exception as e:
                logger.error(f"Error adjuntando PDF al email: {e}")

        try:
            email.send()
            cotizacion.estado = Cotizacion.Estado.ENVIADA
            cotizacion.save(update_fields=["estado"])
        except Exception as e:
            logger.error(f"Error enviando email: {e}")
