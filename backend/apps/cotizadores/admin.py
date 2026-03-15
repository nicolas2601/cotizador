from django.contrib import admin

from .models import Cotizador, ReglaPrecio


class ReglaPrecioInline(admin.TabularInline):
    model = ReglaPrecio
    extra = 1


@admin.register(Cotizador)
class CotizadorAdmin(admin.ModelAdmin):
    list_display = ("nombre", "negocio", "slug", "activo", "moneda", "created_at")
    list_filter = ("activo", "moneda")
    search_fields = ("nombre", "slug")
    inlines = [ReglaPrecioInline]


@admin.register(ReglaPrecio)
class ReglaPrecioAdmin(admin.ModelAdmin):
    list_display = ("nombre", "cotizador", "formula", "activa", "prioridad")
    list_filter = ("activa",)
