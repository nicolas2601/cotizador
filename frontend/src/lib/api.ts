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
      const retryRes = await fetch(`${API_URL}${path}`, { headers, ...rest })

      if (!retryRes.ok) {
        const error = await retryRes.json().catch(() => ({ detail: "Error de conexion" }))
        throw new Error(error.detail || `Error ${retryRes.status}`)
      }

      return retryRes.json()
    }

    // Refresh failed — error already handled in refreshAccessToken
    throw new Error("Sesion expirada. Por favor inicia sesion de nuevo.")
  }

  if (!res.ok) {
    const error = await res.json().catch(() => ({ detail: "Error de conexion" }))
    throw new Error(error.detail || `Error ${res.status}`)
  }

  return res.json()
}
