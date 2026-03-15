from django.db import models

from apps.accounts.models import Negocio
from apps.common.models import BaseModel


class Cotizador(BaseModel):
    negocio = models.ForeignKey(
        Negocio,
        on_delete=models.CASCADE,
        related_name="cotizadores",
    )
    nombre = models.CharField(max_length=255)
    slug = models.SlugField(max_length=255)
    descripcion = models.TextField(blank=True)
    configuracion = models.JSONField(
        default=dict,
        help_text="Estructura: {pasos: [{id, titulo, descripcion, campos: [{id, tipo, label, requerido, opciones, min, max}]}]}",
    )
    activo = models.BooleanField(default=True)
    moneda = models.CharField(max_length=3, default="COP")

    class Meta:
        verbose_name = "cotizador"
        verbose_name_plural = "cotizadores"
        ordering = ["-created_at"]
        constraints = [
            models.UniqueConstraint(
                fields=["negocio", "slug"],
                name="unique_cotizador_slug_per_negocio",
            )
        ]

    def __str__(self):
        return f"{self.nombre} ({self.negocio.nombre})"


class ReglaPrecio(BaseModel):
    cotizador = models.ForeignKey(
        Cotizador,
        on_delete=models.CASCADE,
        related_name="reglas_precio",
    )
    nombre = models.CharField(max_length=255)
    formula = models.CharField(
        max_length=500,
        help_text="Ej: base * area + extra. Variables disponibles vienen del JSONField.",
    )
    variables = models.JSONField(
        default=dict,
        help_text='Ej: {"base": 50000, "extra": 10000}',
    )
    activa = models.BooleanField(default=True)
    prioridad = models.PositiveIntegerField(default=0)

    class Meta:
        verbose_name = "regla de precio"
        verbose_name_plural = "reglas de precio"
        ordering = ["prioridad", "-created_at"]

    def __str__(self):
        return f"{self.nombre} -> {self.formula}"
