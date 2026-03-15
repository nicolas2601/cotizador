"use client"

import { Plus, Trash2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

import { useFormBuilderStore } from "@/stores/form-builder-store"

function obtenerVariablesDisponibles(
  pasos: { campos: { id: string; label: string; tipo: string }[] }[]
) {
  const variables: { id: string; label: string }[] = []
  for (const paso of pasos) {
    for (const campo of paso.campos) {
      if (["numero", "seleccion", "area_m2", "slider"].includes(campo.tipo)) {
        variables.push({ id: campo.id, label: campo.label || campo.id })
      }
    }
  }
  return variables
}

function formulaLegible(formula: string, variablesMap: Map<string, string>): string {
  if (!formula) return "Sin formula"
  let readable = formula
  variablesMap.forEach((label, id) => {
    readable = readable.replaceAll(id, label)
  })
  return readable
    .replace(/\*/g, " x ")
    .replace(/\+/g, " + ")
    .replace(/\-/g, " - ")
    .replace(/\//g, " / ")
    .replace(/\s+/g, " ")
    .trim()
}

export function PricingRuleEditor() {
  const { reglasPrecio, configuracion, agregarRegla, eliminarRegla, actualizarRegla } =
    useFormBuilderStore()

  const variablesDisponibles = obtenerVariablesDisponibles(configuracion.pasos)
  const variablesMap = new Map(variablesDisponibles.map((v) => [v.id, v.label]))

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium">Reglas de precio</p>
          <p className="text-xs text-muted-foreground">
            Define como se calcula el precio segun las respuestas
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={agregarRegla}>
          <Plus className="mr-1 h-3.5 w-3.5" />
          Regla
        </Button>
      </div>

      {reglasPrecio.length === 0 ? (
        <Card className="flex flex-col items-center py-10 text-center">
          <p className="text-sm text-muted-foreground">Sin reglas de precio</p>
          <p className="mt-1 text-xs text-muted-foreground">
            Agrega una regla para definir como se calcula el precio
          </p>
          <Button variant="ghost" size="sm" className="mt-3" onClick={agregarRegla}>
            Agregar primera regla
          </Button>
        </Card>
      ) : (
        <div className="space-y-3">
          {reglasPrecio.map((regla) => (
            <Card key={regla.id}>
              <CardContent className="pt-4">
                <div className="mb-3 flex items-center gap-2">
                  <Input
                    placeholder="Nombre de la regla"
                    value={regla.nombre}
                    onChange={(e) => actualizarRegla(regla.id, { nombre: e.target.value })}
                    className="h-8 text-sm font-medium"
                  />
                  <div className="flex items-center gap-1.5">
                    <Label className="text-xs text-muted-foreground">Activa</Label>
                    <Switch
                      checked={regla.activa}
                      onCheckedChange={(checked) => actualizarRegla(regla.id, { activa: checked })}
                    />
                  </div>
                  <Button
                    variant="ghost"
                    size="icon-xs"
                    onClick={() => eliminarRegla(regla.id)}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>

                {/* Variables disponibles */}
                {variablesDisponibles.length > 0 && (
                  <div className="mb-3">
                    <p className="mb-1.5 text-xs text-muted-foreground">
                      Variables disponibles (click para insertar)
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {variablesDisponibles.map((v) => (
                        <TooltipProvider key={v.id}>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Badge
                                variant="secondary"
                                className="cursor-pointer text-xs transition-colors hover:bg-primary/10 hover:text-primary"
                                onClick={() => {
                                  const formula = regla.formula
                                    ? `${regla.formula} ${v.id}`
                                    : v.id
                                  actualizarRegla(regla.id, { formula })
                                }}
                              >
                                {v.label}
                              </Badge>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p className="font-mono text-xs">{v.id}</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      ))}
                      {/* Operadores */}
                      {["+", "*", "(", ")"].map((op) => (
                        <Badge
                          key={op}
                          variant="outline"
                          className="cursor-pointer font-mono text-xs"
                          onClick={() =>
                            actualizarRegla(regla.id, {
                              formula: `${regla.formula} ${op}`,
                            })
                          }
                        >
                          {op}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {/* Formula input */}
                <div>
                  <Label className="text-xs">Formula</Label>
                  <Input
                    placeholder="Ej: tipo_proyecto + num_paginas * precio_por_pagina"
                    value={regla.formula}
                    onChange={(e) => actualizarRegla(regla.id, { formula: e.target.value })}
                    className="font-mono text-sm"
                  />
                </div>

                {/* Preview legible */}
                {regla.formula && (
                  <div className="mt-2 rounded bg-muted/50 px-3 py-2">
                    <p className="text-xs text-muted-foreground">Preview:</p>
                    <p className="text-sm font-medium">
                      {formulaLegible(regla.formula, variablesMap)}
                    </p>
                  </div>
                )}

                {/* Variables fijas */}
                <div className="mt-3">
                  <div className="mb-1.5 flex items-center justify-between">
                    <Label className="text-xs">Valores fijos (COP)</Label>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 text-xs"
                      onClick={() => {
                        const nombre = prompt("Nombre de la variable:")
                        if (nombre) {
                          actualizarRegla(regla.id, {
                            variables: { ...regla.variables, [nombre]: 0 },
                          })
                        }
                      }}
                    >
                      <Plus className="mr-1 h-3 w-3" />
                      Variable
                    </Button>
                  </div>
                  {Object.entries(regla.variables).map(([key, val]) => (
                    <div key={key} className="mb-1.5 flex items-center gap-2">
                      <Badge variant="outline" className="shrink-0 font-mono text-xs">
                        {key}
                      </Badge>
                      <Input
                        type="number"
                        value={val}
                        onChange={(e) =>
                          actualizarRegla(regla.id, {
                            variables: { ...regla.variables, [key]: Number(e.target.value) },
                          })
                        }
                        className="h-7 w-32 text-xs"
                      />
                      <span className="text-xs text-muted-foreground">COP</span>
                      <Button
                        variant="ghost"
                        size="icon-xs"
                        onClick={() => {
                          const { [key]: _, ...rest } = regla.variables
                          actualizarRegla(regla.id, { variables: rest })
                        }}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
