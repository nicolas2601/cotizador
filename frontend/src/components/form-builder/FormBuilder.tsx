"use client"

import { useRef, useState } from "react"
import { GripVertical, Plus, Save, Trash2 } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"

import { useFormBuilderStore } from "@/stores/form-builder-store"
import { StepEditor } from "./StepEditor"
import { PricingRuleEditor } from "./PricingRuleEditor"

interface FormBuilderProps {
  mode: "crear" | "editar"
  cotizadorId?: string
}

export function FormBuilder({ mode, cotizadorId }: FormBuilderProps) {
  const store = useFormBuilderStore()
  const [saving, setSaving] = useState(false)
  const dragItem = useRef<number | null>(null)
  const dragOverItem = useRef<number | null>(null)

  const pasoActual = store.configuracion.pasos.find((p) => p.id === store.pasoActivo)

  async function handleGuardar() {
    if (!store.nombre.trim()) {
      toast.error("El nombre del cotizador es obligatorio")
      return
    }
    if (!store.slug.trim()) {
      toast.error("El slug es obligatorio")
      return
    }

    setSaving(true)
    try {
      // TODO: connect to API
      // const payload = {
      //   nombre: store.nombre,
      //   slug: store.slug,
      //   descripcion: store.descripcion,
      //   configuracion: store.configuracion,
      // }
      toast.success(mode === "crear" ? "Cotizador creado" : "Cotizador guardado")
    } catch (err) {
      toast.error("Error al guardar")
    } finally {
      setSaving(false)
    }
  }

  function handleDragStart(index: number) {
    dragItem.current = index
  }

  function handleDragEnter(index: number) {
    dragOverItem.current = index
  }

  function handleDragEnd() {
    if (dragItem.current !== null && dragOverItem.current !== null) {
      store.moverPaso(dragItem.current, dragOverItem.current)
    }
    dragItem.current = null
    dragOverItem.current = null
  }

  function handleSlug(nombre: string) {
    const slug = nombre
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "")
    store.setSlug(slug)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold tracking-tight">
          {mode === "crear" ? "Nuevo cotizador" : "Editar cotizador"}
        </h1>
        <Button onClick={handleGuardar} disabled={saving || !store.isDirty}>
          <Save className="mr-2 h-4 w-4" />
          {saving ? "Guardando..." : "Guardar"}
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="sm:col-span-2">
          <Label htmlFor="nombre">Nombre</Label>
          <Input
            id="nombre"
            placeholder="Ej: Cotizador Desarrollo Web"
            value={store.nombre}
            onChange={(e) => {
              store.setNombre(e.target.value)
              if (mode === "crear") handleSlug(e.target.value)
            }}
          />
        </div>
        <div>
          <Label htmlFor="slug">Slug (URL)</Label>
          <Input
            id="slug"
            placeholder="desarrollo-web"
            value={store.slug}
            onChange={(e) => store.setSlug(e.target.value)}
          />
        </div>
      </div>

      <div>
        <Label htmlFor="descripcion">Descripcion</Label>
        <Textarea
          id="descripcion"
          placeholder="Describe brevemente que cotiza este formulario..."
          value={store.descripcion}
          onChange={(e) => store.setDescripcion(e.target.value)}
          rows={2}
        />
      </div>

      <Separator />

      <Tabs defaultValue="pasos">
        <TabsList>
          <TabsTrigger value="pasos">Pasos del formulario</TabsTrigger>
          <TabsTrigger value="precios">Reglas de precio</TabsTrigger>
        </TabsList>

        <TabsContent value="pasos" className="mt-4">
          <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
            {/* Panel izquierdo: lista de pasos */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-muted-foreground">Pasos</p>
                <Button variant="outline" size="sm" onClick={store.agregarPaso}>
                  <Plus className="mr-1 h-3.5 w-3.5" />
                  Paso
                </Button>
              </div>

              {store.configuracion.pasos.length === 0 ? (
                <Card className="flex flex-col items-center justify-center py-10 text-center">
                  <p className="text-sm text-muted-foreground">Sin pasos</p>
                  <Button variant="ghost" size="sm" className="mt-2" onClick={store.agregarPaso}>
                    Agregar primer paso
                  </Button>
                </Card>
              ) : (
                <div className="space-y-1.5">
                  {store.configuracion.pasos.map((paso, index) => (
                    <div
                      key={paso.id}
                      draggable
                      onDragStart={() => handleDragStart(index)}
                      onDragEnter={() => handleDragEnter(index)}
                      onDragEnd={handleDragEnd}
                      onDragOver={(e) => e.preventDefault()}
                      onClick={() => store.seleccionarPaso(paso.id)}
                      className={`group flex cursor-pointer items-center gap-2 rounded-lg border px-3 py-2.5 text-sm transition-colors ${
                        store.pasoActivo === paso.id
                          ? "border-primary bg-primary/5 text-primary"
                          : "border-transparent hover:border-border hover:bg-muted/50"
                      }`}
                    >
                      <GripVertical className="h-4 w-4 shrink-0 cursor-grab text-muted-foreground opacity-0 group-hover:opacity-100" />
                      <div className="flex-1 truncate">
                        <span className="mr-1.5 font-mono text-xs text-muted-foreground">
                          {index + 1}.
                        </span>
                        {paso.titulo || "Sin titulo"}
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {paso.campos.length}
                      </span>
                      <Button
                        variant="ghost"
                        size="icon-xs"
                        className="opacity-0 group-hover:opacity-100"
                        onClick={(e) => {
                          e.stopPropagation()
                          store.eliminarPaso(paso.id)
                        }}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Panel derecho: editor del paso */}
            <div className="min-h-[400px]">
              {pasoActual ? (
                <StepEditor paso={pasoActual} />
              ) : (
                <Card className="flex h-full items-center justify-center">
                  <p className="text-sm text-muted-foreground">
                    Selecciona o crea un paso para editar
                  </p>
                </Card>
              )}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="precios" className="mt-4">
          <PricingRuleEditor />
        </TabsContent>
      </Tabs>
    </div>
  )
}
