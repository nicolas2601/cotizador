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
    return f"""Eres un experto en crear cotizadores para negocios. El usuario describe su negocio:

"{descripcion}"

Genera un JSON para un cotizador automatico. Estructura EXACTA:

{{
  "nombre": "Nombre del cotizador",
  "slug": "slug-kebab-case",
  "descripcion": "Descripcion breve",
  "moneda": "COP",
  "configuracion": {{
    "pasos": [
      {{
        "id": "paso-1",
        "titulo": "Titulo del paso",
        "descripcion": "Que se pregunta",
        "campos": [
          {{
            "id": "tipo_servicio",
            "tipo": "seleccion",
            "label": "Que servicio necesitas?",
            "requerido": true,
            "opciones": [{{"label": "Servicio basico", "valor": "150000"}}, {{"label": "Servicio premium", "valor": "350000"}}],
            "min": null, "max": null, "step": null, "unidad": null
          }}
        ]
      }}
    ]
  }},
  "reglas_precio": [
    {{
      "nombre": "Precio del servicio",
      "formula": "tipo_servicio",
      "variables": {{}},
      "prioridad": 0
    }}
  ]
}}

REGLAS CRITICAS:
1. Tipos validos: "seleccion", "numero", "slider", "texto", "area_m2".
2. IDs de campos: snake_case sin tildes ni ñ (ej: tipo_servicio, num_paginas). ESTOS IDs son las variables de las formulas.
3. FORMULAS: SOLO pueden usar IDs de campos definidos en los pasos O nombres de variables fijas definidas en "variables". NUNCA uses un nombre que no este definido. Si el campo se llama "tipo_servicio", la formula debe decir "tipo_servicio", NO "precio_base" ni ningun otro nombre inventado.
4. Las labels de las opciones NO deben mostrar precios. Solo descripcion del servicio. Ej: "Consulta general", NO "Consulta general ($80.000)". Los precios van SOLO en el campo "valor".
5. Precios en la moneda que el usuario especifique. Si no especifica, usar Pesos Colombianos (COP). Precios realistas.
6. Valores de opciones: strings numericos ("150000", no 150000).
7. Genera 2-4 pasos, 1-3 campos por paso, 1-3 reglas de precio.
8. VERIFICA que cada variable usada en las formulas exista como ID de campo o como key en "variables". Si la formula dice "cantidad * precio_unitario", debe existir un campo con id "cantidad" Y una variable fija "precio_unitario" en "variables" (o ambos como campos).

EJEMPLO CORRECTO de formula:
- Campo id: "tipo_servicio" (seleccion con valor "80000")
- Campo id: "cantidad" (slider min 1 max 10)
- Formula: "tipo_servicio * cantidad" (ambos son IDs de campos reales)

EJEMPLO INCORRECTO:
- Formula: "precio_base * cantidad" (ERROR: "precio_base" no es ID de ningun campo)

RESPONDE SOLO con JSON valido. Sin explicaciones ni markdown."""
