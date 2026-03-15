"use client"

import { use, useEffect, useState } from "react"
import { useFormBuilderStore } from "@/stores/form-builder-store"
import { FormBuilder } from "@/components/form-builder/FormBuilder"
import { Skeleton } from "@/components/ui/skeleton"

export default function EditarCotizadorPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const cargarCotizador = useFormBuilderStore((s) => s.cargarCotizador)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // TODO: fetch from API when auth is ready
    // apiFetch(`/cotizadores/${id}/`, { token }).then((data) => {
    //   cargarCotizador(data)
    //   setLoading(false)
    // })
    setLoading(false)
  }, [id, cargarCotizador])

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
