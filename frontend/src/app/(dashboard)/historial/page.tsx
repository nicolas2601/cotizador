"use client"

import { useState } from "react"
import { FileText, Filter, Download } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

import { useCotizaciones } from "@/hooks/use-cotizaciones"
import { ESTADO_LABELS, ESTADO_COLORS } from "@/types/cotizacion"
import type { Cotizacion, EstadoCotizacion } from "@/types/cotizacion"
import { formatCOP } from "@/lib/format"
import { CotizacionDetalle } from "@/components/historial/CotizacionDetalle"

export default function HistorialPage() {
  const { data: cotizaciones, isLoading } = useCotizaciones()
  const [selected, setSelected] = useState<Cotizacion | null>(null)
  const [filtroEstado, setFiltroEstado] = useState<string>("todos")
  const [busqueda, setBusqueda] = useState("")

  function exportarCSV() {
    const headers = ["Fecha", "Prospecto", "Email", "Telefono", "Empresa", "Cotizador", "Total", "Moneda", "Estado"]
    const rows = filtradas.map((c) => [
      new Date(c.created_at).toLocaleDateString("es-CO"),
      c.prospecto_nombre,
      c.prospecto_email,
      c.prospecto_telefono,
      c.prospecto_empresa,
      c.cotizador_nombre,
      c.total,
      c.moneda,
      c.estado,
    ])

    const csvContent = [headers, ...rows]
      .map((row) => row.map((cell) => `"${String(cell || "").replace(/"/g, '""')}"`).join(","))
      .join("\n")

    const blob = new Blob(["\uFEFF" + csvContent], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    link.download = `cotizaciones_${new Date().toISOString().split("T")[0]}.csv`
    link.click()
    URL.revokeObjectURL(url)
    toast.success("CSV exportado")
  }

  const filtradas = (cotizaciones || []).filter((c) => {
    if (filtroEstado !== "todos" && c.estado !== filtroEstado) return false
    if (busqueda) {
      const q = busqueda.toLowerCase()
      return (
        c.prospecto_nombre.toLowerCase().includes(q) ||
        c.prospecto_email.toLowerCase().includes(q) ||
        c.cotizador_nombre.toLowerCase().includes(q)
      )
    }
    return true
  })

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Historial</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Cotizaciones recibidas de tus prospectos
        </p>
      </div>

      {/* Filtros */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 sm:max-w-xs">
          <Input
            placeholder="Buscar por nombre, email o cotizador..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            className="h-9 transition-all duration-200 focus-visible:ring-primary/40"
          />
        </div>
        <Select value={filtroEstado} onValueChange={setFiltroEstado}>
          <SelectTrigger className="h-9 w-auto gap-1.5 cursor-pointer transition-colors duration-200 hover:border-primary/40">
            <Filter className="h-3.5 w-3.5 text-muted-foreground" />
            <SelectValue placeholder="Estado" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todos los estados</SelectItem>
            {Object.entries(ESTADO_LABELS).map(([val, label]) => (
              <SelectItem key={val} value={val}>
                {label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button
          variant="outline"
          size="sm"
          onClick={exportarCSV}
          disabled={filtradas.length === 0}
          className="h-9 gap-1.5 cursor-pointer transition-colors duration-200 hover:border-primary/40 hover:text-primary"
        >
          <Download className="h-3.5 w-3.5" />
          Exportar CSV
        </Button>
      </div>

      {/* Tabla */}
      {isLoading ? (
        <div className="space-y-2">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-12 w-full rounded-md animate-shimmer" />
          ))}
        </div>
      ) : filtradas.length === 0 ? (
        <div className="flex flex-col items-center py-16 text-center">
          <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-primary/8">
            <FileText className="h-6 w-6 text-primary/50" />
          </div>
          <p className="font-medium">Sin cotizaciones</p>
          <p className="mt-1 text-sm text-muted-foreground">
            {busqueda || filtroEstado !== "todos"
              ? "No hay resultados con esos filtros"
              : "Las cotizaciones de tus prospectos apareceran aqui"}
          </p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-lg border shadow-sm">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/40">
                <TableHead className="font-semibold">Fecha</TableHead>
                <TableHead className="font-semibold">Prospecto</TableHead>
                <TableHead className="hidden font-semibold sm:table-cell">Cotizador</TableHead>
                <TableHead className="text-right font-semibold">Precio</TableHead>
                <TableHead className="font-semibold">Estado</TableHead>
                <TableHead className="w-10" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtradas.map((cot) => (
                <TableRow
                  key={cot.id}
                  onClick={() => setSelected(cot)}
                  className="cursor-pointer transition-colors duration-150 hover:bg-primary/4"
                >
                  <TableCell className="text-xs text-muted-foreground">
                    {new Date(cot.created_at).toLocaleDateString("es-CO", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                    })}
                  </TableCell>
                  <TableCell>
                    <div>
                      <p className="text-sm font-medium">{cot.prospecto_nombre}</p>
                      <p className="text-xs text-muted-foreground">{cot.prospecto_email}</p>
                    </div>
                  </TableCell>
                  <TableCell className="hidden text-sm text-muted-foreground sm:table-cell">
                    {cot.cotizador_nombre}
                  </TableCell>
                  <TableCell className="text-right text-sm font-semibold text-primary">
                    {formatCOP(Number(cot.total))}
                  </TableCell>
                  <TableCell>
                    <span
                      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium ${
                        ESTADO_COLORS[cot.estado] || ""
                      }`}
                    >
                      {ESTADO_LABELS[cot.estado] || cot.estado}
                    </span>
                  </TableCell>
                  <TableCell>
                    {cot.pdf_url && (
                      <Button
                        variant="ghost"
                        size="icon-xs"
                        onClick={(e) => {
                          e.stopPropagation()
                          window.open(cot.pdf_url, "_blank")
                        }}
                        title="Ver PDF"
                        className="cursor-pointer transition-colors duration-200 hover:text-primary"
                      >
                        <FileText className="h-3.5 w-3.5" />
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      <CotizacionDetalle
        cotizacion={selected}
        open={!!selected}
        onClose={() => setSelected(null)}
      />
    </div>
  )
}
