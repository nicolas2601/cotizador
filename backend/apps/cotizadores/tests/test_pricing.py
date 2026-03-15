from decimal import Decimal

import pytest
from django.contrib.auth import get_user_model

from apps.accounts.models import Negocio
from apps.cotizadores.models import Cotizador, ReglaPrecio
from apps.cotizadores.services import FormulaError, calcular_precio, parse_formula

User = get_user_model()


@pytest.fixture
def negocio(db):
    user = User.objects.create_user(email="tikno@tikno.pro", password="test12345")
    return Negocio.objects.get(owner=user)


@pytest.fixture
def cotizador_tikno(negocio):
    return Cotizador.objects.create(
        negocio=negocio,
        nombre="Cotizador Desarrollo Web - Tikno",
        slug="desarrollo-web",
        descripcion="Cotiza tu proyecto de desarrollo web con Tikno",
        moneda="COP",
        configuracion={
            "pasos": [
                {
                    "id": "paso-1",
                    "titulo": "Tipo de Proyecto",
                    "descripcion": "Selecciona el tipo de proyecto",
                    "campos": [
                        {
                            "id": "tipo_proyecto",
                            "tipo": "seleccion",
                            "label": "Tipo de proyecto",
                            "requerido": True,
                            "opciones": [
                                {"label": "Landing Page", "valor": "1500000"},
                                {"label": "Sitio Web Corporativo", "valor": "3500000"},
                                {"label": "E-commerce", "valor": "6000000"},
                                {"label": "Aplicacion Web", "valor": "8000000"},
                            ],
                        }
                    ],
                },
                {
                    "id": "paso-2",
                    "titulo": "Cantidad de Paginas",
                    "campos": [
                        {
                            "id": "num_paginas",
                            "tipo": "slider",
                            "label": "Numero de paginas",
                            "requerido": True,
                            "min": 1,
                            "max": 20,
                        }
                    ],
                },
            ]
        },
    )


@pytest.fixture
def regla_base(cotizador_tikno):
    return ReglaPrecio.objects.create(
        cotizador=cotizador_tikno,
        nombre="Precio base del proyecto",
        formula="tipo_proyecto",
        variables={},
        prioridad=0,
    )


@pytest.fixture
def regla_paginas(cotizador_tikno):
    return ReglaPrecio.objects.create(
        cotizador=cotizador_tikno,
        nombre="Costo por pagina adicional",
        formula="num_paginas * precio_por_pagina",
        variables={"precio_por_pagina": 150000},
        prioridad=1,
    )


class TestParseFormula:
    def test_formula_simple(self):
        result = parse_formula("base * area", {"base": 50000, "area": 120})
        assert result == Decimal("6000000")

    def test_formula_suma(self):
        result = parse_formula("base + diseno", {"base": 3500000, "diseno": 800000})
        assert result == Decimal("4300000")

    def test_formula_compleja(self):
        result = parse_formula(
            "(base + extra) * cantidad",
            {"base": 1500000, "extra": 300000, "cantidad": 2},
        )
        assert result == Decimal("3600000")

    def test_formula_con_numeros_literales(self):
        result = parse_formula("precio * 1.19", {"precio": 5000000})
        assert result == Decimal("5950000.00")

    def test_formula_invalida(self):
        with pytest.raises(FormulaError, match="Variable desconocida"):
            parse_formula("base * inexistente", {"base": 100})

    def test_formula_vacia(self):
        with pytest.raises(FormulaError, match="vacia"):
            parse_formula("", {})

    def test_division_por_cero(self):
        with pytest.raises(FormulaError, match="Division por cero"):
            parse_formula("base / cero", {"base": 100, "cero": 0})


@pytest.mark.django_db
class TestCalcularPrecio:
    def test_formula_simple(self, cotizador_tikno, regla_base):
        resultado = calcular_precio(cotizador_tikno.id, {"tipo_proyecto": "1500000"})
        assert resultado["total"] == Decimal("1500000")
        assert resultado["moneda"] == "COP"

    def test_formula_con_selector(self, cotizador_tikno, regla_base, regla_paginas):
        resultado = calcular_precio(
            cotizador_tikno.id,
            {"tipo_proyecto": "6000000", "num_paginas": "5"},
        )
        assert resultado["total"] == Decimal("6750000")
        assert len(resultado["desglose"]) == 2
        assert resultado["desglose"][0]["valor"] == Decimal("6000000")
        assert resultado["desglose"][1]["valor"] == Decimal("750000")

    def test_formula_invalida(self, cotizador_tikno):
        with pytest.raises(FormulaError, match="no tiene reglas de precio"):
            calcular_precio(cotizador_tikno.id, {"tipo_proyecto": "1500000"})
