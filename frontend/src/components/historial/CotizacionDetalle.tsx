"use client"

import {
  Calendar,
  Building2,
  Mail,
  Phone,
  User,
  FileText,
  Copy,
  ChevronDown,
  Sparkles,
  ClipboardList,
} from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

import type { Cotizacion, EstadoCotizacion } from "@/types/cotizacion"
import { ESTADO_LABELS, ESTADO_COLORS } from "@/types/cotizacion"
import { useCambiarEstado } from "@/hooks/use-cotizaciones"
import { formatCOP } from "@/lib/format"

interface Props {
  cotizacion: Cotizacion | null
  open: boolean
  onClose: () => void
}

export function CotizacionDetalle({ cotizacion, open, onClose }: Props) {
  const cambiarEstado = useCambiarEstado()

  if (!cotizacion) return null

  function handleCambiarEstado(estado: EstadoCotizacion) {
    cambiarEstado.mutate(
      { id: cotizacion!.id, estado },
      {
        onSuccess: () => {
          toast.success(`Estado cambiado a "${ESTADO_LABELS[estado]}"`)
          onClose()
        },
        onError: () => toast.error("Error al cambiar el estado"),
      }
    )
  }

  function copiarLink() {
    navigator.clipboard.writeText(`${window.location.origin}/q/${cotizacion!.cotizador_nombre}`)
    toast.success("Link copiado")
  }

  const fecha = new Date(cotizacion.created_at).toLocaleDateString("es-CO", {
    day: "2-digit",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })

  return (
    <Sheet open={open} onOpenChange={(o) => !o && onClose()}>
      <SheetContent className="w-full overflow-y-auto border-l-primary/10 sm:max-w-lg">
        <SheetHeader className="pb-2">
          <div className="flex items-start justify-between">
            <div>
              <SheetTitle className="text-lg">{cotizacion.prospecto_nombre}</SheetTitle>
              <p className="mt-0.5 text-sm text-muted-foreground">{cotizacion.cotizador_nombre}</p>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={cambiarEstado.isPending}
                  className="cursor-pointer gap-1.5"
                >
                  <span
                    className={`inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-xs font-medium ${
                      ESTADO_COLORS[cotizacion.estado]
                    }`}
                  >
                    <span className="h-1.5 w-1.5 rounded-full bg-current" />
                    {ESTADO_LABELS[cotizacion.estado]}
                  </span>
                  <ChevronDown className="h-3 w-3 text-muted-foreground" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {(Object.keys(ESTADO_LABELS) as EstadoCotizacion[])
                  .filter((e) => e !== cotizacion.estado)
                  .map((estado) => (
                    <DropdownMenuItem
                      key={estado}
                      onClick={() => handleCambiarEstado(estado)}
                      className="cursor-pointer gap-2"
                    >
                      <span
                        className={`inline-block h-2 w-2 rounded-full ${
                          ESTADO_COLORS[estado]?.includes("green")
                            ? "bg-green-500"
                            : ESTADO_COLORS[estado]?.includes("red")
                            ? "bg-red-500"
                            : ESTADO_COLORS[estado]?.includes("blue")
                            ? "bg-blue-500"
                            : ESTADO_COLORS[estado]?.includes("yellow")
                            ? "bg-yellow-500"
                            : "bg-gray-500"
                        }`}
                      />
                      {ESTADO_LABELS[estado]}
                    </DropdownMenuItem>
                  ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </SheetHeader>

        <div className="mt-4 space-y-4">
          {/* Info del prospecto */}
          <Card className="border-primary/10">
            <CardContent className="grid gap-3 pt-4">
              <div className="flex items-center gap-3 text-sm">
                <User className="h-4 w-4 text-primary/60" />
                <span className="text-muted-foreground">Nombre</span>
                <span className="ml-auto font-medium">{cotizacion.prospecto_nombre}</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <Mail className="h-4 w-4 text-primary/60" />
                <span className="text-muted-foreground">Email</span>
                <span className="ml-auto font-medium">{cotizacion.prospecto_email}</span>
              </div>
              {cotizacion.prospecto_telefono && (
                <div className="flex items-center gap-3 text-sm">
                  <Phone className="h-4 w-4 text-primary/60" />
                  <span className="text-muted-foreground">Telefono</span>
                  <span className="ml-auto font-medium">{cotizacion.prospecto_telefono}</span>
                </div>
              )}
              {cotizacion.prospecto_empresa && (
                <div className="flex items-center gap-3 text-sm">
                  <Building2 className="h-4 w-4 text-primary/60" />
                  <span className="text-muted-foreground">Empresa</span>
                  <span className="ml-auto font-medium">{cotizacion.prospecto_empresa}</span>
                </div>
              )}
              <div className="flex items-center gap-3 text-sm">
                <Calendar className="h-4 w-4 text-primary/60" />
                <span className="text-muted-foreground">Fecha</span>
                <span className="ml-auto font-medium">{fecha}</span>
              </div>
            </CardContent>
          </Card>

          {/* Respuestas */}
          {Object.keys(cotizacion.respuestas).length > 0 && (
            <div>
              <div className="mb-2 flex items-center gap-2">
                <ClipboardList className="h-4 w-4 text-primary/60" />
                <p className="text-sm font-medium">Respuestas del prospecto</p>
              </div>
              <div className="space-y-1.5">
                {Object.entries(cotizacion.respuestas).map(([key, val]) => (
                  <div
                    key={key}
                    className="flex items-center justify-between rounded-lg bg-muted/40 px-3 py-2 text-sm"
                  >
                    <span className="text-muted-foreground">{key}</span>
                    <span className="font-medium">{val}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Precio */}
          <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
            <CardContent className="pt-4">
              {cotizacion.desglose_precio.length > 0 && (
                <div className="mb-3 space-y-1.5">
                  {cotizacion.desglose_precio.map((item, i) => (
                    <div key={i} className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">{item.regla}</span>
                      <span className="font-mono text-sm">{formatCOP(Number(item.valor))}</span>
                    </div>
                  ))}
                  <div className="my-2 h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent" />
                </div>
              )}
              <div className="flex items-baseline justify-between">
                <span className="text-sm font-medium">Total</span>
                <span className="bg-gradient-to-r from-primary to-[oklch(0.55_0.16_310)] bg-clip-text text-2xl font-bold tracking-tight text-transparent">
                  {formatCOP(Number(cotizacion.total))}
                </span>
              </div>
              <p className="mt-0.5 text-right text-xs text-muted-foreground">{cotizacion.moneda}</p>
            </CardContent>
          </Card>

          {/* Descripcion IA */}
          {cotizacion.descripcion_ia && (
            <div>
              <div className="mb-2 flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-primary/60" />
                <p className="text-sm font-medium">Descripcion generada por IA</p>
              </div>
              <div className="rounded-lg border border-primary/10 bg-primary/3 px-4 py-3">
                <p className="text-sm leading-relaxed text-muted-foreground">
                  {cotizacion.descripcion_ia}
                </p>
              </div>
            </div>
          )}

          {/* Acciones */}
          <div className="flex flex-wrap gap-2 pt-2">
            {cotizacion.pdf_url && (
              <Button
                variant="outline"
                size="sm"
                className="cursor-pointer gap-1.5 border-primary/20 transition-colors hover:border-primary/40 hover:bg-primary/5 hover:text-primary"
                onClick={() => window.open(cotizacion.pdf_url, "_blank")}
              >
                <FileText className="h-3.5 w-3.5" />
                Ver PDF
              </Button>
            )}
            <Button
              variant="outline"
              size="sm"
              className="cursor-pointer gap-1.5 border-primary/20 transition-colors hover:border-primary/40 hover:bg-primary/5 hover:text-primary"
              onClick={copiarLink}
            >
              <Copy className="h-3.5 w-3.5" />
              Copiar link
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}
