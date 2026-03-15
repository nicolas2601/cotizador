from django.contrib import admin

from .models import Cotizacion


@admin.register(Cotizacion)
class CotizacionAdmin(admin.ModelAdmin):
    list_display = ("prospecto_nombre", "cotizador", "total", "moneda", "estado", "created_at")
    list_filter = ("estado", "moneda")
    search_fields = ("prospecto_nombre", "prospecto_email")
    readonly_fields = ("desglose_precio", "descripcion_ia", "pdf_url")
