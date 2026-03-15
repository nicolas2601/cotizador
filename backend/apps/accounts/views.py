from rest_framework import status
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken

from .models import CustomUser
from .serializers import (
    LoginSerializer,
    NegocioSerializer,
    RegisterSerializer,
    UserProfileSerializer,
)


class RegisterView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = RegisterSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        refresh = RefreshToken.for_user(user)
        return Response(
            {
                "user": UserProfileSerializer(user).data,
                "access": str(refresh.access_token),
                "refresh": str(refresh),
            },
            status=status.HTTP_201_CREATED,
        )


class LoginView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = LoginSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.validated_data["user"]
        refresh = RefreshToken.for_user(user)
        return Response({
            "user": UserProfileSerializer(user).data,
            "access": str(refresh.access_token),
            "refresh": str(refresh),
        })


class MeView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        return Response(UserProfileSerializer(request.user).data)


class NegocioUpdateView(APIView):
    permission_classes = [IsAuthenticated]

    def patch(self, request):
        negocio = request.user.negocio
        serializer = NegocioSerializer(negocio, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(UserProfileSerializer(request.user).data)


class ForgotPasswordView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        from django.core.mail import send_mail
        from django.utils.crypto import get_random_string

        email = request.data.get("email", "").strip()
        if not email:
            return Response(
                {"detail": "El email es obligatorio."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            user = CustomUser.objects.get(email=email)
        except CustomUser.DoesNotExist:
            # No revelar si el email existe o no
            return Response({"detail": "Si el email esta registrado, recibiras un codigo."})

        code = get_random_string(length=6, allowed_chars="0123456789")
        # Guardar en cache o session - usamos un campo temporal
        from django.core.cache import cache
        cache.set(f"reset_code_{email}", code, timeout=600)  # 10 minutos

        send_mail(
            subject="Tikno Cotizador - Codigo de recuperacion",
            message=f"Tu codigo de recuperacion es: {code}\n\nEste codigo expira en 10 minutos.",
            from_email=None,
            recipient_list=[email],
        )

        return Response({"detail": "Si el email esta registrado, recibiras un codigo."})


class ResetPasswordView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        from django.core.cache import cache

        email = request.data.get("email", "").strip()
        code = request.data.get("code", "").strip()
        new_password = request.data.get("new_password", "")

        if not email or not code or not new_password:
            return Response(
                {"detail": "Email, codigo y nueva contrasena son obligatorios."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if len(new_password) < 8:
            return Response(
                {"detail": "La contrasena debe tener al menos 8 caracteres."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        stored_code = cache.get(f"reset_code_{email}")
        if not stored_code or stored_code != code:
            return Response(
                {"detail": "Codigo invalido o expirado."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            user = CustomUser.objects.get(email=email)
        except CustomUser.DoesNotExist:
            return Response(
                {"detail": "Codigo invalido o expirado."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        user.set_password(new_password)
        user.save()
        cache.delete(f"reset_code_{email}")

        return Response({"detail": "Contrasena actualizada correctamente."})


class LogoutView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        refresh_token = request.data.get("refresh")
        if not refresh_token:
            return Response(
                {"detail": "Se requiere el refresh token."},
                status=status.HTTP_400_BAD_REQUEST,
            )
        try:
            token = RefreshToken(refresh_token)
            token.blacklist()
        except Exception:
            return Response(
                {"detail": "Token invalido o ya expirado."},
                status=status.HTTP_400_BAD_REQUEST,
            )
        return Response({"detail": "Sesion cerrada."})
