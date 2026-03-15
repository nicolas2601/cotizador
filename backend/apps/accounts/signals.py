from django.db.models.signals import post_save
from django.dispatch import receiver
from django.utils.text import slugify

from .models import CustomUser, Negocio


@receiver(post_save, sender=CustomUser)
def crear_negocio_para_usuario(sender, instance, created, **kwargs):
    if created and not hasattr(instance, "_skip_signal"):
        if not Negocio.objects.filter(owner=instance).exists():
            base_slug = slugify(instance.email.split("@")[0])
            slug = base_slug
            counter = 1
            while Negocio.objects.filter(slug=slug).exists():
                slug = f"{base_slug}-{counter}"
                counter += 1
            Negocio.objects.create(
                owner=instance,
                nombre=instance.email.split("@")[0],
                slug=slug,
            )
