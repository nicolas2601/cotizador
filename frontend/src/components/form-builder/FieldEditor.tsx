"use client"

import { Plus, Trash2, X } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"

import { useFormBuilderStore } from "@/stores/form-builder-store"
import type { Campo } from "@/types/cotizador"

const TIPO_LABELS: Record<string, string> = {
  texto: "Texto",
  numero: "Numero",
  seleccion: "Seleccion unica",
  multiple: "Seleccion multiple",
  area_m2: "Area m2",
  slider: "Slider",
}

interface FieldEditorProps {
  pasoId: string
  campo: Campo
}

export function FieldEditor({ pasoId, campo }: FieldEditorProps) {
  const { actualizarCampo, eliminarCampo } = useFormBuilderStore()

  function update(data: Partial<Campo>) {
    actualizarCampo(pasoId, campo.id, data)
  }

  function agregarOpcion() {
    const opciones = [...(campo.opciones || []), { label: "", valor: "" }]
    update({ opciones })
  }

  function actualizarOpcion(index: number, key: "label" | "valor", value: string) {
    const opciones = [...(campo.opciones || [])]
    opciones[index] = { ...opciones[index], [key]: value }
    update({ opciones })
  }

  function eliminarOpcion(index: number) {
    const opciones = (campo.opciones || []).filter((_, i) => i !== index)
    update({ opciones })
  }

  return (
    <div className="group rounded-lg border bg-card p-3 transition-colors hover:border-primary/20">
      <div className="mb-3 flex items-center gap-2">
        <Badge variant="outline" className="text-xs font-normal">
          {TIPO_LABELS[campo.tipo] || campo.tipo}
        </Badge>
        <span className="flex-1 truncate text-sm font-medium">
          {campo.label || "Sin label"}
        </span>
        <div className="flex items-center gap-1.5">
          <Label htmlFor={`req-${campo.id}`} className="text-xs text-muted-foreground">
            Requerido
          </Label>
          <Switch
            id={`req-${campo.id}`}
            checked={campo.requerido}
            onCheckedChange={(checked) => update({ requerido: checked })}
          />
        </div>
        <Button
          variant="ghost"
          size="icon-xs"
          className="text-muted-foreground opacity-0 group-hover:opacity-100"
          onClick={() => eliminarCampo(pasoId, campo.id)}
        >
          <Trash2 className="h-3.5 w-3.5" />
        </Button>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <Label className="text-xs">Label</Label>
          <Input
            placeholder="Ej: Tipo de proyecto"
            value={campo.label}
            onChange={(e) => update({ label: e.target.value })}
            className="h-8 text-sm"
          />
        </div>
        <div>
          <Label className="text-xs">Placeholder</Label>
          <Input
            placeholder="Texto de ayuda..."
            value={campo.placeholder || ""}
            onChange={(e) => update({ placeholder: e.target.value })}
            className="h-8 text-sm"
          />
        </div>
      </div>

      {/* Opciones para tipo seleccion */}
      {(campo.tipo === "seleccion" || campo.tipo === "multiple") && (
        <div className="mt-3 space-y-2">
          <div className="flex items-center justify-between">
            <Label className="text-xs">Opciones</Label>
            <Button variant="ghost" size="sm" onClick={agregarOpcion} className="h-6 text-xs">
              <Plus className="mr-1 h-3 w-3" />
              Opcion
            </Button>
          </div>
          {(campo.opciones || []).map((opcion, i) => (
            <div key={i} className="flex items-center gap-2">
              <Input
                placeholder="Label"
                value={opcion.label}
                onChange={(e) => actualizarOpcion(i, "label", e.target.value)}
                className="h-7 text-xs"
              />
              <Input
                placeholder="Valor (COP)"
                value={opcion.valor}
                onChange={(e) => actualizarOpcion(i, "valor", e.target.value)}
                className="h-7 w-28 text-xs"
              />
              <Button
                variant="ghost"
                size="icon-xs"
                onClick={() => eliminarOpcion(i)}
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          ))}
        </div>
      )}

      {/* Config para slider */}
      {campo.tipo === "slider" && (
        <div className="mt-3 grid grid-cols-4 gap-2">
          <div>
            <Label className="text-xs">Min</Label>
            <Input
              type="number"
              value={campo.min ?? 0}
              onChange={(e) => update({ min: Number(e.target.value) })}
              className="h-7 text-xs"
            />
          </div>
          <div>
            <Label className="text-xs">Max</Label>
            <Input
              type="number"
              value={campo.max ?? 100}
              onChange={(e) => update({ max: Number(e.target.value) })}
              className="h-7 text-xs"
            />
          </div>
          <div>
            <Label className="text-xs">Step</Label>
            <Input
              type="number"
              value={campo.step ?? 1}
              onChange={(e) => update({ step: Number(e.target.value) })}
              className="h-7 text-xs"
            />
          </div>
          <div>
            <Label className="text-xs">Unidad</Label>
            <Input
              placeholder="paginas"
              value={campo.unidad || ""}
              onChange={(e) => update({ unidad: e.target.value })}
              className="h-7 text-xs"
            />
          </div>
        </div>
      )}

      {/* Config para area_m2 y numero */}
      {(campo.tipo === "area_m2" || campo.tipo === "numero") && (
        <div className="mt-3 grid grid-cols-3 gap-2">
          <div>
            <Label className="text-xs">Min</Label>
            <Input
              type="number"
              value={campo.min ?? ""}
              onChange={(e) => update({ min: e.target.value ? Number(e.target.value) : null })}
              className="h-7 text-xs"
            />
          </div>
          <div>
            <Label className="text-xs">Max</Label>
            <Input
              type="number"
              value={campo.max ?? ""}
              onChange={(e) => update({ max: e.target.value ? Number(e.target.value) : null })}
              className="h-7 text-xs"
            />
          </div>
          {campo.tipo === "area_m2" && (
            <div>
              <Label className="text-xs">Unidad</Label>
              <Input
                value={campo.unidad || "m2"}
                onChange={(e) => update({ unidad: e.target.value })}
                className="h-7 text-xs"
              />
            </div>
          )}
        </div>
      )}
    </div>
  )
}
