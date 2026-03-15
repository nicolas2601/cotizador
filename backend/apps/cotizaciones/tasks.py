import logging

from celery import shared_task

from .models import Cotizacion
from .services import CotizacionService

logger = logging.getLogger(__name__)


@shared_task(bind=True, max_retries=3, default_retry_delay=30)
def procesar_cotizacion(self, cotizacion_id: str):
    try:
        cotizacion = Cotizacion.objects.get(id=cotizacion_id)
    except Cotizacion.DoesNotExist:
        logger.error(f"Cotizacion {cotizacion_id} no encontrada")
        return

    cotizacion.estado = Cotizacion.Estado.PROCESANDO
    cotizacion.save(update_fields=["estado"])

    try:
        CotizacionService.calcular_y_guardar_precio(cotizacion)

        CotizacionService.generar_descripcion_ia(cotizacion)

        pdf_bytes = CotizacionService.generar_pdf(cotizacion)

        CotizacionService.subir_pdf_supabase(cotizacion, pdf_bytes)

        CotizacionService.enviar_email_pdf(cotizacion)

        cotizacion.estado = Cotizacion.Estado.LISTA
        cotizacion.save(update_fields=["estado"])

        logger.info(f"Cotizacion {cotizacion_id} procesada correctamente")

    except Exception as exc:
        cotizacion.estado = Cotizacion.Estado.ERROR
        cotizacion.save(update_fields=["estado"])
        logger.error(f"Error procesando cotizacion {cotizacion_id}: {exc}")
        raise self.retry(exc=exc)
