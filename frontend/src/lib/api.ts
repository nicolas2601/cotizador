import { useAuthStore } from "@/stores/auth-store"

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api"

interface FetchOptions extends RequestInit {
  token?: string
}

let isRefreshing = false
let refreshPromise: Promise<string | null> | null = null

async function refreshAccessToken(): Promise<string | null> {
  const { refresh, login, logout, user } = useAuthStore.getState()

  if (!refresh) {
    logout()
    return null
  }

  try {
    const res = await fetch(`${API_URL}/auth/token/refresh/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refresh }),
    })

    if (!res.ok) {
      logout()
      if (typeof window !== "undefined") {
        window.location.href = "/login"
      }
      return null
    }

    const data = await res.json()
    login({
      access: data.access,
      refresh: data.refresh || refresh,
      user,
    })
    return data.access
  } catch {
    logout()
    if (typeof window !== "undefined") {
      window.location.href = "/login"
    }
    return null
  }
}

function friendlyError(status: number): string {
  switch (status) {
    case 401:
      return "Tu sesion expiro"
    case 403:
      return "No tienes permiso"
    case 404:
      return "No encontrado"
    case 429:
      return "Demasiados intentos, espera un momento"
    default:
      if (status >= 500) return "Error del servidor, intenta de nuevo"
      return "Ocurrio un error, intenta de nuevo"
  }
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

  let res: Response
  try {
    res = await fetch(`${API_URL}${path}`, { headers, ...rest })
  } catch {
    throw new Error("Error de conexion, verifica tu internet")
  }

  // If 401 and we have a token, attempt refresh
  if (res.status === 401 && token) {
    // Deduplicate concurrent refresh attempts
    if (!isRefreshing) {
      isRefreshing = true
      refreshPromise = refreshAccessToken().finally(() => {
        isRefreshing = false
        refreshPromise = null
      })
    }

    const newToken = await (refreshPromise ?? refreshAccessToken())

    if (newToken) {
      // Retry the original request with the new token
      headers["Authorization"] = `Bearer ${newToken}`
      let retryRes: Response
      try {
        retryRes = await fetch(`${API_URL}${path}`, { headers, ...rest })
      } catch {
        throw new Error("Error de conexion, verifica tu internet")
      }

      if (!retryRes.ok) {
        throw new Error(friendlyError(retryRes.status))
      }

      return retryRes.json()
    }

    // Refresh failed — error already handled in refreshAccessToken
    throw new Error("Tu sesion expiro")
  }

  if (!res.ok) {
    throw new Error(friendlyError(res.status))
  }

  return res.json()
}
