from django.utils.decorators import method_decorator
from django_ratelimit.decorators import ratelimit
from rest_framework import status
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.cotizadores.models import Cotizador

from .models import Cotizacion
from .serializers import CotizacionPublicaSerializer, CotizacionSerializer, EstadoSerializer
from .services import CotizacionService
from .tasks import procesar_cotizacion


@method_decorator(ratelimit(key='ip', rate='10/m', method='POST'), name='post')
class CotizarPublicoView(APIView):
    permission_classes = [AllowAny]

    def post(self, request, negocio_slug, cotizador_slug):
        try:
            cotizador = Cotizador.objects.select_related("negocio").get(
                negocio__slug=negocio_slug, slug=cotizador_slug, activo=True,
            )
        except Cotizador.DoesNotExist:
            return Response({"detail": "Cotizador no encontrado."}, status=status.HTTP_404_NOT_FOUND)

        serializer = CotizacionPublicaSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        data = serializer.validated_data

        cotizacion = CotizacionService.crear_cotizacion(
            cotizador=cotizador,
            datos_prospecto={
                "nombre": data["nombre"],
                "email": data["email"],
                "telefono": data.get("telefono", ""),
                "empresa": data.get("empresa", ""),
            },
            respuestas=data["respuestas"],
        )

        procesar_cotizacion.delay(str(cotizacion.id))

        return Response(
            {"cotizacion_id": str(cotizacion.id), "estado": cotizacion.estado},
            status=status.HTTP_201_CREATED,
        )


class CotizacionListView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        cotizaciones = Cotizacion.objects.filter(
            negocio=request.user.negocio
        ).select_related("cotizador")
        serializer = CotizacionSerializer(cotizaciones, many=True)
        return Response(serializer.data)


class CotizacionDetailView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, pk):
        try:
            cotizacion = Cotizacion.objects.get(id=pk, negocio=request.user.negocio)
        except Cotizacion.DoesNotExist:
            return Response({"detail": "No encontrada."}, status=status.HTTP_404_NOT_FOUND)
        return Response(CotizacionSerializer(cotizacion).data)


class CotizacionEstadoView(APIView):
    permission_classes = [IsAuthenticated]

    def patch(self, request, pk):
        try:
            cotizacion = Cotizacion.objects.get(id=pk, negocio=request.user.negocio)
        except Cotizacion.DoesNotExist:
            return Response({"detail": "No encontrada."}, status=status.HTTP_404_NOT_FOUND)
        serializer = EstadoSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        cotizacion.estado = serializer.validated_data["estado"]
        cotizacion.save(update_fields=["estado"])
        return Response(CotizacionSerializer(cotizacion).data)
