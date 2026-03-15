"use client"

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { apiFetch } from "@/lib/api"
import type { Cotizacion, EstadoCotizacion } from "@/types/cotizacion"

const TOKEN = "" // TODO: from auth context

export function useCotizaciones() {
  return useQuery<Cotizacion[]>({
    queryKey: ["cotizaciones"],
    queryFn: () => apiFetch("/cotizaciones/", { token: TOKEN }),
  })
}

export function useCambiarEstado() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, estado }: { id: string; estado: EstadoCotizacion }) =>
      apiFetch(`/cotizaciones/${id}/estado/`, {
        method: "PATCH",
        body: JSON.stringify({ estado }),
        token: TOKEN,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cotizaciones"] })
    },
  })
}
