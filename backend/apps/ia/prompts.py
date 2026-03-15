def prompt_descripcion_propuesta(contexto: dict) -> str:
    return f"""Eres el director comercial de {contexto.get('negocio_nombre', 'una empresa')}. Escribe la seccion descriptiva de una propuesta comercial profesional para un cliente.

Servicio cotizado: {contexto.get('cotizador_nombre', 'N/A')}
Sobre el negocio: {contexto.get('cotizador_descripcion', 'N/A')}

Lo que el cliente solicito:
{_formatear_respuestas(contexto.get('respuestas', {}))}

Escribe EXACTAMENTE 4 parrafos cortos separados por lineas vacias:

Parrafo 1 - ALCANCE: Describe con detalle que incluye el servicio basandote en lo que el cliente selecciono. Menciona los entregables concretos que recibira.

Parrafo 2 - PROCESO: Explica el proceso de trabajo paso a paso. Como se desarrolla el proyecto, cuantas etapas tiene, que necesitas del cliente para arrancar.

Parrafo 3 - TIEMPOS: Indica tiempos estimados de entrega realistas. Menciona hitos intermedios si aplica (primera revision, entrega parcial, entrega final).

Parrafo 4 - GARANTIA: Que garantias ofreces. Revisiones incluidas, soporte post-entrega, compromiso de calidad.

REGLAS ESTRICTAS:
- Tono profesional, seguro y directo. Como un experto que sabe lo que hace
- NO uses markdown, viñetas, listas ni asteriscos. Solo texto plano en parrafos
- NO menciones precios, montos ni valores monetarios
- Cada parrafo: 2-4 oraciones claras y concretas
- Usa lenguaje que genere confianza: "nuestro equipo", "garantizamos", "nos comprometemos"
- NO uses frases genericas vacias. Se especifico con el servicio que el cliente pidio
- Separa cada parrafo con exactamente una linea vacia"""


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
    return f"""Eres un experto en crear formularios de cotizacion para negocios. Tu trabajo es pensar como un vendedor experimentado que sabe que preguntas hacerle al cliente para poder calcular un precio justo.

El usuario describe su negocio:
"{descripcion}"

PIENSA COMO VENDEDOR: que necesitas saber del cliente para darle un precio?
- Que producto o servicio quiere? (seleccion con opciones claras)
- Que tamano, cantidad o dimensiones? (slider o numero)
- Que materiales o calidad? (seleccion con opciones que afectan precio)
- Quiere extras opcionales? (seleccion: se agregan al precio base)

REGLAS PARA LAS PREGUNTAS:
- Las preguntas deben ser naturales, como si un vendedor le preguntara al cliente en persona
- NO preguntes cosas obvias como "quieres diseno profesional si/no" -- si el cliente cotiza, obviamente quiere calidad
- Las opciones de seleccion deben tener nombres descriptivos SIN precios visibles
- Cada opcion tiene un valor numerico interno que el cliente NO ve
- Los extras se suman al precio base, no se preguntan como si/no

Genera un JSON con esta estructura EXACTA:

{{
  "nombre": "Nombre descriptivo del cotizador",
  "slug": "slug-kebab-case-sin-tildes",
  "descripcion": "Frase corta que invite al cliente a cotizar",
  "moneda": "COP",
  "configuracion": {{
    "pasos": [
      {{
        "id": "paso-1",
        "titulo": "Titulo del paso",
        "descripcion": "Instruccion breve para el cliente",
        "campos": [
          {{
            "id": "identificador_snake_case",
            "tipo": "seleccion",
            "label": "Pregunta natural al cliente",
            "requerido": true,
            "opciones": [{{"label": "Opcion descriptiva", "valor": "150000"}}],
            "min": null, "max": null, "step": null, "unidad": null
          }}
        ]
      }}
    ]
  }},
  "reglas_precio": [
    {{
      "nombre": "Nombre de la regla",
      "formula": "campo_id_1 + campo_id_2",
      "variables": {{}},
      "prioridad": 0
    }}
  ]
}}

REGLAS TECNICAS:
1. Tipos: "seleccion" (una opcion), "multiple" (varias opciones, se suman los valores), "numero", "slider", "texto", "area_m2"
2. IDs: snake_case sin tildes ni ñ. Estos IDs son las variables de las formulas
3. FORMULAS: SOLO usan IDs de campos reales o keys de "variables". NUNCA inventes nombres
4. Labels de opciones: SOLO texto descriptivo, NUNCA precios. Ej: "Aviso luminoso grande", NO "Aviso luminoso ($500.000)"
5. Valores de opciones: strings numericos ("150000")
6. Genera 2-4 pasos, 1-3 campos por paso
7. Precios realistas en COP (o la moneda que el usuario indique)
8. Para extras opcionales: usa tipo "multiple" (checkboxes, el cliente puede elegir varios). Los valores se SUMAN automaticamente
9. Cada campo que afecte el precio debe tener un valor numerico como "valor" en las opciones

EJEMPLO para una imprenta:
- Paso 1 "Que necesitas?": tipo_producto (seleccion: "Tarjetas de presentacion"="45000", "Volantes"="35000")
- Paso 2 "Cantidad": cantidad (slider min:100 max:5000 step:100)
- Paso 3 "Acabados": acabado (seleccion: "Estandar"="0", "Plastificado UV"="25000")
- Regla: "tipo_producto + acabado" (el precio ya incluye la cantidad base)

RESPONDE SOLO con JSON valido."""
