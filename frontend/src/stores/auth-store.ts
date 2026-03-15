import { create } from "zustand"
import { persist } from "zustand/middleware"

interface AuthState {
  token: string
  refresh: string
  user: { id: number; email: string } | null
  isAuthenticated: boolean

  login: (data: { access: string; refresh: string; user: any }) => void
  logout: () => void
  getToken: () => string
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      token: "",
      refresh: "",
      user: null,
      isAuthenticated: false,

      login: (data) =>
        set({
          token: data.access,
          refresh: data.refresh,
          user: data.user,
          isAuthenticated: true,
        }),

      logout: () =>
        set({
          token: "",
          refresh: "",
          user: null,
          isAuthenticated: false,
        }),

      getToken: () => get().token,
    }),
    { name: "tikno-auth" }
  )
)
