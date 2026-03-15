"use client"

import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Slider } from "@/components/ui/slider"

import { useProspectFormStore } from "@/stores/prospect-form-store"
import type { Campo } from "@/types/cotizador"
import { formatCOP } from "@/lib/format"

interface Props {
  campos: Campo[]
}

export function StepRenderer({ campos }: Props) {
  const { respuestas, setRespuesta } = useProspectFormStore()

  return (
    <div className="space-y-5">
      {campos.map((campo) => (
        <div key={campo.id} className="space-y-2">
          <Label htmlFor={campo.id} className="text-sm font-medium">
            {campo.label}
            {campo.requerido && <span className="ml-0.5 text-destructive">*</span>}
          </Label>

          {campo.tipo === "texto" && (
            <Input
              id={campo.id}
              placeholder={campo.placeholder || ""}
              value={respuestas[campo.id] || ""}
              onChange={(e) => setRespuesta(campo.id, e.target.value)}
            />
          )}

          {campo.tipo === "numero" && (
            <Input
              id={campo.id}
              type="number"
              placeholder={campo.placeholder || "0"}
              min={campo.min ?? undefined}
              max={campo.max ?? undefined}
              value={respuestas[campo.id] || ""}
              onChange={(e) => setRespuesta(campo.id, e.target.value)}
            />
          )}

          {campo.tipo === "seleccion" && campo.opciones && (
            <RadioGroup
              value={respuestas[campo.id] || ""}
              onValueChange={(val) => setRespuesta(campo.id, val)}
              className="space-y-2"
            >
              {campo.opciones.map((opcion) => (
                <label
                  key={opcion.valor}
                  className="flex cursor-pointer items-center gap-3 rounded-lg border px-4 py-3 transition-colors hover:bg-muted/50 has-[data-state=checked]:border-primary has-[data-state=checked]:bg-primary/5"
                >
                  <RadioGroupItem value={opcion.valor} />
                  <span className="flex-1 text-sm">{opcion.label}</span>
                  {opcion.valor && !isNaN(Number(opcion.valor)) && (
                    <span className="text-xs font-medium text-muted-foreground">
                      {formatCOP(Number(opcion.valor))}
                    </span>
                  )}
                </label>
              ))}
            </RadioGroup>
          )}

          {campo.tipo === "area_m2" && (
            <div className="relative">
              <Input
                id={campo.id}
                type="number"
                placeholder={campo.placeholder || "0"}
                min={campo.min ?? 0}
                max={campo.max ?? undefined}
                value={respuestas[campo.id] || ""}
                onChange={(e) => setRespuesta(campo.id, e.target.value)}
                className="pr-12"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
                {campo.unidad || "m\u00B2"}
              </span>
            </div>
          )}

          {campo.tipo === "slider" && (
            <div className="space-y-3 pt-1">
              <Slider
                value={[Number(respuestas[campo.id]) || campo.min || 0]}
                onValueChange={([val]) => setRespuesta(campo.id, String(val))}
                min={campo.min ?? 0}
                max={campo.max ?? 100}
                step={campo.step ?? 1}
                className="cursor-pointer"
              />
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>{campo.min ?? 0}</span>
                <span className="rounded bg-primary/10 px-2 py-0.5 font-medium text-primary">
                  {respuestas[campo.id] || campo.min || 0} {campo.unidad || ""}
                </span>
                <span>{campo.max ?? 100}</span>
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  )
}
