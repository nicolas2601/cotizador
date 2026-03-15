import pytest
from django.contrib.auth import get_user_model
from rest_framework.test import APIClient

from apps.accounts.models import Negocio

User = get_user_model()

REGISTER_URL = "/api/auth/register/"
LOGIN_URL = "/api/auth/login/"
ME_URL = "/api/auth/me/"


@pytest.fixture
def client():
    return APIClient()


@pytest.fixture
def register_payload():
    return {
        "email": "nuevo@tikno.pro",
        "password": "segura12345",
        "nombre_negocio": "Mi Negocio Test",
        "slug": "mi-negocio-test",
    }


@pytest.mark.django_db
class TestRegister:
    def test_register_creates_user_and_negocio(self, client, register_payload):
        response = client.post(REGISTER_URL, register_payload)
        assert response.status_code == 201
        data = response.json()
        assert "access" in data
        assert "refresh" in data
        assert data["user"]["email"] == "nuevo@tikno.pro"
        user = User.objects.get(email="nuevo@tikno.pro")
        negocio = Negocio.objects.get(owner=user)
        assert negocio.nombre == "Mi Negocio Test"
        assert negocio.slug == "mi-negocio-test"

    def test_register_duplicate_email_fails(self, client, register_payload):
        client.post(REGISTER_URL, register_payload)
        response = client.post(REGISTER_URL, register_payload)
        assert response.status_code == 400


@pytest.mark.django_db
class TestLogin:
    def test_login_returns_jwt(self, client, register_payload):
        client.post(REGISTER_URL, register_payload)
        response = client.post(LOGIN_URL, {
            "email": register_payload["email"],
            "password": register_payload["password"],
        })
        assert response.status_code == 200
        data = response.json()
        assert "access" in data
        assert "refresh" in data

    def test_login_wrong_password_fails(self, client, register_payload):
        client.post(REGISTER_URL, register_payload)
        response = client.post(LOGIN_URL, {
            "email": register_payload["email"],
            "password": "wrongpassword",
        })
        assert response.status_code == 400


@pytest.mark.django_db
class TestMe:
    def test_me_returns_correct_negocio(self, client, register_payload):
        reg = client.post(REGISTER_URL, register_payload)
        token = reg.json()["access"]
        client.credentials(HTTP_AUTHORIZATION=f"Bearer {token}")
        response = client.get(ME_URL)
        assert response.status_code == 200
        data = response.json()
        assert data["email"] == register_payload["email"]
        assert data["negocio"]["nombre"] == register_payload["nombre_negocio"]

    def test_me_unauthenticated_fails(self, client):
        response = client.get(ME_URL)
        assert response.status_code == 401
