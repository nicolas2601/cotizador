from django.urls import path

from apps.cotizaciones.views import CotizarPublicoView

from . import views

app_name = "cotizadores_public"

urlpatterns = [
    path("<slug:negocio_slug>/<slug:cotizador_slug>/", views.CotizadorPublicoView.as_view(), name="cotizador-publico"),
    path("<slug:negocio_slug>/<slug:cotizador_slug>/cotizar/", CotizarPublicoView.as_view(), name="cotizar-publico"),
]
