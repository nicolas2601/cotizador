"use client"

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { apiFetch } from "@/lib/api"
import { useAuthStore } from "@/stores/auth-store"
import type { UserProfile } from "@/types/negocio"

export function usePerfil() {
  const token = useAuthStore((s) => s.token)

  return useQuery<UserProfile>({
    queryKey: ["perfil"],
    queryFn: () => apiFetch("/auth/me/", { token }),
    enabled: !!token,
    staleTime: 60_000,
    refetchOnWindowFocus: true,
  })
}

export function useActualizarNegocio() {
  const token = useAuthStore((s) => s.token)
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: Record<string, unknown>) =>
      apiFetch("/auth/me/negocio/", {
        method: "PATCH",
        body: JSON.stringify(data),
        token,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["perfil"] })
    },
  })
}
