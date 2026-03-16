import json
import logging
import re

from django.conf import settings
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.cotizadores.models import Cotizador, ReglaPrecio
from apps.cotizadores.serializers import CotizadorSerializer

from .client import GroqClient, AIClientError
from .prompts import prompt_generar_cotizador

logger = logging.getLogger(__name__)

CAMPOS_REQUERIDOS_COTIZADOR = {"nombre", "slug", "descripcion", "configuracion"}


def _encontrar_campo_similar(variable: str, campo_ids: set) -> str | None:
    """Busca el campo ID mas parecido a una variable invalida en la formula.

    Ej: 'tipo_sitio' -> 'tipo_sitio_web', 'funcionalidades' -> 'funcionalidades_extra'
    """
    if not campo_ids:
        return None

    # 1. Match exacto parcial: la variable es subcadena de un campo o viceversa
    for campo_id in campo_ids:
        if variable in campo_id or campo_id in variable:
            return campo_id

    # 2. Match por palabras en comun
    var_parts = set(variable.split("_"))
    mejor = None
    mejor_score = 0
    for campo_id in campo_ids:
        campo_parts = set(campo_id.split("_"))
        comunes = var_parts & campo_parts
        score = len(comunes) / max(len(var_parts), len(campo_parts))
        if score > mejor_score:
            mejor_score = score
            mejor = campo_id

    # Solo retornar si hay al menos 50% de coincidencia
    if mejor_score >= 0.5:
        return mejor

    return None
CAMPOS_REQUERIDOS_REGLA = {"nombre", "formula", "variables", "prioridad"}
TIPOS_CAMPO_VALIDOS = {"texto", "numero", "seleccion", "multiple", "area_m2", "slider"}


def _forzar_formulas_consistentes(data: dict) -> None:
    """Reconstruye las formulas para usar EXACTAMENTE los IDs de los campos generados.

    La IA frecuentemente genera formulas con variables que no coinciden con los IDs
    de los campos (ej: campo='tipo_sitio_web' pero formula dice 'tipo_sitio').
    Esta funcion SIEMPRE reconstruye la formula como suma de los campos con precio.
    """
    config = data.get("configuracion", {})
    pasos = config.get("pasos", [])

    # Recopilar campos que afectan el precio (no texto)
    campo_ids_precio = []
    for paso in pasos:
        for campo in paso.get("campos", []):
            cid = campo.get("id", "")
            if cid and campo.get("tipo") != "texto":
                campo_ids_precio.append(cid)

    if not campo_ids_precio:
        return

    # Reconstruir SIEMPRE la formula como suma de campos con precio
    formula_correcta = " + ".join(campo_ids_precio)

    reglas = data.get("reglas_precio", [])
    for regla in reglas:
        formula_original = regla.get("formula", "")
        regla["formula"] = formula_correcta
        regla["variables"] = {}  # Limpiar variables fijas que podrian ser invalidas
        if formula_original != formula_correcta:
            logger.info(
                f"Formula reconstruida: '{formula_original}' -> '{formula_correcta}'"
            )


def _extraer_json(texto: str) -> dict:
    """Intenta extraer JSON valido de la respuesta de la IA."""
    texto = texto.strip()

    # Intentar parsear directamente
    try:
        return json.loads(texto)
    except json.JSONDecodeError:
        pass

    # Buscar JSON dentro de bloques de codigo markdown
    match = re.search(r"```(?:json)?\s*(\{.*?\})\s*```", texto, re.DOTALL)
    if match:
        try:
            return json.loads(match.group(1))
        except json.JSONDecodeError:
            pass

    # Buscar el primer { ... } en el texto
    match = re.search(r"\{.*\}", texto, re.DOTALL)
    if match:
        try:
            return json.loads(match.group(0))
        except json.JSONDecodeError:
            pass

    raise ValueError("No se pudo extraer JSON valido de la respuesta de la IA.")


