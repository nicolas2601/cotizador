from rest_framework import status, viewsets
from rest_framework.decorators import action
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import Cotizador, ReglaPrecio
from .serializers import (
    CotizadorPublicoSerializer,
    CotizadorSerializer,
    CotizarRequestSerializer,
    ReglaPrecioSerializer,
)
from .services import FormulaError, calcular_precio


class CotizadorViewSet(viewsets.ModelViewSet):
    serializer_class = CotizadorSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Cotizador.objects.filter(
            negocio=self.request.user.negocio
        ).prefetch_related("reglas_precio")

    def perform_create(self, serializer):
        serializer.save(negocio=self.request.user.negocio)

    @action(detail=True, methods=["post"])
    def preview(self, request, pk=None):
        cotizador = self.get_object()
        serializer = CotizarRequestSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        try:
            resultado = calcular_precio(cotizador.id, serializer.validated_data["respuestas"])
        except FormulaError as e:
            return Response({"detail": str(e)}, status=status.HTTP_400_BAD_REQUEST)
        return Response(resultado)

    @action(detail=True, methods=["get"])
    def estadisticas(self, request, pk=None):
        cotizador = self.get_object()
        cotizaciones = cotizador.cotizaciones.all()
        total = cotizaciones.count()
        aceptadas = cotizaciones.filter(estado="aceptada").count()
        return Response({
            "total_cotizaciones": total,
            "aceptadas": aceptadas,
            "tasa_aceptacion": round(aceptadas / total * 100, 1) if total > 0 else 0,
        })


class ReglaPrecioViewSet(viewsets.ModelViewSet):
    serializer_class = ReglaPrecioSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return ReglaPrecio.objects.filter(
            cotizador__negocio=self.request.user.negocio,
            cotizador_id=self.kwargs["cotizador_pk"],
        )

    def perform_create(self, serializer):
        cotizador = Cotizador.objects.get(
            id=self.kwargs["cotizador_pk"],
            negocio=self.request.user.negocio,
        )
        serializer.save(cotizador=cotizador)


class CotizadorPublicoView(APIView):
    permission_classes = [AllowAny]

    def get(self, request, negocio_slug, cotizador_slug):
        try:
            cotizador = Cotizador.objects.select_related("negocio").get(
                negocio__slug=negocio_slug, slug=cotizador_slug, activo=True,
            )
        except Cotizador.DoesNotExist:
            return Response({"detail": "Cotizador no encontrado."}, status=status.HTTP_404_NOT_FOUND)
        return Response(CotizadorPublicoSerializer(cotizador).data)


class CotizarPublicoView(APIView):
    permission_classes = [AllowAny]

    def post(self, request, negocio_slug, cotizador_slug):
        try:
            cotizador = Cotizador.objects.get(
                negocio__slug=negocio_slug, slug=cotizador_slug, activo=True,
            )
        except Cotizador.DoesNotExist:
            return Response({"detail": "Cotizador no encontrado."}, status=status.HTTP_404_NOT_FOUND)
        serializer = CotizarRequestSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        try:
            resultado = calcular_precio(cotizador.id, serializer.validated_data["respuestas"])
        except FormulaError as e:
            return Response({"detail": str(e)}, status=status.HTTP_400_BAD_REQUEST)
        return Response(resultado)
