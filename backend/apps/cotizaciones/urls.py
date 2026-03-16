from django.urls import path

from . import views

app_name = "cotizaciones"

urlpatterns = [
    path("", views.CotizacionListView.as_view(), name="list"),
    path("<uuid:pk>/", views.CotizacionDetailView.as_view(), name="detail"),
    path("<uuid:pk>/estado/", views.CotizacionEstadoView.as_view(), name="estado"),
    path("<uuid:pk>/chat-ia/", views.CotizacionChatIAView.as_view(), name="chat-ia"),
    path("<uuid:pk>/reenviar/", views.CotizacionReenviarView.as_view(), name="reenviar"),
]
