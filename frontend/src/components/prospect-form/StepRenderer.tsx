"use client"

import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Slider } from "@/components/ui/slider"

import { useProspectFormStore } from "@/stores/prospect-form-store"
import type { Campo } from "@/types/cotizador"

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
              className="transition-all duration-200 focus-visible:ring-primary/40"
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
              className="transition-all duration-200 focus-visible:ring-primary/40"
            />
          )}

          {campo.tipo === "seleccion" && campo.opciones && (
            <RadioGroup
              value={respuestas[campo.id] || ""}
              onValueChange={(val) => setRespuesta(campo.id, val)}
              className="space-y-2"
            >
              {campo.opciones.map((opcion, i) => (
                <label
                  key={`${campo.id}-${i}`}
                  className="flex cursor-pointer items-center gap-3 rounded-lg border px-4 py-3 transition-all duration-200 hover:bg-primary/3 hover:border-primary/30 has-[data-state=checked]:border-primary has-[data-state=checked]:bg-primary/5 has-[data-state=checked]:shadow-sm has-[data-state=checked]:shadow-primary/10"
                >
                  <RadioGroupItem value={opcion.valor} />
                  <div className="flex-1">
                    <span className="text-sm">{opcion.label}</span>
                    {opcion.descripcion && (
                      <p className="mt-0.5 text-xs text-muted-foreground leading-snug">{opcion.descripcion}</p>
                    )}
                  </div>
                </label>
              ))}
            </RadioGroup>
          )}

          {campo.tipo === "multiple" && campo.opciones && (
            <div className="space-y-2">
              {campo.opciones.map((opcion, i) => {
                const current = respuestas[campo.id] || ""
                const selected = current ? current.split("|") : []
                const isChecked = selected.includes(opcion.valor)

                function toggle() {
                  let next: string[]
                  if (isChecked) {
                    next = selected.filter((v) => v !== opcion.valor)
                  } else {
                    next = [...selected, opcion.valor]
                  }
                  setRespuesta(campo.id, next.join("|"))
                }

                return (
                  <label
                    key={`${campo.id}-${i}`}
                    className="flex cursor-pointer items-center gap-3 rounded-lg border px-4 py-3 transition-all duration-200 hover:bg-primary/3 hover:border-primary/30 has-[data-state=checked]:border-primary has-[data-state=checked]:bg-primary/5"
                  >
                    <Checkbox checked={isChecked} onCheckedChange={toggle} />
                    <div className="flex-1">
                      <span className="text-sm">{opcion.label}</span>
                      {opcion.descripcion && (
                        <p className="mt-0.5 text-xs text-muted-foreground leading-snug">{opcion.descripcion}</p>
                      )}
                    </div>
                  </label>
                )
              })}
            </div>
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
                className="pr-12 transition-all duration-200 focus-visible:ring-primary/40"
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
                <span className="rounded-full bg-gradient-to-r from-primary/15 to-primary/8 px-3 py-1 font-semibold text-primary">
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
