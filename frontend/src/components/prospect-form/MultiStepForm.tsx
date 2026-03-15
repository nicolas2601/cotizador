"use client"

import { useState } from "react"
import { ArrowLeft, ArrowRight, Send, Loader2 } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"

import { useProspectFormStore } from "@/stores/prospect-form-store"
import type { CotizadorPublico } from "@/types/cotizador"
import { StepRenderer } from "./StepRenderer"
import { PriceDisplay } from "./PriceDisplay"
import { ContactStep } from "./ContactStep"

interface Props {
  cotizador: CotizadorPublico
}

export function MultiStepForm({ cotizador }: Props) {
  const { pasoActual, setPasoActual, respuestas, prospecto } = useProspectFormStore()
  const [sending, setSending] = useState(false)

  const pasos = cotizador.configuracion?.pasos || []
  const totalPasos = pasos.length + 1 // +1 for contact step
  const progress = ((pasoActual + 1) / totalPasos) * 100
  const isLastStep = pasoActual === pasos.length
  const isFormStep = pasoActual < pasos.length

  function validarPasoActual(): boolean {
    if (!isFormStep) {
      if (!prospecto.nombre.trim()) {
        toast.error("El nombre es obligatorio")
        return false
      }
      if (!prospecto.email.trim() || !prospecto.email.includes("@")) {
        toast.error("Ingresa un email valido")
        return false
      }
      return true
    }

    const paso = pasos[pasoActual]
    for (const campo of paso.campos) {
      if (campo.requerido && !respuestas[campo.id]?.trim()) {
        toast.error(`El campo "${campo.label}" es obligatorio`)
        return false
      }
    }
    return true
  }

  function siguiente() {
    if (!validarPasoActual()) return
    setPasoActual(pasoActual + 1)
  }

  function anterior() {
    if (pasoActual > 0) setPasoActual(pasoActual - 1)
  }

  async function enviar() {
    if (!validarPasoActual()) return
    setSending(true)

    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api"
      const negocioSlug = cotizador.negocio_nombre?.toLowerCase().replace(/\s+/g, "-") || "tikno"

      const res = await fetch(
        `${API_URL}/public/${negocioSlug}/${cotizador.slug}/cotizar/`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            nombre: prospecto.nombre,
            email: prospecto.email,
            telefono: prospecto.telefono,
            respuestas,
          }),
        }
      )

      if (!res.ok) throw new Error("Error al enviar")

      useProspectFormStore.getState().setEnviado(true)
    } catch {
      toast.error("No se pudo enviar la cotizacion. Intenta de nuevo.")
    } finally {
      setSending(false)
    }
  }

  const pasoActualData = isFormStep ? pasos[pasoActual] : null

  return (
    <div className="mx-auto max-w-2xl px-4 py-8 sm:py-12">
      {/* Header */}
      <div className="mb-8 text-center">
        {cotizador.negocio_logo && (
          <img
            src={cotizador.negocio_logo}
            alt={cotizador.negocio_nombre || "Logo"}
            className="mx-auto mb-4 h-10 object-contain"
          />
        )}
        <h1 className="text-2xl font-semibold tracking-tight">
          {cotizador.nombre}
        </h1>
        {cotizador.descripcion && (
          <p className="mt-1.5 text-sm text-muted-foreground">
            {cotizador.descripcion}
          </p>
        )}
      </div>

      {/* Progress bar */}
      <div className="mb-6">
        <div className="mb-2 flex items-center justify-between text-xs text-muted-foreground">
          <span>
            Paso {pasoActual + 1} de {totalPasos}
          </span>
          <span>{Math.round(progress)}%</span>
        </div>
        <Progress value={progress} className="h-1.5" />
      </div>

      {/* Step content with transition */}
      <div
        key={pasoActual}
        className="animate-in fade-in slide-in-from-right-4 duration-300"
      >
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">
              {isFormStep ? pasoActualData?.titulo || `Paso ${pasoActual + 1}` : "Datos de contacto"}
            </CardTitle>
            {isFormStep && pasoActualData?.descripcion && (
              <CardDescription>{pasoActualData.descripcion}</CardDescription>
            )}
            {isLastStep && (
              <CardDescription>
                Completa tus datos para recibir la cotizacion en tu correo
              </CardDescription>
            )}
          </CardHeader>

          <CardContent className="space-y-5">
            {isFormStep && pasoActualData ? (
              <StepRenderer campos={pasoActualData.campos} />
            ) : (
              <ContactStep cotizador={cotizador} respuestas={respuestas} />
            )}
          </CardContent>
        </Card>
      </div>

      {/* Price display */}
      <PriceDisplay cotizador={cotizador} />

      {/* Navigation */}
      <div className="mt-6 flex items-center justify-between">
        <Button
          variant="outline"
          onClick={anterior}
          disabled={pasoActual === 0}
          className="gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Anterior
        </Button>

        {isLastStep ? (
          <Button onClick={enviar} disabled={sending} className="gap-2">
            {sending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
            {sending ? "Enviando..." : "Recibir mi cotizacion"}
          </Button>
        ) : (
          <Button onClick={siguiente} className="gap-2">
            Siguiente
            <ArrowRight className="h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  )
}
