"""
Benchmark riguroso de modelos IA para generacion de cotizadores.
Evalua: calidad JSON, sesgo en precios, consistencia, y edge cases.

Ejecutar: uv run python scripts/benchmark_ia.py
"""
import asyncio
import json
import os
import re
import statistics
import sys
import time
from decimal import Decimal

# Setup Django
sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "config.settings.base")

import django
django.setup()

from apps.ia.client import GroqClient
from apps.ia.prompts import prompt_generar_cotizador

# ============================================================
# CONFIGURACION
# ============================================================
MODELOS = [
    "llama-3.3-70b-versatile",
    "llama-3.1-8b-instant",
    "openai/gpt-oss-20b",
]

# Casos de prueba: desde simples hasta extremos
CASOS_PRUEBA = [
    {
        "nombre": "Veterinaria basica",
        "descripcion": "Soy veterinario en Bucaramanga, quiero cotizar consultas generales, vacunacion y cirugias para mascotas",
        "rango_precio_min": 30000,
        "rango_precio_max": 2000000,
        "dificultad": "facil",
    },
    {
        "nombre": "Desarrollo web",
        "descripcion": "Agencia de desarrollo web, hacemos landing pages, tiendas e-commerce y apps web completas con backend",
        "rango_precio_min": 500000,
        "rango_precio_max": 30000000,
        "dificultad": "facil",
    },
    {
        "nombre": "Servicio de aseo industrial",
        "descripcion": "Empresa de aseo y limpieza industrial en Bogota. Limpiamos oficinas, bodegas, fachadas y plantas de produccion. Cobramos por metro cuadrado y tipo de limpieza",
        "rango_precio_min": 50000,
        "rango_precio_max": 15000000,
        "dificultad": "media",
    },
    {
        "nombre": "Fotografo eventos",
        "descripcion": "Soy fotografo profesional en Medellin. Cubro bodas, quince anos, bautizos, eventos corporativos. Tengo paquetes con drone, album impreso y video highlights",
        "rango_precio_min": 300000,
        "rango_precio_max": 8000000,
        "dificultad": "media",
    },
    {
        "nombre": "Consultor SAP (nicho tecnico)",
        "descripcion": "Consultoria SAP para empresas medianas y grandes en Colombia. Implementamos modulos FI, CO, MM, SD. Vendemos por horas de consultoria y tipo de modulo",
        "rango_precio_min": 2000000,
        "rango_precio_max": 200000000,
        "dificultad": "dificil",
    },
    {
        "nombre": "Pasteleria artesanal (volumen bajo)",
        "descripcion": "Pasteleria artesanal desde casa. Hago tortas personalizadas, cupcakes por docena, cake pops y mesas de postres para eventos. Precios dependen del tamano, diseno y cantidad",
        "rango_precio_min": 15000,
        "rango_precio_max": 1500000,
        "dificultad": "media",
    },
    {
        "nombre": "Abogado (servicios profesionales)",
        "descripcion": "Abogado laboralista en Cali. Represento trabajadores y empresas en demandas laborales, liquidaciones, contratos y asesoria juridica preventiva",
        "rango_precio_min": 100000,
        "rango_precio_max": 15000000,
        "dificultad": "dificil",
    },
    {
        "nombre": "Edge case: descripcion vaga",
        "descripcion": "vendo cosas online",
        "rango_precio_min": 10000,
        "rango_precio_max": 5000000,
        "dificultad": "extremo",
    },
    {
        "nombre": "Edge case: negocio inusual",
        "descripcion": "Tengo un servicio de entrenamiento de loros para hablar en Cartagena. Enseno frases basicas, canciones y trucos. Tambien vendo accesorios para aves",
        "rango_precio_min": 20000,
        "rango_precio_max": 800000,
        "dificultad": "extremo",
    },
    {
        "nombre": "Edge case: prompt largo y detallado",
        "descripcion": "Soy ingeniero civil y tengo una empresa constructora pequena en Bucaramanga. Hacemos remodelaciones de apartamentos, casas y locales comerciales. Los servicios incluyen: pintura interior y exterior, instalacion de pisos (porcelanato, laminado, vinilo), plomeria (cambio de tuberias, instalacion de sanitarios, griferia), electricidad (puntos nuevos, tableros, certificacion RETIE), mamposteria (muros divisorios, enchapes de bano y cocina), carpinteria metalica (ventanas, puertas, rejas) y diseno de interiores. El precio depende del area en metros cuadrados, el tipo de acabados (economico, estandar, premium), la cantidad de banos y cocinas a remodelar, y si incluye diseno 3D",
        "rango_precio_min": 500000,
        "rango_precio_max": 80000000,
        "dificultad": "extremo",
    },
]

