from decimal import Decimal
from unittest.mock import patch

import pytest
from django.contrib.auth import get_user_model
from rest_framework.test import APIClient

from apps.accounts.models import Negocio
from apps.cotizaciones.models import Cotizacion
from apps.cotizaciones.services import CotizacionService
from apps.cotizadores.models import Cotizador, ReglaPrecio

User = get_user_model()


@pytest.fixture
def user(db):
    return User.objects.create_user(email="test@tikno.pro", password="test12345")


@pytest.fixture
def negocio(user):
    return Negocio.objects.get(owner=user)


@pytest.fixture
def cotizador(negocio):
    cot = Cotizador.objects.create(
        negocio=negocio,
        nombre="Desarrollo Web",
        slug="desarrollo-web",
        moneda="COP",
        configuracion={"pasos": [{"titulo": "Tipo", "campos": [{"id": "tipo", "tipo": "seleccion", "label": "Tipo"}]}]},
    )
    ReglaPrecio.objects.create(
        cotizador=cot,
        nombre="Base",
        formula="precio_base",
        variables={"precio_base": 3500000},
        prioridad=0,
    )
    return cot


@pytest.fixture
def client():
    return APIClient()


@pytest.mark.django_db
class TestCotizacionService:
    def test_crear_cotizacion(self, cotizador):
        cotizacion = CotizacionService.crear_cotizacion(
            cotizador=cotizador,
            datos_prospecto={"nombre": "Juan", "email": "juan@test.com"},
            respuestas={"tipo": "corporativo"},
        )
        assert cotizacion.prospecto_nombre == "Juan"
        assert cotizacion.estado == "pendiente"
        assert cotizacion.moneda == "COP"

    def test_calcular_y_guardar_precio(self, cotizador):
        cotizacion = CotizacionService.crear_cotizacion(
            cotizador=cotizador,
            datos_prospecto={"nombre": "Maria", "email": "maria@test.com"},
            respuestas={},
        )
        total = CotizacionService.calcular_y_guardar_precio(cotizacion)
        cotizacion.refresh_from_db()
        assert total == Decimal("3500000")
        assert cotizacion.total == Decimal("3500000")
        assert len(cotizacion.desglose_precio) == 1

    def test_generar_pdf(self, cotizador):
        cotizacion = CotizacionService.crear_cotizacion(
            cotizador=cotizador,
            datos_prospecto={"nombre": "Pedro", "email": "pedro@test.com"},
            respuestas={},
        )
        CotizacionService.calcular_y_guardar_precio(cotizacion)
        cotizacion.refresh_from_db()
        pdf_bytes = CotizacionService.generar_pdf(cotizacion)
        assert pdf_bytes[:4] == b"%PDF"
        assert len(pdf_bytes) > 1000


@pytest.mark.django_db
class TestCotizacionViews:
    def test_list_cotizaciones_authenticated(self, client, user, cotizador):
        CotizacionService.crear_cotizacion(
            cotizador=cotizador,
            datos_prospecto={"nombre": "Ana", "email": "ana@test.com"},
            respuestas={},
        )
        client.force_authenticate(user=user)
        response = client.get("/api/cotizaciones/")
        assert response.status_code == 200
        assert len(response.json()) == 1

    def test_list_cotizaciones_unauthenticated(self, client):
        response = client.get("/api/cotizaciones/")
        assert response.status_code == 401

    @patch("apps.cotizaciones.views.procesar_cotizacion.delay")
    def test_cotizar_publico(self, mock_task, client, cotizador, negocio):
        response = client.post(
            f"/api/public/{negocio.slug}/{cotizador.slug}/cotizar/",
            {
                "nombre": "Carlos",
                "email": "carlos@test.com",
                "respuestas": {"tipo": "ecommerce"},
            },
            format="json",
        )
        assert response.status_code == 201
        data = response.json()
        assert "cotizacion_id" in data
        assert data["estado"] == "pendiente"
        mock_task.assert_called_once()

    def test_actualizar_estado(self, client, user, cotizador):
        cotizacion = CotizacionService.crear_cotizacion(
            cotizador=cotizador,
            datos_prospecto={"nombre": "Luis", "email": "luis@test.com"},
            respuestas={},
        )
        client.force_authenticate(user=user)
        response = client.patch(
            f"/api/cotizaciones/{cotizacion.id}/estado/",
            {"estado": "aceptada"},
            format="json",
        )
        assert response.status_code == 200
        assert response.json()["estado"] == "aceptada"
