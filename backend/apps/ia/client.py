import asyncio
import logging

import httpx
from django.conf import settings

logger = logging.getLogger(__name__)


class AIClientError(Exception):
    pass


# Mantener compatibilidad con imports existentes
OllamaCloudError = AIClientError
OllamaCloudClient = None  # Se redefine abajo


class GroqClient:
    """Cliente para Groq API (compatible con OpenAI). Modelo: llama-3.3-70b-versatile."""

    BASE_URL = "https://api.groq.com/openai/v1"

    def __init__(self):
        self.api_key = settings.GROQ_API_KEY
        self.model = settings.GROQ_MODEL
        self.max_retries = 3
        self.timeout = 120

    async def chat(self, prompt: str, system: str = "", json_mode: bool = False) -> str:
        messages = []
        if system:
            messages.append({"role": "system", "content": system})
        messages.append({"role": "user", "content": prompt})

        body = {
            "model": self.model,
            "messages": messages,
            "temperature": 0.7,
        }
        if json_mode:
            body["response_format"] = {"type": "json_object"}

        last_error = None
        for attempt in range(self.max_retries):
            try:
                async with httpx.AsyncClient(
                    timeout=self.timeout,
                    follow_redirects=True,
                ) as client:
                    response = await client.post(
                        f"{self.BASE_URL}/chat/completions",
                        headers={
                            "Authorization": f"Bearer {self.api_key}",
                            "Content-Type": "application/json",
                        },
                        json=body,
                    )

                if response.status_code == 429:
                    wait = 2 ** attempt
                    logger.warning(f"Rate limit Groq, reintentando en {wait}s...")
                    await asyncio.sleep(wait)
                    continue

                if response.status_code == 401:
                    raise AIClientError("API key de Groq invalida. Renovala en console.groq.com")

                if response.status_code >= 400:
                    detail = response.text[:300] if response.text else "sin detalle"
                    raise AIClientError(f"Error Groq ({response.status_code}): {detail}")

                if not response.text:
                    raise AIClientError("Respuesta vacia de Groq")

                data = response.json()

                if "choices" not in data or not data["choices"]:
                    raise AIClientError(f"Respuesta sin choices: {str(data)[:200]}")

                return data["choices"][0]["message"]["content"]

            except (httpx.TimeoutException, httpx.ConnectError) as e:
                last_error = AIClientError(f"Error de conexion con Groq: {str(e)}")
                wait = 2 ** attempt
                logger.warning(f"Conexion fallida, reintentando en {wait}s")
                await asyncio.sleep(wait)

            except AIClientError:
                raise

            except Exception as e:
                last_error = AIClientError(f"Error inesperado: {str(e)}")
                logger.error(f"Error inesperado Groq: {e}")
                break

        raise last_error or AIClientError("Error desconocido tras reintentos")

    def chat_sync(self, prompt: str, system: str = "", json_mode: bool = False) -> str:
        return asyncio.run(self.chat(prompt, system, json_mode))


# Alias para compatibilidad
OllamaCloudClient = GroqClient