RUNS_POR_CASO = 2  # Repeticiones para medir consistencia

TIPOS_CAMPO_VALIDOS = {"texto", "numero", "seleccion", "multiple", "area_m2", "slider"}


# ============================================================
# FUNCIONES DE EVALUACION
# ============================================================

def extraer_json(texto: str) -> dict | None:
    texto = texto.strip()
    try:
        return json.loads(texto)
    except json.JSONDecodeError:
        pass
    match = re.search(r"```(?:json)?\s*(\{.*?\})\s*```", texto, re.DOTALL)
    if match:
        try:
            return json.loads(match.group(1))
        except json.JSONDecodeError:
            pass
    match = re.search(r"\{.*\}", texto, re.DOTALL)
    if match:
        try:
            return json.loads(match.group(0))
        except json.JSONDecodeError:
            pass
    return None


def evaluar_estructura(data: dict) -> dict:
    """Evalua la calidad estructural del JSON generado."""
    score = 100
    problemas = []

    # Campos requeridos
    for campo in ["nombre", "slug", "descripcion", "configuracion"]:
        if campo not in data:
            score -= 20
            problemas.append(f"Falta campo: {campo}")

    config = data.get("configuracion", {})
    pasos = config.get("pasos", [])

    if not pasos:
        score -= 30
        problemas.append("Sin pasos")
        return {"score": max(0, score), "problemas": problemas}

    # Validar pasos
    if len(pasos) > 4:
        score -= 10
        problemas.append(f"Demasiados pasos: {len(pasos)} (max 3)")

    campo_ids = set()
    for i, paso in enumerate(pasos):
        if "titulo" not in paso:
            score -= 5
            problemas.append(f"Paso {i}: sin titulo")
        if "descripcion" not in paso or not paso.get("descripcion"):
            score -= 3
            problemas.append(f"Paso {i}: sin descripcion")

        campos = paso.get("campos", [])
        for j, campo in enumerate(campos):
            if "id" not in campo:
                score -= 10
                problemas.append(f"Paso {i}, campo {j}: sin id")
                continue

            campo_ids.add(campo["id"])

            if campo.get("tipo") not in TIPOS_CAMPO_VALIDOS:
                score -= 10
                problemas.append(f"Tipo invalido: {campo.get('tipo')}")

            if campo.get("tipo") in ("seleccion", "multiple"):
                opciones = campo.get("opciones", [])
                if not opciones:
                    score -= 10
                    problemas.append(f"Campo {campo['id']}: sin opciones")
                for op in opciones:
                    if "label" not in op or "valor" not in op:
                        score -= 5
                        problemas.append(f"Opcion mal formada en {campo['id']}")
                    # Verificar que el valor sea numerico
                    try:
                        float(op.get("valor", ""))
                    except (ValueError, TypeError):
                        score -= 5
                        problemas.append(f"Valor no numerico: {op.get('valor')} en {campo['id']}")

    # Validar reglas de precio
    reglas = data.get("reglas_precio", [])
    if not reglas:
        score -= 20
        problemas.append("Sin reglas de precio")
    else:
        for i, regla in enumerate(reglas):
            for req in ["nombre", "formula", "variables"]:
                if req not in regla:
                    score -= 5
                    problemas.append(f"Regla {i}: falta {req}")

            # Validar que variables en formula existen
            if "formula" in regla:
                vars_formula = set(re.findall(r"[a-zA-Z_]\w*", regla["formula"]))
                vars_validas = campo_ids | set(regla.get("variables", {}).keys())
                invalidas = vars_formula - vars_validas
                if invalidas:
                    score -= 10
                    problemas.append(f"Regla {i}: variables invalidas {invalidas}")

    return {"score": max(0, score), "problemas": problemas}


