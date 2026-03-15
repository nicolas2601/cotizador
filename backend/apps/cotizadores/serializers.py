from rest_framework import serializers

from .models import Cotizador, ReglaPrecio

TIPOS_CAMPO_VALIDOS = {"texto", "numero", "seleccion", "area_m2", "slider"}


class ReglaPrecioSerializer(serializers.ModelSerializer):
    class Meta:
        model = ReglaPrecio
        fields = ["id", "nombre", "formula", "variables", "activa", "prioridad", "created_at"]
        read_only_fields = ["id", "created_at"]


class CotizadorSerializer(serializers.ModelSerializer):
    reglas_precio = ReglaPrecioSerializer(many=True, read_only=True)

    class Meta:
        model = Cotizador
        fields = [
            "id", "nombre", "slug", "descripcion", "configuracion",
            "activo", "moneda", "reglas_precio", "created_at", "updated_at",
        ]
        read_only_fields = ["id", "created_at", "updated_at"]

    def validate_configuracion(self, value):
        if not isinstance(value, dict):
            raise serializers.ValidationError("Debe ser un objeto JSON.")
        pasos = value.get("pasos")
        if not isinstance(pasos, list):
            raise serializers.ValidationError("Debe contener una lista 'pasos'.")
        for i, paso in enumerate(pasos):
            if not isinstance(paso, dict):
                raise serializers.ValidationError(f"Paso {i} debe ser un objeto.")
            if "titulo" not in paso:
                raise serializers.ValidationError(f"Paso {i} requiere 'titulo'.")
            campos = paso.get("campos", [])
            if not isinstance(campos, list):
                raise serializers.ValidationError(f"Paso {i}: 'campos' debe ser una lista.")
            for j, campo in enumerate(campos):
                if not isinstance(campo, dict):
                    raise serializers.ValidationError(f"Paso {i}, campo {j}: debe ser un objeto.")
                if "tipo" not in campo or "label" not in campo:
                    raise serializers.ValidationError(f"Paso {i}, campo {j}: requiere 'tipo' y 'label'.")
                if campo["tipo"] not in TIPOS_CAMPO_VALIDOS:
                    raise serializers.ValidationError(
                        f"Paso {i}, campo {j}: tipo '{campo['tipo']}' invalido. "
                        f"Validos: {', '.join(sorted(TIPOS_CAMPO_VALIDOS))}"
                    )
        return value


class CotizadorPublicoSerializer(serializers.ModelSerializer):
    negocio_nombre = serializers.CharField(source="negocio.nombre", read_only=True)
    negocio_logo = serializers.CharField(source="negocio.logo_url", read_only=True)

    class Meta:
        model = Cotizador
        fields = [
            "id", "nombre", "slug", "descripcion", "configuracion",
            "moneda", "negocio_nombre", "negocio_logo",
        ]


class CotizarRequestSerializer(serializers.Serializer):
    respuestas = serializers.DictField(child=serializers.CharField())
