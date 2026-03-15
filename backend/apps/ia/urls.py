from django.urls import path

from .views import GenerarCotizadorView

app_name = "ia"

urlpatterns = [
    path("generar-cotizador/", GenerarCotizadorView.as_view(), name="generar-cotizador"),
]
