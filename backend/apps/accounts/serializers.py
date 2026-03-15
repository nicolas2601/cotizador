from django.contrib.auth import authenticate
from rest_framework import serializers

from .models import CustomUser, Negocio


class NegocioSerializer(serializers.ModelSerializer):
    logo_url = serializers.ReadOnlyField()

    class Meta:
        model = Negocio
        fields = [
            "id", "nombre", "slug", "logo_url", "telefono",
            "direccion", "sitio_web", "color_primario", "activo", "created_at",
        ]
        read_only_fields = ["id", "created_at"]


class UserProfileSerializer(serializers.ModelSerializer):
    negocio = NegocioSerializer(read_only=True)

    class Meta:
        model = CustomUser
        fields = ["id", "email", "first_name", "last_name", "negocio"]
        read_only_fields = ["id", "email"]


class RegisterSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField(min_length=8, write_only=True)
    nombre_negocio = serializers.CharField(max_length=255)
    slug = serializers.SlugField(max_length=255)

    def validate_email(self, value):
        if CustomUser.objects.filter(email=value).exists():
            raise serializers.ValidationError("Ya existe un usuario con este email.")
        return value

    def validate_slug(self, value):
        if Negocio.objects.filter(slug=value).exists():
            raise serializers.ValidationError("Este slug ya esta en uso.")
        return value

    def create(self, validated_data):
        user = CustomUser.objects.create_user(
            email=validated_data["email"],
            password=validated_data["password"],
        )
        user._skip_signal = True
        negocio, created = Negocio.objects.get_or_create(
            owner=user,
            defaults={
                "nombre": validated_data["nombre_negocio"],
                "slug": validated_data["slug"],
            },
        )
        if not created:
            negocio.nombre = validated_data["nombre_negocio"]
            negocio.slug = validated_data["slug"]
            negocio.save()
        return user


class LoginSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True)

    def validate(self, data):
        user = authenticate(email=data["email"], password=data["password"])
        if not user:
            raise serializers.ValidationError("Credenciales invalidas.")
        data["user"] = user
        return data
