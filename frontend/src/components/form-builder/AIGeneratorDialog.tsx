"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { AlertTriangle, Loader2, Sparkles } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

import { useAuthStore } from "@/stores/auth-store"
import { useFormBuilderStore } from "@/stores/form-builder-store"
import { apiFetch } from "@/lib/api"
import type { Cotizador } from "@/types/cotizador"

interface AIGeneratorDialogProps {
  trigger: React.ReactNode
}

export function AIGeneratorDialog({ trigger }: AIGeneratorDialogProps) {
  const [open, setOpen] = useState(false)
  const [descripcion, setDescripcion] = useState("")
  const [loading, setLoading] = useState(false)
  const token = useAuthStore((s) => s.token)
  const cargarCotizador = useFormBuilderStore((s) => s.cargarCotizador)
  const router = useRouter()

  async function handleGenerar() {
    if (!descripcion.trim()) {
      toast.error("Escribe una descripcion de tu negocio")
      return
    }

    setLoading(true)
    try {
      const data = await apiFetch<Cotizador>("/ia/generar-cotizador/", {
        method: "POST",
        body: JSON.stringify({ descripcion }),
        token,
      })

      cargarCotizador({
        nombre: data.nombre,
        slug: data.slug,
        descripcion: data.descripcion,
        configuracion: data.configuracion,
        reglas_precio: data.reglas_precio ?? [],
      })

      toast.success("Cotizador generado con IA", {
        description: "Revisa los campos, opciones y precios antes de publicar.",
        duration: 6000,
      })
      setOpen(false)
      setDescripcion("")
      router.push("/cotizadores/nuevo")
    } catch (err) {
      const message = err instanceof Error ? err.message : "Error al generar con IA"
      toast.error(message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto mx-4">
        <DialogHeader>
          <DialogTitle>Generar cotizador con IA</DialogTitle>
          <DialogDescription>
            Describe tu negocio y lo que quieres cotizar. La IA creara los pasos, campos y reglas de
            precio por ti.
          </DialogDescription>
        </DialogHeader>

        <Textarea
          placeholder="Ej: Soy veterinario y quiero cotizar consultas y cirugias. Tengo servicios de consulta general, vacunacion, cirugia menor y cirugia mayor..."
          value={descripcion}
          onChange={(e) => setDescripcion(e.target.value)}
          rows={6}
          disabled={loading}
          className="min-h-[120px] max-h-[300px] resize-y overflow-y-auto break-words whitespace-pre-wrap"
        />

        <div className="flex items-start gap-2 rounded-md bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 p-3">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
          <p className="text-xs text-amber-700 dark:text-amber-400 leading-relaxed">
            La IA genera una base que puede no ser perfecta. Revisa los precios, opciones y
            campos antes de publicar. Puedes editar todo manualmente despues.
          </p>
        </div>

        <DialogFooter>
          <Button onClick={handleGenerar} disabled={loading || !descripcion.trim()}>
            {loading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Sparkles className="mr-2 h-4 w-4" />
            )}
            {loading ? "Generando..." : "Generar con IA"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
