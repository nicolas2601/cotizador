import psycopg2
from dotenv import load_dotenv
import os
from pathlib import Path

# Cargar variables desde el .env en la raíz (un nivel arriba de backend/)
env_path = Path(__file__).resolve().parent.parent / '.env'
load_dotenv(dotenv_path=env_path)

# Fetch variables
USER = os.getenv("user")
PASSWORD = os.getenv("password")
HOST = os.getenv("host")
PORT = os.getenv("port")
DBNAME = os.getenv("dbname")

print(f"Probando conexión a: {HOST}:{PORT}/{DBNAME} como {USER}")

# Connect to the database
try:
    connection = psycopg2.connect(
        user=USER,
        password=PASSWORD,
        host=HOST,
        port=PORT,
        dbname=DBNAME
    )
    print("¡Conexión exitosa a Supabase!")
    
    # Create a cursor to execute SQL queries
    cursor = connection.cursor()
    
    # Example query
    cursor.execute("SELECT NOW();")
    result = cursor.fetchone()
    print("Hora actual en la DB:", result)

    # Close the cursor and connection
    cursor.close()
    connection.close()
    print("Conexión cerrada.")

except Exception as e:
    print(f"Fallo al conectar: {e}")
