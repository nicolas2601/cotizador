def prompt_descripcion_propuesta(contexto: dict) -> str:
    desglose_text = ""
    if contexto.get("desglose"):
        items = [f"  - {d['regla']}: ${d['valor']:,.0f} COP" for d in contexto["desglose"]]
        desglose_text = "\n".join(items)

    return f"""Eres el director comercial senior de "{contexto.get('negocio_nombre', 'una empresa profesional')}". Redactas la seccion descriptiva de una propuesta comercial que sera enviada como PDF a un cliente real.

DATOS DE LA COTIZACION:
- Servicio: {contexto.get('cotizador_nombre', 'N/A')}
- Descripcion del negocio: {contexto.get('cotizador_descripcion', 'N/A')}
- Inversion total: ${contexto.get('total', 0):,.0f} COP
- Desglose:
{desglose_text or '  (sin desglose)'}

ESPECIFICACIONES DEL CLIENTE:
{_formatear_respuestas(contexto.get('respuestas', {}))}

ESCRIBE EXACTAMENTE 4 PARRAFOS, cada uno separado por una linea vacia:

PARRAFO 1 — ALCANCE Y ENTREGABLES:
Describe con precision que recibira el cliente. Se concreto con los entregables. Relaciona directamente cada item con lo que el cliente selecciono en el formulario. No seas generico: si pidio "5 paginas", di "sitio web de 5 secciones"; si pidio "logo basico", di "diseno de marca con logotipo principal y variaciones". Genera confianza mencionando que incluye y que NO incluye para evitar malentendidos.

PARRAFO 2 — METODOLOGIA DE TRABAJO:
Explica tu proceso paso a paso como lo haria un consultor experto. Usa fases concretas: "Fase 1: Diagnostico...", "Fase 2: Desarrollo...", etc. Menciona que necesitas del cliente para arrancar (brief, accesos, materiales). Esto demuestra organizacion y profesionalismo.

PARRAFO 3 — CRONOGRAMA ESTIMADO:
Da tiempos realistas y especificos. No digas "en un tiempo prudente". Di "entrega de primera version en 5 dias habiles, revision en 2 dias, entrega final en 10 dias habiles". Incluye hitos intermedios. Si el proyecto es grande, menciona entregas parciales.

PARRAFO 4 — GARANTIA Y COMPROMISO:
Que garantias concretas ofreces. Cuantas revisiones incluye, soporte post-entrega (ej: "30 dias de soporte tecnico sin costo adicional"), compromiso de calidad. Cierra con una frase que invite a aceptar: "Estamos listos para iniciar en cuanto confirme esta propuesta."

REGLAS INQUEBRANTABLES:
- Tono de consultor senior: seguro, preciso, cercano pero profesional
- JAMAS uses markdown, vinetas, asteriscos, negritas o listas. Solo texto corrido en parrafos
- JAMAS menciones precios, montos o valores monetarios en la descripcion
- Cada parrafo: 3-5 oraciones sustanciales. Nada de relleno
- Relaciona TODO con lo que el cliente especificamente pidio en sus respuestas
- Usa primera persona plural: "nuestro equipo", "nos comprometemos", "garantizamos"
- NO uses frases vacias como "ofrecemos calidad" o "somos profesionales". Se ESPECIFICO
- Separa cada parrafo con exactamente una linea vacia
- Escribe en espanol sin tildes (para compatibilidad PDF)"""


def prompt_sugerir_precio(contexto: dict) -> str:
    return f"""Eres un consultor de pricing especializado en el mercado colombiano de servicios profesionales.

DATOS:
- Servicio: {contexto.get('cotizador_nombre', 'N/A')}
- Ciudad: Bucaramanga, Colombia
- Precio calculado: ${contexto.get('total', 0):,.0f} COP
- Desglose:
{_formatear_desglose(contexto.get('desglose', []))}

ANALIZA y responde en espanol:
1. Si el precio esta dentro del rango competitivo del mercado colombiano para este tipo de servicio
2. Si esta bajo, sugiere un rango mas realista con justificacion
3. Si esta alto, indica argumentos de venta para sostenerlo
4. Da 2-3 argumentos concretos que el vendedor pueda usar para justificar el precio ante el cliente

Maximo 200 palabras. Sin markdown. Texto plano directo."""


def _formatear_respuestas(respuestas: dict) -> str:
    if not respuestas:
        return "(El cliente no proporciono especificaciones)"
    lines = []
    for k, v in respuestas.items():
        # Clean up field IDs to be more readable
        label = k.replace("_", " ").replace("-", " ").title()
        lines.append(f"  - {label}: {v}")
    return "\n".join(lines)


def _formatear_desglose(desglose: list) -> str:
    if not desglose:
        return "  (sin desglose)"
    return "\n".join(f"  - {item['regla']}: ${item['valor']:,.0f} COP" for item in desglose)