def evaluar_precios(data: dict, caso: dict) -> dict:
    """Evalua si los precios son realistas para el mercado colombiano."""
    score = 100
    problemas = []
    precios_encontrados = []

    pasos = data.get("configuracion", {}).get("pasos", [])
    for paso in pasos:
        for campo in paso.get("campos", []):
            for op in campo.get("opciones", []):
                try:
                    precio = float(op.get("valor", 0))
                    precios_encontrados.append(precio)
                except (ValueError, TypeError):
                    continue

    if not precios_encontrados:
        return {"score": 50, "problemas": ["No se encontraron precios"], "precios": []}

    min_precio = min(precios_encontrados)
    max_precio = max(precios_encontrados)
    avg_precio = statistics.mean(precios_encontrados)

    # Verificar rango realista
    if min_precio < caso["rango_precio_min"] * 0.3:
        score -= 15
        problemas.append(f"Precio minimo demasiado bajo: ${min_precio:,.0f} (esperado >= ${caso['rango_precio_min'] * 0.3:,.0f})")

    if max_precio > caso["rango_precio_max"] * 3:
        score -= 15
        problemas.append(f"Precio maximo demasiado alto: ${max_precio:,.0f} (esperado <= ${caso['rango_precio_max'] * 3:,.0f})")

    # Verificar precios en COP (deben ser >= 1000 para servicios)
    if min_precio < 1000 and min_precio > 0:
        score -= 20
        problemas.append(f"Precio sospechosamente bajo para COP: ${min_precio:,.0f}")

    # Verificar que no esten en dolares (< 5000 para servicios profesionales es sospechoso)
    if avg_precio < 5000 and caso["rango_precio_min"] >= 30000:
        score -= 25
        problemas.append(f"Posible sesgo USD: promedio ${avg_precio:,.0f} parece dolares, no COP")

    # Verificar distribucion razonable
    if len(precios_encontrados) > 1:
        ratio = max_precio / max(min_precio, 1)
        if ratio > 100:
            score -= 10
            problemas.append(f"Dispersion extrema de precios: ratio {ratio:.0f}x")

    return {
        "score": max(0, score),
        "problemas": problemas,
        "precios": precios_encontrados,
        "min": min_precio,
        "max": max_precio,
        "avg": avg_precio,
    }


def evaluar_descripciones(data: dict) -> dict:
    """Evalua si las opciones tienen descripciones utiles."""
    score = 100
    total_opciones = 0
    con_descripcion = 0

    pasos = data.get("configuracion", {}).get("pasos", [])
    for paso in pasos:
        for campo in paso.get("campos", []):
            for op in campo.get("opciones", []):
                total_opciones += 1
                desc = op.get("descripcion", "")
                if desc and len(desc) > 5:
                    con_descripcion += 1

    if total_opciones == 0:
        return {"score": 50, "total": 0, "con_descripcion": 0, "porcentaje": 0}

    porcentaje = (con_descripcion / total_opciones) * 100
    score = int(porcentaje)

    return {
        "score": score,
        "total": total_opciones,
        "con_descripcion": con_descripcion,
        "porcentaje": porcentaje,
    }


def evaluar_uso_tipos(data: dict) -> dict:
    """Evalua si usa tipos de campo variados y apropiados."""
    tipos_usados = set()
    pasos = data.get("configuracion", {}).get("pasos", [])
    for paso in pasos:
        for campo in paso.get("campos", []):
            tipos_usados.add(campo.get("tipo", ""))

    score = min(100, len(tipos_usados) * 30)

    # Bonus por usar multiple (checkboxes)
    if "multiple" in tipos_usados:
        score = min(100, score + 10)

    return {"score": score, "tipos": list(tipos_usados)}


# ============================================================
# EJECUCION DEL BENCHMARK
# ============================================================

