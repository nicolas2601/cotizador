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
    staleTime: 30_000,
    refetchOnWindowFocus: true,
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

export function useChatIA() {
  const token = useAuthStore((s) => s.token)
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, mensaje }: { id: string; mensaje: string }) =>
      apiFetch<{
        respuesta: string
        descripcion_actualizada: boolean
        pdf_regenerado: boolean
        cotizacion: Cotizacion
      }>(`/cotizaciones/${id}/chat-ia/`, {
        method: "POST",
        body: JSON.stringify({ mensaje }),
        token,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cotizaciones"] })
    },
  })
}

export function useReenviar() {
  const token = useAuthStore((s) => s.token)

  return useMutation({
    mutationFn: ({ id, canal }: { id: string; canal: "email" }) =>
      apiFetch<{ detail: string; canal: string }>(`/cotizaciones/${id}/reenviar/`, {
        method: "POST",
        body: JSON.stringify({ canal }),
        token,
      }),
  })
}
