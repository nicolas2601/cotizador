import logging
import threading

from django.conf import settings
from django.utils.decorators import method_decorator
from django_ratelimit.decorators import ratelimit
from rest_framework import status
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.cotizadores.models import Cotizador

from .models import Cotizacion
from .serializers import CotizacionPublicaSerializer, CotizacionSerializer, EstadoSerializer
from .services import CotizacionService

logger = logging.getLogger(__name__)


def _procesar_en_background(cotizacion_id: str):
    """Procesa la cotizacion en un thread (dev) o Celery (prod)."""
    from concurrent.futures import ThreadPoolExecutor

    from .models import Cotizacion as CotModel

    try:
        cotizacion = CotModel.objects.get(id=cotizacion_id)
        cotizacion.estado = CotModel.Estado.PROCESANDO
        cotizacion.save(update_fields=["estado"])

        # Run price calculation and IA description in parallel
        with ThreadPoolExecutor(max_workers=2) as executor:
            future_precio = executor.submit(CotizacionService.calcular_y_guardar_precio, cotizacion)
            future_ia = executor.submit(CotizacionService.generar_descripcion_ia, cotizacion)

            # Wait for both to complete
            future_precio.result()
            future_ia.result()

        pdf_bytes = None
        try:
            cotizacion.refresh_from_db()
            pdf_bytes = CotizacionService.generar_pdf(cotizacion)
            CotizacionService.subir_pdf_supabase(cotizacion, pdf_bytes)
        except Exception as e:
            logger.warning(f"PDF no generado: {e}")

        try:
            CotizacionService.enviar_email_pdf(cotizacion, pdf_bytes=pdf_bytes)
        except Exception as e:
            logger.warning(f"Email no enviado: {e}")

        cotizacion.estado = CotModel.Estado.LISTA
        cotizacion.save(update_fields=["estado"])
        logger.info(f"Cotizacion {cotizacion_id} procesada")

    except Exception as e:
        logger.error(f"Error procesando cotizacion {cotizacion_id}: {e}")
        try:
            cot = CotModel.objects.get(id=cotizacion_id)
            cot.estado = CotModel.Estado.ERROR
            cot.save(update_fields=["estado"])
        except Exception:
            pass


def despachar_cotizacion(cotizacion_id: str):
    """En DEBUG usa thread, en produccion usa Celery."""
    if settings.DEBUG:
        thread = threading.Thread(target=_procesar_en_background, args=(cotizacion_id,))
        thread.daemon = True
        thread.start()
    else:
        from .tasks import procesar_cotizacion
        procesar_cotizacion.delay(cotizacion_id)


@method_decorator(ratelimit(key='ip', rate='10/m', method='POST'), name='post')
class CotizarPublicoView(APIView):
    permission_classes = [AllowAny]

    def post(self, request, negocio_slug, cotizador_slug):
        try:
            cotizador = Cotizador.objects.select_related("negocio").get(
                negocio__slug=negocio_slug, slug=cotizador_slug, activo=True,
            )
        except Cotizador.DoesNotExist:
            return Response({"detail": "Cotizador no encontrado."}, status=status.HTTP_404_NOT_FOUND)

        serializer = CotizacionPublicaSerializer(data=request.data)
        if not serializer.is_valid():
            logger.warning(f"Validacion fallida en cotizar: {serializer.errors} | data: {request.data}")
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        data = serializer.validated_data

        cotizacion = CotizacionService.crear_cotizacion(
            cotizador=cotizador,
            datos_prospecto={
                "nombre": data["nombre"],
                "email": data["email"],
                "telefono": data.get("telefono", ""),
                "empresa": data.get("empresa", ""),
            },
            respuestas=data["respuestas"],
        )

        despachar_cotizacion(str(cotizacion.id))

        return Response(
            {"cotizacion_id": str(cotizacion.id), "estado": cotizacion.estado},
            status=status.HTTP_201_CREATED,
        )


class CotizacionListView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        cotizaciones = Cotizacion.objects.filter(
            negocio=request.user.negocio
        ).select_related("cotizador")
        serializer = CotizacionSerializer(cotizaciones, many=True)
        return Response(serializer.data)


class CotizacionDetailView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, pk):
        try:
            cotizacion = Cotizacion.objects.get(id=pk, negocio=request.user.negocio)
        except Cotizacion.DoesNotExist:
            return Response({"detail": "No encontrada."}, status=status.HTTP_404_NOT_FOUND)
        return Response(CotizacionSerializer(cotizacion).data)