async def ejecutar_prueba(client: GroqClient, modelo: str, caso: dict) -> dict:
    prompt = prompt_generar_cotizador(caso["descripcion"])
    system = "Eres un asistente que genera configuraciones JSON para cotizadores de negocios colombianos. Responde UNICAMENTE con JSON valido."

    start = time.time()
    try:
        respuesta = await client.chat(
            prompt=prompt,
            system=system,
            json_mode=True,
            model=modelo,
            temperature=0.4,
        )
        latencia = time.time() - start
    except Exception as e:
        return {
            "exito": False,
            "error": str(e),
            "latencia": time.time() - start,
        }

    data = extraer_json(respuesta)
    if data is None or not isinstance(data, dict):
        return {
            "exito": False,
            "error": f"JSON invalido o no es dict (tipo: {type(data).__name__})",
            "raw": respuesta[:300],
            "latencia": time.time() - start,
        }

    # Evaluar en todas las dimensiones
    estructura = evaluar_estructura(data)
    precios = evaluar_precios(data, caso)
    descripciones = evaluar_descripciones(data)
    tipos = evaluar_uso_tipos(data)

    score_total = (
        estructura["score"] * 0.35 +
        precios["score"] * 0.30 +
        descripciones["score"] * 0.20 +
        tipos["score"] * 0.15
    )

    return {
        "exito": True,
        "latencia": latencia,
        "score_total": score_total,
        "estructura": estructura,
        "precios": precios,
        "descripciones": descripciones,
        "tipos": tipos,
        "data": data,
    }


async def benchmark_modelo(modelo: str) -> dict:
    client = GroqClient()
    resultados = []

    print(f"\n{'='*60}")
    print(f"  MODELO: {modelo}")
    print(f"{'='*60}")

    for caso in CASOS_PRUEBA:
        print(f"\n  Caso: {caso['nombre']} ({caso['dificultad']})")
        runs = []

        for run in range(RUNS_POR_CASO):
            try:
                resultado = await ejecutar_prueba(client, modelo, caso)
            except Exception as e:
                resultado = {"exito": False, "error": f"Excepcion: {e}", "latencia": 0}

            runs.append(resultado)

            if resultado["exito"]:
                print(f"    Run {run+1}: Score {resultado['score_total']:.1f}/100 "
                      f"(Estr:{resultado['estructura']['score']} "
                      f"Pre:{resultado['precios']['score']} "
                      f"Desc:{resultado['descripciones']['score']} "
                      f"Tip:{resultado['tipos']['score']}) "
                      f"[{resultado['latencia']:.1f}s]")
                if resultado["estructura"]["problemas"]:
                    for p in resultado["estructura"]["problemas"][:3]:
                        print(f"      ! {p}")
                if resultado["precios"]["problemas"]:
                    for p in resultado["precios"]["problemas"][:2]:
                        print(f"      $ {p}")
            else:
                print(f"    Run {run+1}: FALLO - {resultado['error'][:100]}")

            # Rate limit: esperar entre llamadas (mas generoso)
            await asyncio.sleep(4)

        resultados.append({
            "caso": caso["nombre"],
            "dificultad": caso["dificultad"],
            "runs": runs,
        })

    return {"modelo": modelo, "resultados": resultados}


def calcular_resumen(benchmark: dict) -> dict:
    scores = []
    latencias = []
    fallos = 0
    total = 0
    sesgo_precios = []

    for caso_res in benchmark["resultados"]:
        for run in caso_res["runs"]:
            total += 1
            if run["exito"]:
                scores.append(run["score_total"])
                latencias.append(run["latencia"])
                if run["precios"].get("avg"):
                    sesgo_precios.append(run["precios"]["score"])
            else:
                fallos += 1

    return {
        "modelo": benchmark["modelo"],
        "score_promedio": statistics.mean(scores) if scores else 0,
        "score_min": min(scores) if scores else 0,
        "score_max": max(scores) if scores else 0,
        "desviacion": statistics.stdev(scores) if len(scores) > 1 else 0,
        "latencia_promedio": statistics.mean(latencias) if latencias else 0,
        "tasa_exito": ((total - fallos) / total * 100) if total else 0,
        "fallos": fallos,
        "total": total,
        "sesgo_precio_promedio": statistics.mean(sesgo_precios) if sesgo_precios else 0,
    }


