const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api"

interface FetchOptions extends RequestInit {
  token?: string
}

export async function apiFetch<T>(path: string, options: FetchOptions = {}): Promise<T> {
  const { token, headers: customHeaders, ...rest } = options

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...customHeaders as Record<string, string>,
  }

  if (token) {
    headers["Authorization"] = `Bearer ${token}`
  }

  const res = await fetch(`${API_URL}${path}`, { headers, ...rest })

  if (!res.ok) {
    const error = await res.json().catch(() => ({ detail: "Error de conexion" }))
    throw new Error(error.detail || `Error ${res.status}`)
  }

  return res.json()
}
