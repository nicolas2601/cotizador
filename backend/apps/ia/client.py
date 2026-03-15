import asyncio
import logging

import httpx
from django.conf import settings

logger = logging.getLogger(__name__)


class OllamaCloudError(Exception):
    pass


class OllamaCloudClient:
    def __init__(self):
        self.api_key = settings.OLLAMA_CLOUD_API_KEY
        self.base_url = settings.OLLAMA_CLOUD_BASE_URL
        self.model = settings.OLLAMA_MODEL
        self.max_retries = 3
        self.timeout = 120

    async def chat(self, prompt: str, system: str = "") -> str:
        messages = []
        if system:
            messages.append({"role": "system", "content": system})
        messages.append({"role": "user", "content": prompt})

        last_error = None
        for attempt in range(self.max_retries):
            try:
                async with httpx.AsyncClient(
                    timeout=self.timeout,
                    follow_redirects=True,
                ) as client:
                    response = await client.post(
                        f"{self.base_url}/chat/completions",
                        headers={
                            "Authorization": f"Bearer {self.api_key}",
                            "Content-Type": "application/json",
                        },
                        json={
                            "model": self.model,
                            "messages": messages,
                            "temperature": 0.7,
                        },
                    )

                if response.status_code == 429:
                    wait = 2 ** attempt
                    logger.warning(f"Rate limit, reintentando en {wait}s...")
                    await asyncio.sleep(wait)
                    continue

                if response.status_code == 401:
                    raise OllamaCloudError(
                        "API key de Ollama Cloud invalida o expirada. "
                        "Renuevala en https://ollama.com/settings"
                    )

                if response.status_code >= 400:
                    body = response.text[:200] if response.text else "sin cuerpo"
                    raise OllamaCloudError(
                        f"Error API ({response.status_code}): {body}"
                    )

                if not response.text:
                    raise OllamaCloudError("Respuesta vacia de Ollama Cloud")

                data = response.json()

                if "choices" not in data or not data["choices"]:
                    raise OllamaCloudError(f"Respuesta sin choices: {str(data)[:200]}")

                return data["choices"][0]["message"]["content"]

            except (httpx.TimeoutException, httpx.ConnectError) as e:
                last_error = OllamaCloudError(f"Error de conexion: {str(e)}")
                wait = 2 ** attempt
                logger.warning(f"Conexion fallida, reintentando en {wait}s (intento {attempt + 1})")
                await asyncio.sleep(wait)

            except OllamaCloudError:
                raise

            except Exception as e:
                last_error = OllamaCloudError(f"Error inesperado: {str(e)}")
                logger.error(f"Error inesperado en Ollama: {e}")
                break

        raise last_error or OllamaCloudError("Error desconocido tras reintentos")

    def chat_sync(self, prompt: str, system: str = "") -> str:
        return asyncio.run(self.chat(prompt, system))