class CotizacionEstadoView(APIView):
    permission_classes = [IsAuthenticated]

    def patch(self, request, pk):
        try:
            cotizacion = Cotizacion.objects.get(id=pk, negocio=request.user.negocio)
        except Cotizacion.DoesNotExist:
            return Response({"detail": "No encontrada."}, status=status.HTTP_404_NOT_FOUND)
        serializer = EstadoSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        cotizacion.estado = serializer.validated_data["estado"]
        cotizacion.save(update_fields=["estado"])
        return Response(CotizacionSerializer(cotizacion).data)


class CotizacionChatIAView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, pk):
        try:
            cotizacion = Cotizacion.objects.select_related(
                "cotizador", "negocio", "negocio__owner"
            ).get(id=pk, negocio=request.user.negocio)
        except Cotizacion.DoesNotExist:
            return Response({"detail": "No encontrada."}, status=status.HTTP_404_NOT_FOUND)

        mensaje = request.data.get("mensaje", "").strip()
        if not mensaje:
            return Response(
                {"detail": "El mensaje es obligatorio."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # Build context for the AI
        from apps.ia.client import GroqClient, AIClientError

        contexto_cotizacion = (
            f"Negocio: {cotizacion.negocio.nombre}\n"
            f"Servicio: {cotizacion.cotizador.nombre}\n"
            f"Cliente: {cotizacion.prospecto_nombre} ({cotizacion.prospecto_email})\n"
            f"Total: ${cotizacion.total:,.0f} {cotizacion.moneda}\n"
            f"Desglose: {', '.join(d['regla'] + ': $' + d['valor'] for d in cotizacion.desglose_precio)}\n"
            f"Respuestas del cliente: {cotizacion.respuestas}\n"
            f"Descripcion actual:\n{cotizacion.descripcion_ia or '(sin descripcion)'}"
        )

        system_prompt = (
            f"Eres el asistente comercial de {cotizacion.negocio.nombre}. "
            f"Ayudas a editar y mejorar propuestas comerciales.\n\n"
            f"CONTEXTO DE LA COTIZACION:\n{contexto_cotizacion}\n\n"
            f"INSTRUCCIONES:\n"
            f"- Si el usuario pide cambiar la descripcion, genera una nueva descripcion completa (4 parrafos)\n"
            f"- Si pide ajustes menores, modifica solo lo necesario de la descripcion actual\n"
            f"- Si pide informacion, responde de forma concisa\n"
            f"- Tono profesional y directo, en espanol\n"
            f"- NO uses markdown, viñetas ni asteriscos. Solo texto plano\n"
            f"- Si generas una nueva descripcion, separa los parrafos con lineas vacias\n"
            f"- Responde en formato JSON: {{\"respuesta\": \"tu mensaje\", \"nueva_descripcion\": \"descripcion completa o null\"}}\n"
            f"- nueva_descripcion debe ser null si no se pidio cambiar la descripcion"
        )

        try:
            client = GroqClient()
            respuesta_raw = client.chat_sync(
                prompt=mensaje,
                system=system_prompt,
                json_mode=True,
                temperature=0.5,
            )

            import json

            try:
                data = json.loads(respuesta_raw)
            except json.JSONDecodeError:
                data = {"respuesta": respuesta_raw, "nueva_descripcion": None}

            respuesta_ia = data.get("respuesta", respuesta_raw)
            nueva_descripcion = data.get("nueva_descripcion")

            # If AI provided a new description, save it and regenerate PDF
            pdf_regenerado = False
            if nueva_descripcion and isinstance(nueva_descripcion, str) and nueva_descripcion.strip():
                cotizacion.descripcion_ia = nueva_descripcion.strip()
                cotizacion.save(update_fields=["descripcion_ia"])

                # Regenerate PDF with new description
                try:
                    pdf_bytes = CotizacionService.generar_pdf(cotizacion)
                    CotizacionService.subir_pdf_supabase(cotizacion, pdf_bytes)
                    pdf_regenerado = True
                except Exception as e:
                    logger.warning(f"Error regenerando PDF: {e}")

            cotizacion.refresh_from_db()
            return Response({
                "respuesta": respuesta_ia,
                "descripcion_actualizada": nueva_descripcion is not None and nueva_descripcion,
                "pdf_regenerado": pdf_regenerado,
                "cotizacion": CotizacionSerializer(cotizacion).data,
            })

        except AIClientError as e:
            logger.error(f"Error IA chat: {e}")
            return Response(
                {"detail": f"Error con el servicio de IA: {str(e)}"},
                status=status.HTTP_502_BAD_GATEWAY,
            )


class CotizacionReenviarView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, pk):
        try:
            cotizacion = Cotizacion.objects.select_related(
                "cotizador", "negocio", "negocio__owner"
            ).get(id=pk, negocio=request.user.negocio)
        except Cotizacion.DoesNotExist:
            return Response({"detail": "No encontrada."}, status=status.HTTP_404_NOT_FOUND)

        canal = request.data.get("canal", "email")

        if canal == "email":
            # Download PDF from URL or regenerate
            pdf_bytes = None
            try:
                pdf_bytes = CotizacionService.generar_pdf(cotizacion)
            except Exception as e:
                logger.warning(f"Error generando PDF para reenvio: {e}")

            try:
                CotizacionService.enviar_email_pdf(cotizacion, pdf_bytes=pdf_bytes)
                return Response({"detail": "Email enviado correctamente.", "canal": "email"})
            except Exception as e:
                return Response(
                    {"detail": f"Error enviando email: {str(e)}"},
                    status=status.HTTP_500_INTERNAL_SERVER_ERROR,
                )
        else:
            return Response({"detail": "Canal no soportado."}, status=status.HTTP_400_BAD_REQUEST)


class PropuestaPublicaView(APIView):
    """Vista publica para ver y aceptar/rechazar propuestas via token."""
    permission_classes = [AllowAny]

    def get(self, request, token):
        try:
            cotizacion = Cotizacion.objects.select_related(
                "cotizador", "negocio"
            ).get(token_aceptacion=token)
        except Cotizacion.DoesNotExist:
            return Response({"detail": "Propuesta no encontrada."}, status=status.HTTP_404_NOT_FOUND)

        return Response({
            "id": str(cotizacion.id),
            "negocio_nombre": cotizacion.negocio.nombre,
            "negocio_logo": cotizacion.negocio.logo_url,
            "color_primario": cotizacion.negocio.color_primario,
            "cotizador_nombre": cotizacion.cotizador.nombre,
            "prospecto_nombre": cotizacion.prospecto_nombre,
            "estado": cotizacion.estado,
            "total": str(cotizacion.total),
            "moneda": cotizacion.moneda,
            "desglose_precio": cotizacion.desglose_precio,
            "descripcion_ia": cotizacion.descripcion_ia,
            "pdf_url": cotizacion.pdf_url,
            "fecha_aceptacion": cotizacion.fecha_aceptacion,
            "created_at": cotizacion.created_at,
        })

    def post(self, request, token):
        try:
            cotizacion = Cotizacion.objects.select_related("negocio").get(token_aceptacion=token)
        except Cotizacion.DoesNotExist:
            return Response({"detail": "Propuesta no encontrada."}, status=status.HTTP_404_NOT_FOUND)

        accion = request.data.get("accion", "")
        if accion not in ("aceptar", "rechazar"):
            return Response({"detail": "Accion debe ser 'aceptar' o 'rechazar'."}, status=status.HTTP_400_BAD_REQUEST)

        if cotizacion.estado in ("aceptada", "rechazada"):
            return Response({"detail": f"Esta propuesta ya fue {cotizacion.estado}.", "estado": cotizacion.estado})

        from django.utils import timezone
        if accion == "aceptar":
            cotizacion.estado = Cotizacion.Estado.ACEPTADA
            cotizacion.fecha_aceptacion = timezone.now()
            cotizacion.ip_aceptacion = request.META.get("REMOTE_ADDR")
            cotizacion.save(update_fields=["estado", "fecha_aceptacion", "ip_aceptacion"])
        else:
            cotizacion.estado = Cotizacion.Estado.RECHAZADA
            cotizacion.save(update_fields=["estado"])

        return Response({"detail": f"Propuesta {accion}da correctamente.", "estado": cotizacion.estado})


class TrackingPixelView(APIView):
    """Tracking pixel: registra cuando el prospecto abre el email/PDF."""
    permission_classes = [AllowAny]

    def get(self, request, token):
        try:
            cotizacion = Cotizacion.objects.get(token_aceptacion=token)
            # Log the open event - store in notas field
            from django.utils import timezone
            nota = f"[{timezone.now().strftime('%Y-%m-%d %H:%M')}] Propuesta vista desde {request.META.get('REMOTE_ADDR', 'IP desconocida')}"
            if nota not in (cotizacion.notas or ""):
                cotizacion.notas = ((cotizacion.notas or "") + "\n" + nota).strip()
                cotizacion.save(update_fields=["notas"])
        except Cotizacion.DoesNotExist:
            pass

        # Return 1x1 transparent PNG
        import base64
        from django.http import HttpResponse
        pixel = base64.b64decode(
            "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=="
        )
        return HttpResponse(pixel, content_type="image/png", headers={"Cache-Control": "no-store"})
