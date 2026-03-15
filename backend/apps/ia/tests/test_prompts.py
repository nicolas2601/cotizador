from apps.ia.prompts import prompt_descripcion_propuesta, prompt_sugerir_precio


class TestPrompts:
    def test_prompt_descripcion_genera_texto(self):
        contexto = {
            "negocio_nombre": "Tikno",
            "cotizador_nombre": "Desarrollo Web",
            "cotizador_descripcion": "Cotizador de proyectos web",
            "respuestas": {"tipo": "ecommerce", "paginas": "10"},
            "total": 6000000,
        }
        result = prompt_descripcion_propuesta(contexto)
        assert "Tikno" in result
        assert "6,000,000" in result
        assert "Desarrollo Web" in result

    def test_prompt_sugerir_precio_genera_texto(self):
        contexto = {
            "cotizador_nombre": "Desarrollo Web",
            "total": 3500000,
            "desglose": [{"regla": "Base", "valor": 3500000}],
        }
        result = prompt_sugerir_precio(contexto)
        assert "3,500,000" in result
        assert "Bucaramanga" in result