def prompt_generar_cotizador(descripcion: str) -> str:
    return f"""Eres un experto en diseno de formularios de ventas y pricing. Tu mision es crear un cotizador inteligente que le permita a un negocio calcular precios automaticamente basandose en lo que el cliente necesita.

DESCRIPCION DEL NEGOCIO:
"{descripcion}"

PIENSA COMO UN VENDEDOR EXPERTO: analiza el negocio a fondo y diseña las preguntas mas inteligentes posibles para cotizar con precision.

TU PROCESO DE ANALISIS:
1. Entiende que vende el negocio y cuales son sus variables de precio reales
2. Identifica que preguntas son REALMENTE necesarias para calcular un precio justo
3. Diseña cada pregunta para que sea clara, especifica y util — no generica
4. Incluye siempre un espacio para que el cliente cuente su idea con sus propias palabras

TIPOS DE CAMPOS DISPONIBLES:
- "seleccion" = UNA SOLA opcion (radio buttons). Cada opcion es un paquete con precio ya definido. Ideal para: tipo de servicio, nivel/plan, tamano del proyecto.
- "multiple" = VARIAS opciones simultaneamente (checkboxes). Los valores se SUMAN. Para extras y complementos CONCRETOS y REALES del negocio.
- "texto" = Texto libre del cliente. NO afecta el precio pero le da contexto valioso al negocio para la propuesta. SIEMPRE incluye al menos uno.
- "numero" / "slider" = Cantidades que impactan el precio proporcionalmente (metros cuadrados, horas, unidades fisicas). NO para "numero de paginas web" u otras metricas vagas.
- "area_m2" = Igual que numero pero para areas en metros cuadrados.

REGLAS DE CALIDAD — LO QUE HACE UN COTIZADOR INTELIGENTE:
- Haz TODAS las preguntas que el negocio necesita para dar un precio justo y preciso. No limites artificialmente.
- Cada campo debe ser una pregunta que un vendedor real le haria a un cliente. Si suena a formulario generico, esta MAL.
- Las opciones de "seleccion" deben ser PAQUETES COMPLETOS con todo incluido en la descripcion. NO pongas opciones vagas que requieran preguntas de seguimiento.
  Ejemplo BUENO: "Landing page profesional" con descripcion "Hasta 5 secciones, diseno responsivo, formulario de contacto y optimizacion basica"
  Ejemplo MALO: "Landing page" sin contexto + otro campo preguntando "cuantas paginas?" = PROHIBIDO
- Las opciones de "multiple" deben ser servicios/extras REALES y CONCRETOS del negocio.
  PROHIBIDO: "Funcionalidad 1", "Extra adicional", "Servicio complementario", "Opcion A/B/C" — esto es RELLENO y queda terrible.
  CORRECTO: "Optimizacion SEO", "Integracion con pasarela de pagos", "Diseno de logo" — cosas reales.
- SIEMPRE incluye un campo tipo "texto" con un "placeholder" invitante (ej: "Cuentanos tu idea, que tienes en mente?", "Describe brevemente que necesitas...") para que el cliente describa lo que quiere. Este campo NO va en la formula de precio, pero enriquece la propuesta.
- NO preguntes datos de contacto (nombre, email, telefono) — el sistema ya lo maneja.
- NO preguntes "plazo de entrega", "urgencia", "presupuesto disponible" — no ayudan a calcular precio.

REGLAS DE PRECIOS (COP COLOMBIANO):
- TODOS los valores en PESOS COLOMBIANOS. Un cafe = $5,000, un almuerzo = $20,000.
- Servicios profesionales (desarrollo, diseno, consultoria, abogados): minimo $100,000 COP por opcion.
- Productos fisicos / servicios basicos (comida, aseo, pasteleria): minimo $15,000 COP.
- JAMAS valores como "0", "1", "20" que parecen dolares.
- Rango razonable entre opciones (maximo 10x entre la mas barata y la mas cara).
- Las descripciones de opciones (10-25 palabras) deben explicar QUE INCLUYE para que el cliente entienda por que vale lo que vale.

ESTRUCTURA JSON EXACTA:

{{
  "nombre": "Nombre atractivo del cotizador",
  "slug": "slug-kebab-case-sin-tildes",
  "descripcion": "Frase corta e invitante para el cliente",
  "moneda": "COP",
  "configuracion": {{
    "pasos": [
      {{
        "id": "paso-1",
        "titulo": "Titulo del paso",
        "descripcion": "Instruccion breve",
        "campos": [
          {{
            "id": "identificador_snake_case",
            "tipo": "seleccion",
            "label": "Pregunta clara y natural",
            "requerido": true,
            "opciones": [{{"label": "Opcion concreta", "valor": "150000", "descripcion": "Que incluye esta opcion"}}],
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

REGLAS TECNICAS (CRITICO — SI LAS ROMPES, EL COTIZADOR NO FUNCIONA):
1. Tipos validos: "seleccion", "multiple", "numero", "slider", "texto", "area_m2"
2. IDs: snake_case, sin tildes, sin ñ. Son las variables en las formulas
3. FORMULAS: SOLO pueden usar los IDs EXACTOS de campos definidos arriba, o keys del objeto "variables". Si un campo tiene id "tipo_sitio_web", la formula DEBE usar "tipo_sitio_web" — NO "tipo_sitio", NO "sitio", NO abreviaciones. COPIA Y PEGA el ID tal cual.
4. Los campos tipo "texto" NUNCA van en formulas (no tienen valor numerico)
5. Valores de opciones: strings numericos en COP ("150000", "500000")
6. La formula debe cubrir TODOS los campos que afectan el precio
7. VERIFICA que cada variable en la formula coincida EXACTAMENTE con un "id" de campo. Si no coincide, el cotizador se rompe.

RESPONDE UNICAMENTE con JSON valido. Sin texto adicional."""
