from rest_framework import serializers

from .models import Cotizacion


class CotizacionSerializer(serializers.ModelSerializer):
    cotizador_nombre = serializers.CharField(source="cotizador.nombre", read_only=True)

    class Meta:
        model = Cotizacion
        fields = [
            "id", "cotizador", "cotizador_nombre", "estado",
            "prospecto_nombre", "prospecto_email", "prospecto_telefono", "prospecto_empresa",
            "respuestas", "desglose_precio", "subtotal", "total", "moneda",
            "descripcion_ia", "pdf_url", "notas",
            "created_at", "updated_at",
        ]
        read_only_fields = [
            "id", "desglose_precio", "subtotal", "total",
            "descripcion_ia", "pdf_url", "created_at", "updated_at",
        ]


class CotizacionPublicaSerializer(serializers.Serializer):
    nombre = serializers.CharField(max_length=255)
    email = serializers.EmailField()
    telefono = serializers.CharField(max_length=20, required=False, default="")
    empresa = serializers.CharField(max_length=255, required=False, default="")
    respuestas = serializers.DictField(child=serializers.CharField())


class EstadoSerializer(serializers.Serializer):
    estado = serializers.ChoiceField(choices=Cotizacion.Estado.choices)
