"use client"

import { use, useEffect, useState } from "react"
import { useFormBuilderStore } from "@/stores/form-builder-store"
import { useAuthStore } from "@/stores/auth-store"
import { apiFetch } from "@/lib/api"
import { FormBuilder } from "@/components/form-builder/FormBuilder"
import { Skeleton } from "@/components/ui/skeleton"
import type { Cotizador } from "@/types/cotizador"

export default function EditarCotizadorPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const cargarCotizador = useFormBuilderStore((s) => s.cargarCotizador)
  const token = useAuthStore((s) => s.token)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!token) {
      setLoading(false)
      return
    }
    apiFetch<Cotizador>(`/cotizadores/${id}/`, { token })
      .then((data) => {
        cargarCotizador(data)
      })
      .finally(() => {
        setLoading(false)
      })
  }, [id, token, cargarCotizador])

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-[600px] w-full" />
      </div>
    )
  }

  return <FormBuilder mode="editar" cotizadorId={id} />
}
