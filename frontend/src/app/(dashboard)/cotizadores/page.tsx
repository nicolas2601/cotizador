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
    apiFetch<Cotizador[] | { results: Cotizador[] }>("/cotizadores/", { token })
      .then((data) => {
        setCotizadores(Array.isArray(data) ? data : data.results || [])
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
      <div className="flex items-center justify-between animate-fade-in-up">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Cotizadores</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Crea y gestiona tus formularios de cotizacion
          </p>
        </div>
        <Button asChild className="cursor-pointer bg-gradient-to-r from-primary to-[oklch(0.55_0.16_310)] text-white shadow-md shadow-primary/20 transition-all duration-200 hover:shadow-lg hover:shadow-primary/30 hover:brightness-110">
          <a href="/cotizadores/nuevo">
            <Plus className="mr-2 h-4 w-4" />
            Nuevo cotizador
          </a>
        </Button>
      </div>

      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="overflow-hidden">
              <div className="h-1 animate-shimmer" />
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
        <Card className="animate-fade-in-up flex flex-col items-center justify-center border-dashed border-2 border-primary/20 bg-primary/3 py-16">
          <div className="text-center">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
              <Plus className="h-6 w-6 text-primary" />
            </div>
            <p className="text-lg font-medium">Sin cotizadores</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Crea tu primer cotizador para empezar a recibir propuestas
            </p>
            <div className="mt-6 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
              <Button asChild className="cursor-pointer bg-gradient-to-r from-primary to-[oklch(0.55_0.16_310)] text-white shadow-md shadow-primary/20 transition-all duration-200 hover:shadow-lg hover:shadow-primary/30 hover:brightness-110">
                <a href="/cotizadores/nuevo">
                  <Plus className="mr-2 h-4 w-4" />
                  Crear cotizador
                </a>
              </Button>
              <AIGeneratorDialog
                trigger={
                  <Button variant="outline" className="cursor-pointer gap-2 border-primary/30 text-primary transition-all duration-200 hover:bg-primary/5 hover:border-primary/50 animate-pulse-glow">
                    <Sparkles className="h-4 w-4" />
                    O crea uno con IA
                  </Button>
                }
              />
            </div>
          </div>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {cotizadores.map((cot, index) => (
            <Card
              key={cot.id}
              className={`group relative overflow-hidden transition-all duration-300 hover:shadow-lg hover:shadow-primary/10 hover:-translate-y-1 animate-slide-in stagger-${Math.min(index + 1, 6)} ${
                cot.activo ? "border-t-2 border-t-primary" : ""
              }`}
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <CardTitle className="text-base">{cot.nombre}</CardTitle>
                  <Badge
                    variant={cot.activo ? "default" : "secondary"}
                    className={
                      cot.activo
                        ? "bg-primary/10 text-primary border border-primary/20 gap-1.5"
                        : "gap-1.5"
                    }
                  >
                    <span
                      className={`h-1.5 w-1.5 rounded-full ${
                        cot.activo ? "bg-primary" : "bg-muted-foreground"
                      }`}
                    />
                    {cot.activo ? "Activo" : "Inactivo"}
                  </Badge>
                </div>
                {cot.descripcion && (
                  <p className="text-sm text-muted-foreground line-clamp-2">{cot.descripcion}</p>
                )}
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2">
                  <p className="flex-1 truncate rounded-md bg-muted/60 px-2.5 py-1.5 font-mono text-xs text-muted-foreground">
                    /c/{cot.slug}
                  </p>
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    onClick={() => copiarLink(cot.slug)}
                    title="Copiar link"
                    className="cursor-pointer transition-colors duration-200 hover:text-primary"
                  >
                    <Copy className="h-3.5 w-3.5" />
                  </Button>
                  <Button variant="ghost" size="icon-sm" asChild title="Ver publico" className="cursor-pointer transition-colors duration-200 hover:text-primary">
                    <a href={`/c/${cot.slug}`} target="_blank" rel="noopener">
                      <ExternalLink className="h-3.5 w-3.5" />
                    </a>
                  </Button>
                  <Button variant="outline" size="sm" asChild className="cursor-pointer border-primary/20 transition-all duration-200 hover:bg-primary/5 hover:border-primary/40 hover:text-primary">
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
