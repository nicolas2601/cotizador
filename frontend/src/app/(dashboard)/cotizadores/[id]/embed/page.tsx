"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { Copy, Check, Code, ExternalLink, ArrowLeft } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { useAuthStore } from "@/stores/auth-store"
import { apiFetch } from "@/lib/api"
import type { Cotizador } from "@/types/cotizador"

export default function EmbedPage() {
  const { id } = useParams()
  const token = useAuthStore((s) => s.token)
  const [cotizador, setCotizador] = useState<Cotizador | null>(null)
  const [negocioSlug, setNegocioSlug] = useState("")
  const [loading, setLoading] = useState(true)
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null)

  useEffect(() => {
    if (!token || !id) return

    Promise.all([
      apiFetch<Cotizador>(`/cotizadores/${id}/`, { token }),
      apiFetch<{ negocio: { slug: string } }>("/auth/me/", { token }),
    ])
      .then(([cot, me]) => {
        setCotizador(cot)
        setNegocioSlug(me.negocio?.slug || "")
      })
      .catch(() => toast.error("Error al cargar datos"))
      .finally(() => setLoading(false))
  }, [token, id])

  function copiar(texto: string, index: number) {
    navigator.clipboard.writeText(texto)
    setCopiedIndex(index)
    toast.success("Codigo copiado al portapapeles")
    setTimeout(() => setCopiedIndex(null), 2000)
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-40 w-full" />
        <Skeleton className="h-40 w-full" />
      </div>
    )
  }

  if (!cotizador) {
    return (
      <div className="flex flex-col items-center py-16 text-center">
        <p className="font-medium">Cotizador no encontrado</p>
        <Button asChild variant="outline" className="mt-4 cursor-pointer">
          <a href="/cotizadores">Volver a cotizadores</a>
        </Button>
      </div>
    )
  }

  const publicUrl = `${typeof window !== "undefined" ? window.location.origin : ""}/q/${negocioSlug}--${cotizador.slug}`

  const iframeCode = `<iframe
  src="${publicUrl}"
  width="100%"
  height="700"
  frameborder="0"
  style="border: none; border-radius: 8px;"
  title="Cotizador - ${cotizador.nombre}"
></iframe>`

  const popupCode = `<!-- Boton de cotizacion - ${cotizador.nombre} -->
<button
  onclick="window.open('${publicUrl}', 'cotizador', 'width=500,height=700,scrollbars=yes,resizable=yes')"
  style="background: #7c3aed; color: white; padding: 12px 24px; border: none; border-radius: 8px; font-size: 16px; cursor: pointer; font-family: sans-serif;"
>
  Solicitar cotizacion
</button>`

  const opciones = [
    {
      titulo: "Enlace directo",
      descripcion: "Comparte este enlace con tus clientes para que accedan al cotizador.",
      codigo: publicUrl,
      icono: ExternalLink,
    },
    {
      titulo: "Iframe embebido",
      descripcion: "Inserta el cotizador directamente en tu sitio web como un formulario integrado.",
      codigo: iframeCode,
      icono: Code,
    },
    {
      titulo: "Boton popup",
      descripcion: "Agrega un boton que abre el cotizador en una ventana emergente.",
      codigo: popupCode,
      icono: Code,
    },
  ]

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon-sm" asChild className="cursor-pointer">
          <a href="/cotizadores">
            <ArrowLeft className="h-4 w-4" />
          </a>
        </Button>
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Widget de integracion</h1>
          <p className="mt-0.5 text-sm text-muted-foreground">
            Integra <span className="font-medium text-foreground">{cotizador.nombre}</span> en tu sitio web
          </p>
        </div>
      </div>

      <div className="grid gap-4">
        {opciones.map((opcion, index) => {
          const Icon = opcion.icono
          return (
            <Card key={index} className="border-primary/10 transition-all duration-200 hover:shadow-md hover:shadow-primary/5">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
                    <Icon className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-base">{opcion.titulo}</CardTitle>
                    <CardDescription className="text-xs">{opcion.descripcion}</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="relative">
                  <pre className="overflow-x-auto rounded-lg bg-muted/60 p-4 text-xs leading-relaxed text-muted-foreground">
                    <code>{opcion.codigo}</code>
                  </pre>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => copiar(opcion.codigo, index)}
                    className="absolute right-2 top-2 cursor-pointer gap-1.5 bg-background/80 backdrop-blur-sm transition-all duration-200 hover:bg-background"
                  >
                    {copiedIndex === index ? (
                      <>
                        <Check className="h-3.5 w-3.5 text-green-600" />
                        Copiado
                      </>
                    ) : (
                      <>
                        <Copy className="h-3.5 w-3.5" />
                        Copiar
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Vista previa */}
      <Card className="border-primary/10">
        <CardHeader>
          <CardTitle className="text-base">Vista previa</CardTitle>
          <CardDescription className="text-xs">Asi se vera el cotizador embebido en tu sitio web</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-hidden rounded-lg border">
            <iframe
              src={publicUrl}
              width="100%"
              height="500"
              className="border-none"
              title={`Vista previa - ${cotizador.nombre}`}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
