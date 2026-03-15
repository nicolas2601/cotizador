"use client"

import { Copy, ExternalLink, FileText } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
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

  return (
    <Sheet open={open} onOpenChange={(o) => !o && onClose()}>
      <SheetContent className="w-full overflow-y-auto sm:max-w-lg">
        <SheetHeader>
          <SheetTitle>{cotizacion.prospecto_nombre}</SheetTitle>
          <SheetDescription>{cotizacion.prospecto_email}</SheetDescription>
        </SheetHeader>

        <div className="mt-6 space-y-6">
          {/* Estado y acciones */}
          <div className="flex items-center gap-2">
            <span
              className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${
                ESTADO_COLORS[cotizacion.estado]
              }`}
            >
              {ESTADO_LABELS[cotizacion.estado]}
            </span>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" disabled={cambiarEstado.isPending}>
                  Cambiar estado
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                {(Object.keys(ESTADO_LABELS) as EstadoCotizacion[])
                  .filter((e) => e !== cotizacion.estado)
                  .map((estado) => (
                    <DropdownMenuItem
                      key={estado}
                      onClick={() => handleCambiarEstado(estado)}
                      className="cursor-pointer"
                    >
                      {ESTADO_LABELS[estado]}
                    </DropdownMenuItem>
                  ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Info del prospecto */}
          <div>
            <p className="mb-2 text-xs font-medium text-muted-foreground">Prospecto</p>
            <div className="space-y-1 text-sm">
              <p>
                <span className="text-muted-foreground">Nombre:</span> {cotizacion.prospecto_nombre}
              </p>
              <p>
                <span className="text-muted-foreground">Email:</span> {cotizacion.prospecto_email}
              </p>
              {cotizacion.prospecto_telefono && (
                <p>
                  <span className="text-muted-foreground">Telefono:</span>{" "}
                  {cotizacion.prospecto_telefono}
                </p>
              )}
              {cotizacion.prospecto_empresa && (
                <p>
                  <span className="text-muted-foreground">Empresa:</span>{" "}
                  {cotizacion.prospecto_empresa}
                </p>
              )}
              <p>
                <span className="text-muted-foreground">Cotizador:</span>{" "}
                {cotizacion.cotizador_nombre}
              </p>
              <p>
                <span className="text-muted-foreground">Fecha:</span>{" "}
                {new Date(cotizacion.created_at).toLocaleString("es-CO")}
              </p>
            </div>
          </div>

          <Separator />

          {/* Respuestas */}
          {Object.keys(cotizacion.respuestas).length > 0 && (
            <div>
              <p className="mb-2 text-xs font-medium text-muted-foreground">Respuestas</p>
              <div className="space-y-1">
                {Object.entries(cotizacion.respuestas).map(([key, val]) => (
                  <div
                    key={key}
                    className="flex items-center justify-between rounded bg-muted/50 px-3 py-1.5 text-sm"
                  >
                    <span className="text-muted-foreground">{key}</span>
                    <span className="font-medium">{val}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <Separator />

          {/* Precio */}
          <div>
            <p className="mb-2 text-xs font-medium text-muted-foreground">Desglose de precio</p>
            {cotizacion.desglose_precio.length > 0 && (
              <div className="mb-2 space-y-1">
                {cotizacion.desglose_precio.map((item, i) => (
                  <div key={i} className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">{item.regla}</span>
                    <span>{formatCOP(Number(item.valor))}</span>
                  </div>
                ))}
              </div>
            )}
            <div className="flex items-center justify-between rounded-lg bg-primary/5 px-3 py-2">
              <span className="font-medium">Total</span>
              <span className="text-xl font-bold text-primary">
                {formatCOP(Number(cotizacion.total))}
              </span>
            </div>
          </div>

          {/* Descripcion IA */}
          {cotizacion.descripcion_ia && (
            <>
              <Separator />
              <div>
                <p className="mb-2 text-xs font-medium text-muted-foreground">
                  Descripcion generada por IA
                </p>
                <p className="text-sm leading-relaxed text-muted-foreground">
                  {cotizacion.descripcion_ia}
                </p>
              </div>
            </>
          )}

          <Separator />

          {/* Acciones */}
          <div className="flex flex-wrap gap-2">
            {cotizacion.pdf_url && (
              <Button
                variant="outline"
                size="sm"
                className="gap-1.5"
                onClick={() => window.open(cotizacion.pdf_url, "_blank")}
              >
                <FileText className="h-3.5 w-3.5" />
                Ver PDF
              </Button>
            )}
            <Button variant="outline" size="sm" className="gap-1.5" onClick={copiarLink}>
              <Copy className="h-3.5 w-3.5" />
              Copiar link
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}
