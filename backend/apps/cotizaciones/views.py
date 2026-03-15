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
    from .models import Cotizacion as CotModel

    try:
        cotizacion = CotModel.objects.get(id=cotizacion_id)
        cotizacion.estado = CotModel.Estado.PROCESANDO
        cotizacion.save(update_fields=["estado"])

        CotizacionService.calcular_y_guardar_precio(cotizacion)
        CotizacionService.generar_descripcion_ia(cotizacion)

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
        serializer.is_valid(raise_exception=True)
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
