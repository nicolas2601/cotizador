"use client"

import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"

import { useProspectFormStore } from "@/stores/prospect-form-store"
import type { CotizadorPublico } from "@/types/cotizador"
import { formatCOP } from "@/lib/format"

interface Props {
  cotizador: CotizadorPublico
  respuestas: Record<string, string>
}

function getLabelForCampoId(cotizador: CotizadorPublico, campoId: string): string {
  for (const paso of cotizador.configuracion?.pasos || []) {
    for (const campo of paso.campos) {
      if (campo.id === campoId) return campo.label || campoId
    }
  }
  return campoId
}

function getDisplayValue(cotizador: CotizadorPublico, campoId: string, valor: string): string {
  for (const paso of cotizador.configuracion?.pasos || []) {
    for (const campo of paso.campos) {
      if (campo.id === campoId) {
        if (campo.tipo === "seleccion" && campo.opciones) {
          const opcion = campo.opciones.find((o) => o.valor === valor)
          if (opcion) return opcion.label
        }
        if (campo.tipo === "area_m2") return `${valor} ${campo.unidad || "m\u00B2"}`
        if (campo.tipo === "slider") return `${valor} ${campo.unidad || ""}`
      }
    }
  }
  return valor
}

export function ContactStep({ cotizador, respuestas }: Props) {
  const { prospecto, setProspecto } = useProspectFormStore()

  const respuestasEntries = Object.entries(respuestas).filter(([, v]) => v.trim())

  return (
    <div className="space-y-5">
      {/* Contact fields */}
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="nombre">
            Nombre completo <span className="text-destructive">*</span>
          </Label>
          <Input
            id="nombre"
            placeholder="Tu nombre"
            value={prospecto.nombre}
            onChange={(e) => setProspecto({ nombre: e.target.value })}
            autoComplete="name"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="email">
            Correo electronico <span className="text-destructive">*</span>
          </Label>
          <Input
            id="email"
            type="email"
            placeholder="tu@email.com"
            value={prospecto.email}
            onChange={(e) => setProspecto({ email: e.target.value })}
            autoComplete="email"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="telefono">WhatsApp (opcional)</Label>
          <Input
            id="telefono"
            type="tel"
            placeholder="+57 300 000 0000"
            value={prospecto.telefono}
            onChange={(e) => setProspecto({ telefono: e.target.value })}
            autoComplete="tel"
          />
        </div>
      </div>

      {/* Answers summary */}
      {respuestasEntries.length > 0 && (
        <>
          <Separator />
          <div>
            <p className="mb-3 text-xs font-medium text-muted-foreground">
              Resumen de tus respuestas
            </p>
            <div className="space-y-1.5">
              {respuestasEntries.map(([campoId, valor]) => (
                <div
                  key={campoId}
                  className="flex items-center justify-between rounded bg-muted/50 px-3 py-2 text-sm"
                >
                  <span className="text-muted-foreground">
                    {getLabelForCampoId(cotizador, campoId)}
                  </span>
                  <span className="font-medium">
                    {getDisplayValue(cotizador, campoId, valor)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  )
}