async def main():
    print("\n" + "=" * 60)
    print("  BENCHMARK RIGUROSO DE MODELOS IA - COTIZADOR TIKNO")
    print(f"  {len(CASOS_PRUEBA)} casos x {RUNS_POR_CASO} runs x {len(MODELOS)} modelos")
    print(f"  Total llamadas: {len(CASOS_PRUEBA) * RUNS_POR_CASO * len(MODELOS)}")
    print("=" * 60)

    all_benchmarks = []

    for modelo in MODELOS:
        try:
            resultado = await benchmark_modelo(modelo)
            all_benchmarks.append(resultado)
        except Exception as e:
            print(f"\n  ERROR FATAL con {modelo}: {e}")
            all_benchmarks.append({"modelo": modelo, "resultados": []})

        # Pausa entre modelos
        await asyncio.sleep(3)

    # ============================================================
    # RESUMEN FINAL
    # ============================================================
    print("\n\n" + "=" * 70)
    print("  RESUMEN COMPARATIVO FINAL")
    print("=" * 70)

    resumenes = [calcular_resumen(b) for b in all_benchmarks]

    # Tabla comparativa
    print(f"\n{'Modelo':<35} {'Score':>7} {'Min':>5} {'Max':>5} {'StdDev':>7} {'Latencia':>9} {'Exito':>7} {'Sesgo$':>7}")
    print("-" * 95)

    for r in resumenes:
        print(f"{r['modelo']:<35} {r['score_promedio']:>6.1f}% {r['score_min']:>4.0f}% {r['score_max']:>4.0f}% "
              f"{r['desviacion']:>6.1f} {r['latencia_promedio']:>7.1f}s {r['tasa_exito']:>5.0f}% {r['sesgo_precio_promedio']:>6.1f}")

    # Recomendacion
    if resumenes:
        mejor = max(resumenes, key=lambda r: r["score_promedio"])
        print(f"\n  RECOMENDACION: {mejor['modelo']}")
        print(f"  Score promedio: {mejor['score_promedio']:.1f}%")
        print(f"  Latencia promedio: {mejor['latencia_promedio']:.1f}s")
        print(f"  Tasa de exito: {mejor['tasa_exito']:.0f}%")

    # Analisis de sesgo detallado
    print("\n\n" + "=" * 70)
    print("  ANALISIS DE SESGO EN PRECIOS")
    print("=" * 70)

    for bench in all_benchmarks:
        print(f"\n  Modelo: {bench['modelo']}")
        print(f"  {'Caso':<40} {'Precio Min':>12} {'Precio Max':>12} {'Promedio':>12} {'Score':>7}")
        print("  " + "-" * 87)

        for caso_res in bench["resultados"]:
            for run in caso_res["runs"]:
                if run["exito"] and run["precios"].get("precios"):
                    p = run["precios"]
                    print(f"  {caso_res['caso']:<40} ${p['min']:>10,.0f} ${p['max']:>10,.0f} "
                          f"${p['avg']:>10,.0f} {p['score']:>5}/100")
                    break  # Solo mostrar primer run exitoso

    # Analisis de consistencia
    print("\n\n" + "=" * 70)
    print("  ANALISIS DE CONSISTENCIA (entre runs del mismo caso)")
    print("=" * 70)

    for bench in all_benchmarks:
        print(f"\n  Modelo: {bench['modelo']}")
        inconsistencias = 0
        total_pares = 0

        for caso_res in bench["resultados"]:
            scores_runs = [r["score_total"] for r in caso_res["runs"] if r["exito"]]
            if len(scores_runs) >= 2:
                total_pares += 1
                diff = abs(scores_runs[0] - scores_runs[1])
                if diff > 15:
                    inconsistencias += 1
                    print(f"    ! {caso_res['caso']}: diferencia de {diff:.1f} puntos entre runs")

        if total_pares > 0:
            print(f"  Consistencia: {((total_pares - inconsistencias) / total_pares * 100):.0f}% "
                  f"({inconsistencias} inconsistencias de {total_pares} pares)")

    print("\n" + "=" * 70)
    print("  BENCHMARK COMPLETO")
    print("=" * 70)


if __name__ == "__main__":
    asyncio.run(main())