def _validar_estructura(data: dict) -> list[str]:
    """Valida la estructura del JSON generado. Retorna lista de errores."""
    errores = []

    for campo in CAMPOS_REQUERIDOS_COTIZADOR:
        if campo not in data:
            errores.append(f"Falta el campo requerido: {campo}")

    if errores:
        return errores

    config = data.get("configuracion", {})
    pasos = config.get("pasos", [])

    if not isinstance(pasos, list) or len(pasos) == 0:
        errores.append("La configuracion debe tener al menos un paso.")
        return errores

    for i, paso in enumerate(pasos):
        if not isinstance(paso, dict):
            errores.append(f"El paso {i} debe ser un objeto.")
            continue
        if "titulo" not in paso:
            errores.append(f"El paso {i} requiere 'titulo'.")
        campos = paso.get("campos", [])
        if not isinstance(campos, list):
            errores.append(f"El paso {i}: 'campos' debe ser una lista.")
            continue
        for j, campo in enumerate(campos):
            if not isinstance(campo, dict):
                errores.append(f"Paso {i}, campo {j}: debe ser un objeto.")
                continue
            if "tipo" not in campo or "label" not in campo:
                errores.append(f"Paso {i}, campo {j}: requiere 'tipo' y 'label'.")
            elif campo["tipo"] not in TIPOS_CAMPO_VALIDOS:
                errores.append(
                    f"Paso {i}, campo {j}: tipo '{campo['tipo']}' invalido. "
                    f"Validos: {', '.join(sorted(TIPOS_CAMPO_VALIDOS))}"
                )
            if "id" not in campo:
                errores.append(f"Paso {i}, campo {j}: requiere 'id'.")

    # Recopilar IDs de campos validos
    campo_ids = set()
    for paso in pasos:
        for campo in paso.get("campos", []):
            if isinstance(campo, dict) and "id" in campo:
                campo_ids.add(campo["id"])

    reglas = data.get("reglas_precio", [])
    if not isinstance(reglas, list) or len(reglas) == 0:
        errores.append("Debe tener al menos una regla de precio.")
    else:
        for i, regla in enumerate(reglas):
            if not isinstance(regla, dict):
                errores.append(f"La regla {i} debe ser un objeto.")
                continue
            for campo_req in CAMPOS_REQUERIDOS_REGLA:
                if campo_req not in regla:
                    errores.append(f"La regla {i} requiere '{campo_req}'.")

            # Validar que las variables de la formula existan
            if "formula" in regla and "variables" in regla:
                formula = regla["formula"]
                variables_fijas = set(regla.get("variables", {}).keys())
                variables_validas = campo_ids | variables_fijas

                # Extraer nombres de variables de la formula
                import re
                vars_en_formula = set(re.findall(r"[a-zA-Z_]\w*", formula))
                vars_invalidas = vars_en_formula - variables_validas

                if vars_invalidas:
                    # Auto-corregir: buscar campo mas parecido y reemplazar en formula
                    for var_mala in vars_invalidas:
                        mejor_match = _encontrar_campo_similar(var_mala, campo_ids)
                        if mejor_match:
                            regla["formula"] = re.sub(
                                rf"\b{re.escape(var_mala)}\b", mejor_match, regla["formula"]
                            )
                            logger.warning(
                                f"Regla {i}: variable '{var_mala}' reemplazada por '{mejor_match}' en formula."
                            )
                        else:
                            regla["variables"][var_mala] = 0
                            logger.warning(
                                f"Regla {i}: variable '{var_mala}' no tiene match, asignando 0."
                            )

    return errores


class GenerarCotizadorView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        descripcion = request.data.get("descripcion", "").strip()

        if not descripcion:
            return Response(
                {"detail": "El campo 'descripcion' es obligatorio."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if len(descripcion) < 10:
            return Response(
                {"detail": "La descripcion debe tener al menos 10 caracteres."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # Verificar que la IA esta configurada
        if not getattr(settings, "GROQ_API_KEY", ""):
            return Response(
                {"detail": "El servicio de IA no esta configurado. Contacte al administrador."},
                status=status.HTTP_503_SERVICE_UNAVAILABLE,
            )

        # Generar el prompt y llamar a Groq
        prompt = prompt_generar_cotizador(descripcion)
        client = GroqClient()

        try:
            respuesta_raw = client.chat_sync(
                prompt=prompt,
                system="Eres un asistente que genera configuraciones JSON para cotizadores de negocios colombianos. Responde UNICAMENTE con JSON valido.",
                json_mode=True,
                temperature=0.4,
            )
        except AIClientError as e:
            logger.error(f"Error al comunicarse con la IA: {e}")
            return Response(
                {"detail": f"Error con el servicio de IA: {str(e)}"},
                status=status.HTTP_502_BAD_GATEWAY,
            )

        # Parsear la respuesta JSON
        try:
            data = _extraer_json(respuesta_raw)
        except ValueError:
            logger.error(f"La IA retorno JSON invalido: {respuesta_raw[:500]}")
            return Response(
                {"detail": "La IA genero una respuesta invalida. Intente nuevamente con una descripcion mas detallada."},
                status=status.HTTP_422_UNPROCESSABLE_ENTITY,
            )

        # Forzar consistencia: reconstruir formulas con IDs reales
        _forzar_formulas_consistentes(data)

        # Validar la estructura
        errores = _validar_estructura(data)
        if errores:
            logger.warning(f"Estructura invalida generada por IA: {errores}")
            return Response(
                {
                    "detail": "La IA genero una estructura con errores. Intente nuevamente.",
                    "errores": errores,
                },
                status=status.HTTP_422_UNPROCESSABLE_ENTITY,
            )

        # Crear el Cotizador en la base de datos
        try:
            negocio = request.user.negocio

            # Asegurar slug unico
            slug_base = data["slug"]
            slug = slug_base
            counter = 1
            while Cotizador.objects.filter(negocio=negocio, slug=slug).exists():
                slug = f"{slug_base}-{counter}"
                counter += 1

            cotizador = Cotizador.objects.create(
                negocio=negocio,
                nombre=data["nombre"],
                slug=slug,
                descripcion=data.get("descripcion", ""),
                configuracion=data["configuracion"],
                activo=True,
                moneda="COP",
            )

            # Crear las reglas de precio
            reglas_creadas = []
            for regla_data in data.get("reglas_precio", []):
                regla = ReglaPrecio.objects.create(
                    cotizador=cotizador,
                    nombre=regla_data["nombre"],
                    formula=regla_data["formula"],
                    variables=regla_data.get("variables", {}),
                    activa=True,
                    prioridad=regla_data.get("prioridad", 0),
                )
                reglas_creadas.append(regla)

            # Refrescar para incluir las relaciones
            cotizador.refresh_from_db()
            serializer = CotizadorSerializer(cotizador)

            return Response(serializer.data, status=status.HTTP_201_CREATED)

        except Exception as e:
            logger.error(f"Error al crear cotizador desde IA: {e}")
            return Response(
                {"detail": f"Error al guardar el cotizador: {str(e)}"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )
