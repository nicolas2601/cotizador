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
        self.timeout = 60

    async def chat(self, prompt: str, system: str = "") -> str:
        messages = []
        if system:
            messages.append({"role": "system", "content": system})
        messages.append({"role": "user", "content": prompt})

        last_error = None
        for attempt in range(self.max_retries):
            try:
                async with httpx.AsyncClient(timeout=self.timeout) as client:
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
                    logger.warning(f"Rate limit alcanzado, reintentando en {wait}s...")
                    await asyncio.sleep(wait)
                    continue

                if response.status_code >= 400:
                    raise OllamaCloudError(
                        f"Error API ({response.status_code}): {response.text}"
                    )

                data = response.json()
                return data["choices"][0]["message"]["content"]

            except httpx.TimeoutException:
                last_error = OllamaCloudError("Timeout al conectar con Ollama Cloud")
                wait = 2 ** attempt
                logger.warning(f"Timeout, reintentando en {wait}s (intento {attempt + 1}/{self.max_retries})")
                await asyncio.sleep(wait)

            except httpx.HTTPError as e:
                last_error = OllamaCloudError(f"Error de conexion: {str(e)}")
                wait = 2 ** attempt
                logger.warning(f"Error HTTP, reintentando en {wait}s")
                await asyncio.sleep(wait)

        raise last_error or OllamaCloudError("Error desconocido tras reintentos")

    def chat_sync(self, prompt: str, system: str = "") -> str:
        try:
            loop = asyncio.get_event_loop()
            if loop.is_running():
                import concurrent.futures
                with concurrent.futures.ThreadPoolExecutor() as pool:
                    return pool.submit(
                        asyncio.run, self.chat(prompt, system)
                    ).result()
            return loop.run_until_complete(self.chat(prompt, system))
        except RuntimeError:
            return asyncio.run(self.chat(prompt, system))
