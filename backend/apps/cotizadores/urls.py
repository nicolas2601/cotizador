from django.urls import include, path
from rest_framework.routers import DefaultRouter

from . import views

router = DefaultRouter()
router.register(r"", views.CotizadorViewSet, basename="cotizador")

app_name = "cotizadores"

urlpatterns = [
    path(
        "<uuid:cotizador_pk>/reglas/",
        views.ReglaPrecioViewSet.as_view({"get": "list", "post": "create"}),
        name="reglas-list",
    ),
    path(
        "<uuid:cotizador_pk>/reglas/<uuid:pk>/",
        views.ReglaPrecioViewSet.as_view({"get": "retrieve", "put": "update", "patch": "partial_update", "delete": "destroy"}),
        name="reglas-detail",
    ),
    path("", include(router.urls)),
]
