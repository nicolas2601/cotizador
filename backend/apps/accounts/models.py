from django.contrib.auth.models import AbstractUser, BaseUserManager
from django.db import models

from apps.common.models import BaseModel


class CustomUserManager(BaseUserManager):
    def create_user(self, email, password=None, **extra_fields):
        if not email:
            raise ValueError("El email es obligatorio")
        email = self.normalize_email(email)
        user = self.model(email=email, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, email, password=None, **extra_fields):
        extra_fields.setdefault("is_staff", True)
        extra_fields.setdefault("is_superuser", True)
        return self.create_user(email, password, **extra_fields)


class CustomUser(AbstractUser):
    username = None
    email = models.EmailField("correo electronico", unique=True)

    USERNAME_FIELD = "email"
    REQUIRED_FIELDS = []

    objects = CustomUserManager()

    class Meta:
        verbose_name = "usuario"
        verbose_name_plural = "usuarios"

    def __str__(self):
        return self.email


class Negocio(BaseModel):
    owner = models.OneToOneField(
        CustomUser,
        on_delete=models.CASCADE,
        related_name="negocio",
    )
    nombre = models.CharField("nombre del negocio", max_length=255)
    slug = models.SlugField(unique=True, max_length=255)
    logo_url = models.URLField("URL del logo", blank=True, default="")
    telefono = models.CharField(max_length=20, blank=True)
    direccion = models.TextField(blank=True)
    sitio_web = models.URLField(blank=True)
    color_primario = models.CharField(max_length=7, default="#000000")
    activo = models.BooleanField(default=True)

    class Meta:
        verbose_name = "negocio"
        verbose_name_plural = "negocios"
        ordering = ["-created_at"]

    def __str__(self):
        return self.nombre
