"use client"

import { useEffect } from "react"
import { useProspectFormStore } from "@/stores/prospect-form-store"
import type { CotizadorPublico } from "@/types/cotizador"
import { MultiStepForm } from "./MultiStepForm"
import { ConfirmationPage } from "./ConfirmationPage"

interface Props {
  cotizador: CotizadorPublico
  slug: string
}

export function ProspectFormWrapper({ cotizador, slug }: Props) {
  const { iniciar, enviado } = useProspectFormStore()

  useEffect(() => {
    iniciar(slug)
  }, [slug, iniciar])

  if (enviado) {
    return (
      <ConfirmationPage
        negocioNombre={cotizador.negocio_nombre}
        negocioLogo={cotizador.negocio_logo}
        onReset={() => {
          useProspectFormStore.getState().reset()
          useProspectFormStore.getState().iniciar(slug)
        }}
      />
    )
  }

  return <MultiStepForm cotizador={cotizador} />
}
