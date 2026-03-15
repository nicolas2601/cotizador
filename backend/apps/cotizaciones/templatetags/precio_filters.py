from django import template

register = template.Library()


@register.filter
def formato_cop(value):
    """Formatea un numero como precio colombiano: $1.250.000"""
    try:
        num = int(float(value))
        formatted = f"{num:,}".replace(",", ".")
        return f"${formatted}"
    except (ValueError, TypeError):
        return value
