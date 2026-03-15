"""
Seed de datos reales de Tikno (tikno.pro).
Precios basados en los planes oficiales de la agencia.

Ejecutar: uv run python manage.py shell < scripts/seed_tikno.py
"""
import os
import sys

import django

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "config.settings.local")
django.setup()

from apps.accounts.models import CustomUser, Negocio
from apps.cotizadores.models import Cotizador, ReglaPrecio

# --- Usuario y Negocio ---
email = "admin@tikno.pro"
user, created = CustomUser.objects.get_or_create(
    email=email,
    defaults={"is_staff": True, "is_superuser": True},
)
if created:
    user.set_password("tikno2026")
    user.save()
    print(f"Usuario creado: {email} / tikno2026")
else:
    print(f"Usuario ya existe: {email}")

negocio = Negocio.objects.filter(owner=user).first()
if negocio:
    negocio.nombre = "Tikno"
    negocio.slug = "tikno"
    negocio.telefono = "+57 350 232 8517"
    negocio.sitio_web = "https://tikno.pro"
    negocio.color_primario = "#800080"
    negocio.direccion = "Bucaramanga, Santander, Colombia"
    negocio.save()
    print(f"Negocio actualizado: {negocio.nombre}")
else:
    print("ERROR: Negocio no fue creado por el signal")
    sys.exit(1)

# --- Cotizador: Desarrollo Web Tikno ---
cotizador, _ = Cotizador.objects.update_or_create(
    negocio=negocio,
    slug="desarrollo-web",
    defaults={
        "nombre": "Cotizador Desarrollo Web - Tikno",
        "descripcion": (
            "Cotiza tu proyecto de desarrollo web con Tikno. "
            "Desarrollo a medida, e-commerce, aplicaciones web y mas. "
            "Precios en pesos colombianos."
        ),
        "moneda": "COP",
        "activo": True,
        "configuracion": {
            "pasos": [
                {
                    "id": "paso-tipo",
                    "titulo": "Tipo de Proyecto",
                    "descripcion": "Selecciona el tipo de proyecto que necesitas",
                    "campos": [
                        {
                            "id": "tipo_proyecto",
                            "tipo": "seleccion",
                            "label": "Tipo de proyecto",
                            "requerido": True,
                            "opciones": [
                                {
                                    "label": "Landing Page (hasta 5 paginas)",
                                    "valor": "1990000",
                                },
                                {
                                    "label": "E-commerce / App Web a medida",
                                    "valor": "4990000",
                                },
                                {
                                    "label": "Aplicacion Web completa + API",
                                    "valor": "9990000",
                                },
                                {
                                    "label": "Solucion Enterprise (equipo dedicado)",
                                    "valor": "19990000",
                                },
                            ],
                        }
                    ],
                },
                {
                    "id": "paso-alcance",
                    "titulo": "Alcance del Proyecto",
                    "descripcion": "Define el alcance y funcionalidades adicionales",
                    "campos": [
                        {
                            "id": "num_paginas",
                            "tipo": "slider",
                            "label": "Numero de paginas o modulos",
                            "requerido": True,
                            "min": 1,
                            "max": 30,
                            "step": 1,
                            "unidad": "paginas",
                        },
                        {
                            "id": "integraciones",
                            "tipo": "seleccion",
                            "label": "Integraciones necesarias",
                            "requerido": True,
                            "opciones": [
                                {"label": "Ninguna", "valor": "0"},
                                {
                                    "label": "WhatsApp Business + Formularios",
                                    "valor": "490000",
                                },
                                {
                                    "label": "Pasarela de pagos (Wompi/Stripe)",
                                    "valor": "890000",
                                },
                                {
                                    "label": "CRM + Automatizaciones",
                                    "valor": "1490000",
                                },
                            ],
                        },
                    ],
                },
                {
                    "id": "paso-urgencia",
                    "titulo": "Urgencia y Extras",
                    "descripcion": "Tiempos de entrega y servicios adicionales",
                    "campos": [
                        {
                            "id": "urgencia",
                            "tipo": "seleccion",
                            "label": "Tiempo de entrega",
                            "requerido": True,
                            "opciones": [
                                {"label": "Normal (segun plan)", "valor": "1"},
                                {"label": "Urgente (-30% tiempo, +40% costo)", "valor": "1.4"},
                            ],
                        },
                        {
                            "id": "soporte",
                            "tipo": "seleccion",
                            "label": "Soporte post-lanzamiento",
                            "requerido": False,
                            "opciones": [
                                {"label": "Incluido en el plan", "valor": "0"},
                                {
                                    "label": "Soporte mensual ($490.000/mes x 3 meses)",
                                    "valor": "1470000",
                                },
                                {
                                    "label": "Pack SEO Avanzado",
                                    "valor": "890000",
                                },
                            ],
                        },
                    ],
                },
            ]
        },
    },
)
print(f"Cotizador: {cotizador.nombre} (slug: {cotizador.slug})")

# --- Reglas de Precio ---
ReglaPrecio.objects.filter(cotizador=cotizador).delete()

ReglaPrecio.objects.create(
    cotizador=cotizador,
    nombre="Precio base del plan",
    formula="tipo_proyecto * urgencia",
    variables={},
    activa=True,
    prioridad=0,
)

ReglaPrecio.objects.create(
    cotizador=cotizador,
    nombre="Paginas/modulos adicionales",
    formula="num_paginas * costo_por_pagina",
    variables={"costo_por_pagina": 180000},
    activa=True,
    prioridad=1,
)

ReglaPrecio.objects.create(
    cotizador=cotizador,
    nombre="Integraciones",
    formula="integraciones",
    variables={},
    activa=True,
    prioridad=2,
)

ReglaPrecio.objects.create(
    cotizador=cotizador,
    nombre="Soporte adicional",
    formula="soporte",
    variables={},
    activa=True,
    prioridad=3,
)

print("Reglas de precio creadas (4 reglas)")
print()
print("=" * 50)
print("SEED COMPLETADO")
print(f"URL publica: /q/tikno--desarrollo-web")
print(f"Admin: {email} / tikno2026")
print("=" * 50)
