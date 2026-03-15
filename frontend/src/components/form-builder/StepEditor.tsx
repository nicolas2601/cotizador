"use client"

import { Plus } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Separator } from "@/components/ui/separator"

import { useFormBuilderStore } from "@/stores/form-builder-store"
import { FieldEditor } from "./FieldEditor"
import type { CampoTipo, Paso } from "@/types/cotizador"

const TIPOS_CAMPO: { value: CampoTipo; label: string }[] = [
  { value: "texto", label: "Texto" },
  { value: "numero", label: "Numero" },
  { value: "seleccion", label: "Seleccion unica" },
  { value: "multiple", label: "Seleccion multiple" },
  { value: "area_m2", label: "Area (m2)" },
  { value: "slider", label: "Slider" },
]

interface StepEditorProps {
  paso: Paso
}

export function StepEditor({ paso }: StepEditorProps) {
  const { actualizarPaso, agregarCampo } = useFormBuilderStore()

  return (
    <Card>
      <CardHeader className="space-y-3 pb-4">
        <div>
          <Label htmlFor={`paso-titulo-${paso.id}`}>Titulo del paso</Label>
          <Input
            id={`paso-titulo-${paso.id}`}
            placeholder="Ej: Tipo de proyecto"
            value={paso.titulo}
            onChange={(e) => actualizarPaso(paso.id, { titulo: e.target.value })}
          />
        </div>
        <div>
          <Label htmlFor={`paso-desc-${paso.id}`}>Descripcion</Label>
          <Textarea
            id={`paso-desc-${paso.id}`}
            placeholder="Describe brevemente este paso..."
            value={paso.descripcion}
            onChange={(e) => actualizarPaso(paso.id, { descripcion: e.target.value })}
            rows={2}
          />
        </div>
      </CardHeader>

      <Separator />

      <CardContent className="pt-4">
        <div className="mb-3 flex items-center justify-between">
          <p className="text-sm font-medium">
            Campos ({paso.campos.length})
          </p>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <Plus className="mr-1 h-3.5 w-3.5" />
                Campo
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              {TIPOS_CAMPO.map((t) => (
                <DropdownMenuItem
                  key={t.value}
                  onClick={() => agregarCampo(paso.id, t.value)}
                  className="cursor-pointer"
                >
                  {t.label}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {paso.campos.length === 0 ? (
          <div className="rounded-lg border border-dashed py-8 text-center">
            <p className="text-sm text-muted-foreground">
              Agrega campos para este paso
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {paso.campos.map((campo) => (
              <FieldEditor key={campo.id} pasoId={paso.id} campo={campo} />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
