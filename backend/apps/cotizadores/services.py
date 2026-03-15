import re
from decimal import Decimal, InvalidOperation

from .models import Cotizador, ReglaPrecio


class FormulaError(Exception):
    pass


def parse_formula(formula: str, variables: dict) -> Decimal:
    if not formula or not formula.strip():
        raise FormulaError("La formula esta vacia.")

    tokens = re.findall(r"[a-zA-Z_]\w*|[\d.]+|[+\-*/()]", formula)
    if not tokens:
        raise FormulaError(f"Formula invalida: '{formula}'")

    resolved = []
    for token in tokens:
        if re.match(r"^[a-zA-Z_]\w*$", token):
            if token not in variables:
                raise FormulaError(f"Variable desconocida: '{token}'")
            try:
                resolved.append(Decimal(str(variables[token])))
            except (InvalidOperation, TypeError):
                raise FormulaError(f"Variable '{token}' no es numerica: {variables[token]}")
        elif re.match(r"^[\d.]+$", token):
            try:
                resolved.append(Decimal(token))
            except InvalidOperation:
                raise FormulaError(f"Numero invalido: '{token}'")
        elif token in "+-*/()":
            resolved.append(token)
        else:
            raise FormulaError(f"Token no permitido: '{token}'")

    return _evaluar_expresion(resolved)


def _evaluar_expresion(tokens: list) -> Decimal:
    pos = [0]

    def parse_expr() -> Decimal:
        result = parse_term()
        while pos[0] < len(tokens) and tokens[pos[0]] in ("+", "-"):
            op = tokens[pos[0]]
            pos[0] += 1
            right = parse_term()
            result = result + right if op == "+" else result - right
        return result

    def parse_term() -> Decimal:
        result = parse_factor()
        while pos[0] < len(tokens) and tokens[pos[0]] in ("*", "/"):
            op = tokens[pos[0]]
            pos[0] += 1
            right = parse_factor()
            if op == "*":
                result *= right
            else:
                if right == 0:
                    raise FormulaError("Division por cero.")
                result /= right
        return result

    def parse_factor() -> Decimal:
        if pos[0] >= len(tokens):
            raise FormulaError("Expresion incompleta.")
        token = tokens[pos[0]]
        if token == "(":
            pos[0] += 1
            result = parse_expr()
            if pos[0] >= len(tokens) or tokens[pos[0]] != ")":
                raise FormulaError("Parentesis sin cerrar.")
            pos[0] += 1
            return result
        elif isinstance(token, Decimal):
            pos[0] += 1
            return token
        else:
            raise FormulaError(f"Token inesperado: '{token}'")

    result = parse_expr()
    if pos[0] < len(tokens):
        raise FormulaError(f"Token sobrante: '{tokens[pos[0]]}'")
    return result


def calcular_precio(cotizador_id: str, respuestas: dict) -> dict:
    try:
        cotizador = Cotizador.objects.get(id=cotizador_id, activo=True)
    except Cotizador.DoesNotExist:
        raise FormulaError("Cotizador no encontrado o inactivo.")

    reglas = cotizador.reglas_precio.filter(activa=True)
    if not reglas.exists():
        raise FormulaError("Este cotizador no tiene reglas de precio activas.")

    desglose = []
    total = Decimal("0")

    for regla in reglas:
        variables = {**regla.variables}
        for campo_id, valor in respuestas.items():
            try:
                variables[campo_id] = Decimal(str(valor))
            except (InvalidOperation, TypeError):
                pass

        resultado = parse_formula(regla.formula, variables)
        desglose.append({"regla": regla.nombre, "valor": resultado})
        total += resultado

    return {
        "subtotal": total,
        "total": total,
        "moneda": cotizador.moneda,
        "desglose": desglose,
    }
