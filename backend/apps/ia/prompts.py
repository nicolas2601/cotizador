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
