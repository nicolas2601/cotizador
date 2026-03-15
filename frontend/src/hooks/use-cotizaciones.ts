"use client"

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { apiFetch } from "@/lib/api"
import { useAuthStore } from "@/stores/auth-store"
import type { Cotizacion, EstadoCotizacion } from "@/types/cotizacion"

export function useCotizaciones() {
  const token = useAuthStore((s) => s.token)

  return useQuery<Cotizacion[]>({
    queryKey: ["cotizaciones"],
    queryFn: () => apiFetch("/cotizaciones/", { token }),
    enabled: !!token,
  })
}

export function useCambiarEstado() {
  const token = useAuthStore((s) => s.token)
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, estado }: { id: string; estado: EstadoCotizacion }) =>
      apiFetch(`/cotizaciones/${id}/estado/`, {
        method: "PATCH",
        body: JSON.stringify({ estado }),
        token,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cotizaciones"] })
    },
  })
}
