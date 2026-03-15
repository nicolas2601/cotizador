"use client"

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { apiFetch } from "@/lib/api"
import type { UserProfile } from "@/types/negocio"

const TOKEN = "" // TODO: from auth context

export function usePerfil() {
  return useQuery<UserProfile>({
    queryKey: ["perfil"],
    queryFn: () => apiFetch("/auth/me/", { token: TOKEN }),
  })
}

export function useActualizarNegocio() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: Record<string, unknown>) =>
      apiFetch("/auth/me/negocio/", {
        method: "PATCH",
        body: JSON.stringify(data),
        token: TOKEN,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["perfil"] })
    },
  })
}
