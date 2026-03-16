"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import {
  Globe, Camera, Hammer, PartyPopper, Megaphone, Palette, Briefcase,
  ArrowLeft, Sparkles, Loader2, Search
} from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"

import { useAuthStore } from "@/stores/auth-store"
import { apiFetch } from "@/lib/api"
import { TEMPLATES, CATEGORIAS, type CotizadorTemplate } from "@/lib/templates-gallery"

const ICONOS: Record<string, React.ReactNode> = {
  Globe: <Globe className="h-5 w-5" />,
  Camera: <Camera className="h-5 w-5" />,
  Hammer: <Hammer className="h-5 w-5" />,
  PartyPopper: <PartyPopper className="h-5 w-5" />,
  Megaphone: <Megaphone className="h-5 w-5" />,
  Palette: <Palette className="h-5 w-5" />,
  Briefcase: <Briefcase className="h-5 w-5" />,
}

export default function TemplatesPage() {
  const router = useRouter()
  const token = useAuthStore((s) => s.token)
  const [categoria, setCategoria] = useState("todos")
  const [busqueda, setBusqueda] = useState("")
  const [creando, setCreando] = useState<string | null>(null)

  const filtrados = TEMPLATES.filter((t) => {
    if (categoria !== "todos" && t.categoria !== categoria) return false
    if (busqueda) {
      const q = busqueda.toLowerCase()
      return t.nombre.toLowerCase().includes(q) || t.descripcion.toLowerCase().includes(q)
    }
    return true
  })

  async function usarTemplate(template: CotizadorTemplate) {
    setCreando(template.id)
    try {
      const slug = template.id + "-" + Date.now().toString(36)
      const res = await apiFetch<{ id: string }>("/cotizadores/", {
        method: "POST",
        token,
        body: JSON.stringify({
          nombre: template.nombre,
          slug,
          descripcion: template.descripcion,
          configuracion: template.configuracion,
          activo: true,
          moneda: "COP",
        }),
      })

      // Create pricing rules
      for (const regla of template.reglas_precio) {
        await apiFetch(`/cotizadores/${res.id}/reglas/`, {
          method: "POST",
          token,
          body: JSON.stringify(regla),
        })
      }

      toast.success(`Cotizador "${template.nombre}" creado`)
      router.push(`/cotizadores/${res.id}`)
    } catch (err: any) {
      toast.error(err.message || "Error al crear cotizador")
    } finally {
      setCreando(null)
    }
  }

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon-sm" asChild className="cursor-pointer">
          <a href="/cotizadores"><ArrowLeft className="h-4 w-4" /></a>
        </Button>
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Galeria de plantillas</h1>
          <p className="mt-0.5 text-sm text-muted-foreground">
            Empieza con una plantilla pre-diseñada y personalízala
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 sm:max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
          <Input
            placeholder="Buscar plantilla..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            className="h-9 pl-9"
          />
        </div>
        <div className="flex gap-1.5">
          {CATEGORIAS.map((cat) => (
            <Button
              key={cat.id}
              variant={categoria === cat.id ? "default" : "outline"}
              size="sm"
              onClick={() => setCategoria(cat.id)}
              className="cursor-pointer text-xs h-8"
            >
              {cat.label}
            </Button>
          ))}
        </div>
      </div>

      {/* Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {filtrados.map((template, i) => (
          <Card
            key={template.id}
            className={`group overflow-hidden transition-all duration-300 hover:shadow-lg hover:shadow-primary/10 hover:-translate-y-1 animate-slide-in stagger-${Math.min(i + 1, 6)}`}
          >
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary group-hover:scale-110 transition-transform">
                  {ICONOS[template.icono] || <Sparkles className="h-5 w-5" />}
                </div>
                <Badge variant="secondary" className="text-[10px]">
                  {CATEGORIAS.find((c) => c.id === template.categoria)?.label}
                </Badge>
              </div>
              <CardTitle className="text-base mt-2">{template.nombre}</CardTitle>
              <CardDescription className="text-xs">{template.descripcion}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="mb-3 space-y-1">
                <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">Incluye</p>
                <p className="text-xs text-muted-foreground">
                  {template.configuracion.pasos.length} pasos, {template.configuracion.pasos.reduce((acc, p) => acc + p.campos.length, 0)} campos, {template.reglas_precio.length} regla{template.reglas_precio.length > 1 ? "s" : ""} de precio
                </p>
              </div>
              <Button
                className="w-full cursor-pointer gap-2 bg-gradient-to-r from-primary to-[oklch(0.55_0.16_310)] text-white shadow-md shadow-primary/20 transition-all duration-200 hover:shadow-lg hover:brightness-110"
                onClick={() => usarTemplate(template)}
                disabled={creando === template.id}
              >
                {creando === template.id ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <Sparkles className="h-3.5 w-3.5" />
                )}
                {creando === template.id ? "Creando..." : "Usar plantilla"}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
