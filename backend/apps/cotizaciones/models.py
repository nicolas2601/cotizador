from django.db import models

from apps.accounts.models import Negocio
from apps.common.models import BaseModel
from apps.cotizadores.models import Cotizador


class Cotizacion(BaseModel):
    class Estado(models.TextChoices):
        PENDIENTE = "pendiente", "Pendiente"
        PROCESANDO = "procesando", "Procesando"
        LISTA = "lista", "Lista"
        ENVIADA = "enviada", "Enviada"
        ACEPTADA = "aceptada", "Aceptada"
        RECHAZADA = "rechazada", "Rechazada"
        ERROR = "error", "Error"

    cotizador = models.ForeignKey(
        Cotizador,
        on_delete=models.CASCADE,
        related_name="cotizaciones",
    )
    negocio = models.ForeignKey(
        Negocio,
        on_delete=models.CASCADE,
        related_name="cotizaciones",
    )
    estado = models.CharField(
        max_length=20,
        choices=Estado.choices,
        default=Estado.PENDIENTE,
    )

    # Datos del prospecto
    prospecto_nombre = models.CharField(max_length=255)
    prospecto_email = models.EmailField()
    prospecto_telefono = models.CharField(max_length=20, blank=True)
    prospecto_empresa = models.CharField(max_length=255, blank=True)

    # Respuestas y precio
    respuestas = models.JSONField(default=dict)
    desglose_precio = models.JSONField(default=list)
    subtotal = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    total = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    moneda = models.CharField(max_length=3, default="COP")

    # IA y PDF
    descripcion_ia = models.TextField(blank=True)
    pdf_url = models.URLField(blank=True)

    # Notas internas
    notas = models.TextField(blank=True)

    class Meta:
        verbose_name = "cotizacion"
        verbose_name_plural = "cotizaciones"
        ordering = ["-created_at"]

    def __str__(self):
        return f"Cotizacion {self.prospecto_nombre} - ${self.total:,.0f} {self.moneda}"
