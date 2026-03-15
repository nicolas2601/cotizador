import psycopg2
from dotenv import load_dotenv
import os
from pathlib import Path

# Cargar variables desde el .env en la raíz
env_path = Path(__file__).resolve().parent.parent / '.env'
if not env_path.exists():
    print(f"❌ Error: El archivo {env_path} NO EXISTE en la raíz del proyecto.")
else:
    print(f"✅ Archivo {env_path} encontrado. Cargando...")
    load_dotenv(dotenv_path=env_path)

# Obtener variables
DATABASE_URL = os.getenv("DATABASE_URL")

if not DATABASE_URL:
    print("❌ Error: DATABASE_URL es None. Revisa el archivo .env.")
else:
    print(f"Probando conexión con DATABASE_URL...")

# Conectar a la base de datos
try:
    if DATABASE_URL:
        connection = psycopg2.connect(DATABASE_URL)
        print("¡Conexión exitosa a la Base de Datos!")
    else:
        raise ValueError("DATABASE_URL no configurada.")
    
    # Crear un cursor para ejecutar SQL queries
    cursor = connection.cursor()
    
    # Consulta de ejemplo
    cursor.execute("SELECT NOW();")
    result = cursor.fetchone()
    print("Hora actual en la DB:", result)

    # Cerrar el cursor y conexión
    cursor.close()
    connection.close()
    print("Conexión cerrada.")

except Exception as e:
    print(f"Fallo al conectar: {e}")
