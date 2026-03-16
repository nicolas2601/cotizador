from django.conf import settings
from django.conf.urls.static import static
from django.contrib import admin
from django.urls import include, path

from apps.cotizaciones.views import PropuestaPublicaView, TrackingPixelView

urlpatterns = [
    path("admin/", admin.site.urls),
    path("api/auth/", include("apps.accounts.urls")),
    path("api/cotizadores/", include("apps.cotizadores.urls")),
    path("api/cotizaciones/", include("apps.cotizaciones.urls")),
    path("api/public/", include("apps.cotizadores.urls_public")),
    path("api/ia/", include("apps.ia.urls")),
    path("api/propuesta/<str:token>/", PropuestaPublicaView.as_view(), name="propuesta-publica"),
    path("api/t/<str:token>.png", TrackingPixelView.as_view(), name="tracking-pixel"),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
