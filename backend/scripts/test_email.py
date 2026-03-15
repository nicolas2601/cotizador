import django
django.setup()
from django.core.mail import send_mail
from django.conf import settings

send_mail(
    subject="Test Tikno Cotizador",
    message="Si recibes este correo, el envio de emails funciona correctamente.",
    from_email=settings.DEFAULT_FROM_EMAIL,
    recipient_list=["tiknocol@gmail.com"],
)
print("Email enviado exitosamente")
