"use client"

import { useEffect, useState } from "react"
import { Plus, ExternalLink, Pencil, Copy, Sparkles } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { useAuthStore } from "@/stores/auth-store"
import { apiFetch } from "@/lib/api"
import { AIGeneratorDialog } from "@/components/form-builder/AIGeneratorDialog"
import type { Cotizador } from "@/types/cotizador"

export default function CotizadoresPage() {
  const [cotizadores, setCotizadores] = useState<Cotizador[]>([])
  const [loading, setLoading] = useState(true)
  const token = useAuthStore((s) => s.token)

  useEffect(() => {
    if (!token) {
      setLoading(false)
      return
    }
    apiFetch<Cotizador[]>("/cotizadores/", { token })
      .then((data) => {
        setCotizadores(data)
      })
      .catch((err) => {
        const message = err instanceof Error ? err.message : "Error al cargar cotizadores"
        toast.error(message)
      })
      .finally(() => {
        setLoading(false)
      })
  }, [token])

  function copiarLink(slug: string) {
    const url = `${window.location.origin}/c/${slug}`
    navigator.clipboard.writeText(url)
    toast.success("Link copiado al portapapeles")
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Cotizadores</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Crea y gestiona tus formularios de cotizacion
          </p>
        </div>
        <Button asChild>
          <a href="/cotizadores/nuevo">
            <Plus className="mr-2 h-4 w-4" />
            Nuevo cotizador
          </a>
        </Button>
      </div>

      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-5 w-3/4" />
                <Skeleton className="mt-2 h-4 w-1/2" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : cotizadores.length === 0 ? (
        <Card className="flex flex-col items-center justify-center py-16">
          <div className="text-center">
            <p className="text-lg font-medium">Sin cotizadores</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Crea tu primer cotizador para empezar a recibir propuestas
            </p>
            <div className="mt-6 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
              <Button asChild>
                <a href="/cotizadores/nuevo">
                  <Plus className="mr-2 h-4 w-4" />
                  Crear cotizador
                </a>
              </Button>
              <AIGeneratorDialog
                trigger={
                  <Button variant="outline">
                    <Sparkles className="mr-2 h-4 w-4" />
                    O crea uno con IA
                  </Button>
                }
              />
            </div>
          </div>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {cotizadores.map((cot) => (
            <Card key={cot.id} className="group relative transition-shadow hover:shadow-md">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <CardTitle className="text-base">{cot.nombre}</CardTitle>
                  <Badge variant={cot.activo ? "default" : "secondary"}>
                    {cot.activo ? "Activo" : "Inactivo"}
                  </Badge>
                </div>
                {cot.descripcion && (
                  <p className="text-sm text-muted-foreground line-clamp-2">{cot.descripcion}</p>
                )}
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2">
                  <p className="flex-1 truncate rounded bg-muted px-2 py-1 font-mono text-xs text-muted-foreground">
                    /c/{cot.slug}
                  </p>
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    onClick={() => copiarLink(cot.slug)}
                    title="Copiar link"
                  >
                    <Copy className="h-3.5 w-3.5" />
                  </Button>
                  <Button variant="ghost" size="icon-sm" asChild title="Ver publico">
                    <a href={`/c/${cot.slug}`} target="_blank" rel="noopener">
                      <ExternalLink className="h-3.5 w-3.5" />
                    </a>
                  </Button>
                  <Button variant="outline" size="sm" asChild>
                    <a href={`/cotizadores/${cot.id}`}>
                      <Pencil className="mr-1.5 h-3.5 w-3.5" />
                      Editar
                    </a>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
