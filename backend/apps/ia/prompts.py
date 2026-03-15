def prompt_descripcion_propuesta(contexto: dict) -> str:
    return f"""Genera una descripcion profesional en espanol para una propuesta comercial.

Datos del negocio: {contexto.get('negocio_nombre', 'N/A')}
Servicio cotizado: {contexto.get('cotizador_nombre', 'N/A')}
Descripcion del cotizador: {contexto.get('cotizador_descripcion', 'N/A')}

Respuestas del cliente:
{_formatear_respuestas(contexto.get('respuestas', {}))}

Precio total: ${contexto.get('total', 0):,.0f} COP

Escribe 2-3 parrafos describiendo:
1. Que incluye el servicio segun las opciones seleccionadas
2. El valor que aporta al cliente
3. Plazos estimados y entregables

Tono profesional pero cercano. No uses markdown, solo texto plano."""


def prompt_sugerir_precio(contexto: dict) -> str:
    return f"""Analiza si el siguiente precio es competitivo para el mercado colombiano.

Servicio: {contexto.get('cotizador_nombre', 'N/A')}
Ubicacion: Bucaramanga, Colombia
Precio calculado: ${contexto.get('total', 0):,.0f} COP

Desglose:
{_formatear_desglose(contexto.get('desglose', []))}

Responde en espanol con:
1. Si el precio esta dentro del rango del mercado
2. Sugerencia de ajuste si aplica
3. Argumentos de venta para justificar el precio

Maximo 150 palabras. Sin markdown."""


def _formatear_respuestas(respuestas: dict) -> str:
    if not respuestas:
        return "Sin respuestas"
    return "\n".join(f"- {k}: {v}" for k, v in respuestas.items())


def _formatear_desglose(desglose: list) -> str:
    if not desglose:
        return "Sin desglose"
    return "\n".join(f"- {item['regla']}: ${item['valor']:,.0f} COP" for item in desglose)


def prompt_generar_cotizador(descripcion: str) -> str:
    return f"""Eres un experto en crear cotizadores para negocios en Colombia.

El usuario describe su negocio asi:
"{descripcion}"

Genera un JSON completo para configurar un cotizador automatico. El JSON debe tener EXACTAMENTE esta estructura:

{{
  "nombre": "Nombre del cotizador",
  "slug": "nombre-del-cotizador",
  "descripcion": "Descripcion breve del cotizador",
  "configuracion": {{
    "pasos": [
      {{
        "id": "un-uuid-unico",
        "titulo": "Titulo del paso",
        "descripcion": "Que se pregunta en este paso",
        "campos": [
          {{
            "id": "identificador_snake_case",
            "tipo": "seleccion",
            "label": "Etiqueta visible",
            "requerido": true,
            "opciones": [{{"label": "Opcion 1", "valor": "50000"}}, {{"label": "Opcion 2", "valor": "80000"}}],
            "min": null,
            "max": null,
            "step": null,
            "unidad": null
          }}
        ]
      }}
    ]
  }},
  "reglas_precio": [
    {{
      "nombre": "Nombre de la regla",
      "formula": "variable1 + variable2 * cantidad",
      "variables": {{"margen": 1.2}},
      "prioridad": 1
    }}
  ]
}}

REGLAS OBLIGATORIAS:
1. Los tipos de campo validos son UNICAMENTE: "seleccion", "numero", "slider", "texto", "area_m2".
2. Los IDs de los campos DEBEN ser snake_case sin espacios ni caracteres especiales (ej: tipo_servicio, cantidad_personas). Estos IDs se usan como variables en las formulas.
3. Las formulas en reglas_precio usan los IDs de los campos como variables. Solo operadores permitidos: + - * / ( ).
4. Los precios deben ser realistas en Pesos Colombianos (COP). Por ejemplo: una consulta medica entre 50,000 y 150,000 COP, un servicio profesional entre 100,000 y 500,000 COP.
5. Los valores en "opciones" deben ser strings numericos (ej: "50000", no 50000).
6. Genera entre 2 y 4 pasos con 1-4 campos cada uno.
7. Genera entre 1 y 3 reglas de precio que cubran el calculo completo.
8. El slug debe ser kebab-case derivado del nombre.
9. Los UUIDs de los pasos deben ser strings unicos tipo UUID v4.
10. El campo "variables" en reglas_precio contiene constantes fijas (no campos del formulario). Los campos del formulario se referencian directamente por su ID en la formula.

RESPONDE UNICAMENTE con el JSON valido. Sin explicaciones, sin markdown, sin bloques de codigo. Solo el JSON puro."""
