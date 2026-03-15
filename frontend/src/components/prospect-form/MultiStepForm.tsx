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

  // Brand color fallback to purple
  const brandColor = "#800080"

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/3">
      {/* Header area with branding */}
      <div
        className="relative overflow-hidden px-4 pb-8 pt-10 sm:pt-14"
        style={{
          background: `linear-gradient(135deg, ${brandColor}12 0%, transparent 60%)`,
        }}
      >
        <div className="absolute top-0 right-0 h-40 w-40 rounded-full blur-[60px]" style={{ backgroundColor: `${brandColor}10` }} />
        <div className="mx-auto max-w-2xl text-center">
          {cotizador.negocio_logo && (
            <img
              src={cotizador.negocio_logo}
              alt={cotizador.negocio_nombre || "Logo"}
              className="mx-auto mb-4 h-10 object-contain animate-fade-in-up"
            />
          )}
          {!cotizador.negocio_logo && cotizador.negocio_nombre && (
            <p
              className="mb-4 text-sm font-semibold uppercase tracking-widest animate-fade-in-up"
              style={{ color: brandColor }}
            >
              {cotizador.negocio_nombre}
            </p>
          )}
          <h1 className="text-2xl font-semibold tracking-tight animate-fade-in-up" style={{ animationDelay: "0.05s" }}>
            {cotizador.nombre}
          </h1>
          {cotizador.descripcion && (
            <p className="mt-1.5 text-sm text-muted-foreground animate-fade-in-up" style={{ animationDelay: "0.1s" }}>
              {cotizador.descripcion}
            </p>
          )}
        </div>
      </div>

      <div className="mx-auto max-w-2xl px-4 pb-12">
        {/* Progress bar */}
        <div className="mb-6 animate-fade-in-up" style={{ animationDelay: "0.15s" }}>
          <div className="mb-2 flex items-center justify-between text-xs text-muted-foreground">
            <span>
              Paso {pasoActual + 1} de {totalPasos}
            </span>
            <span>{Math.round(progress)}%</span>
          </div>
          <div className="progress-purple">
            <Progress value={progress} className="h-2" />
          </div>
        </div>

        {/* Step content with transition */}
        <div
          key={pasoActual}
          className="animate-in fade-in slide-in-from-right-4 duration-300"
        >
          <Card className="overflow-hidden shadow-sm border-border/60">
            <div className="h-0.5" style={{ background: `linear-gradient(90deg, ${brandColor}, ${brandColor}80)` }} />
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
            className="cursor-pointer gap-2 transition-all duration-200 hover:bg-accent"
          >
            <ArrowLeft className="h-4 w-4" />
            Anterior
          </Button>

          {isLastStep ? (
            <Button
              onClick={enviar}
              disabled={sending}
              className="cursor-pointer gap-2 bg-gradient-to-r from-primary to-[oklch(0.55_0.16_310)] text-white shadow-lg shadow-primary/25 transition-all duration-200 hover:shadow-xl hover:shadow-primary/35 hover:brightness-110 animate-pulse-glow"
              style={{
                background: `linear-gradient(135deg, ${brandColor}, ${brandColor}cc)`,
                boxShadow: `0 4px 14px ${brandColor}30`,
              }}
            >
              {sending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
              {sending ? "Enviando..." : "Recibir mi cotizacion"}
            </Button>
          ) : (
            <Button
              onClick={siguiente}
              className="cursor-pointer gap-2 transition-all duration-200 hover:brightness-110"
              style={{
                background: `linear-gradient(135deg, ${brandColor}, ${brandColor}cc)`,
                color: "white",
              }}
            >
              Siguiente
              <ArrowRight className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
