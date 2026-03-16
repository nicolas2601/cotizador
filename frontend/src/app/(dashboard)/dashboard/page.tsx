"use client"

import { useMemo } from "react"
import {
  TrendingUp,
  DollarSign,
  Users,
  BarChart3,
  ArrowRight,
  FileText,
  Plus,
  CheckCircle2,
  Clock,
  Send,
  XCircle,
} from "lucide-react"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"

import { useCotizaciones } from "@/hooks/use-cotizaciones"
import { ESTADO_LABELS, ESTADO_COLORS } from "@/types/cotizacion"
import { formatCOP } from "@/lib/format"

export default function DashboardPage() {
  const { data: cotizaciones, isLoading } = useCotizaciones()

  const stats = useMemo(() => {
    if (!cotizaciones || cotizaciones.length === 0) {
      return {
        total: 0,
        esteMes: 0,
        tasaConversion: 0,
        ingresosPotenciales: 0,
        porEstado: {} as Record<string, number>,
        ultimosDias: [] as { dia: string; cantidad: number }[],
        recientes: [] as typeof cotizaciones,
        funnel: { recibidas: 0, enviadas: 0, aceptadas: 0 },
      }
    }

    const ahora = new Date()
    const inicioMes = new Date(ahora.getFullYear(), ahora.getMonth(), 1)

    const esteMes = cotizaciones.filter(
      (c) => new Date(c.created_at) >= inicioMes
    ).length

    const porEstado: Record<string, number> = {}
    cotizaciones.forEach((c) => {
      porEstado[c.estado] = (porEstado[c.estado] || 0) + 1
    })

    const enviadas = (porEstado["enviada"] || 0) + (porEstado["aceptada"] || 0) + (porEstado["rechazada"] || 0)
    const aceptadas = porEstado["aceptada"] || 0
    const tasaConversion = enviadas > 0 ? Math.round((aceptadas / enviadas) * 100) : 0

    const ingresosPotenciales = cotizaciones
      .filter((c) => c.estado === "aceptada")
      .reduce((sum, c) => sum + Number(c.total), 0)

    // Ultimos 7 dias
    const ultimosDias: { dia: string; cantidad: number }[] = []
    for (let i = 6; i >= 0; i--) {
      const fecha = new Date()
      fecha.setDate(fecha.getDate() - i)
      const diaStr = fecha.toLocaleDateString("es-CO", { weekday: "short" })
      const inicio = new Date(fecha.getFullYear(), fecha.getMonth(), fecha.getDate())
      const fin = new Date(inicio)
      fin.setDate(fin.getDate() + 1)
      const cantidad = cotizaciones.filter((c) => {
        const d = new Date(c.created_at)
        return d >= inicio && d < fin
      }).length
      ultimosDias.push({ dia: diaStr, cantidad })
    }

    const recientes = [...cotizaciones]
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      .slice(0, 5)

    const funnel = {
      recibidas: cotizaciones.length,
      enviadas: cotizaciones.filter((c) =>
        ["enviada", "aceptada", "rechazada"].includes(c.estado)
      ).length,
      aceptadas,
    }

    return {
      total: cotizaciones.length,
      esteMes,
      tasaConversion,
      ingresosPotenciales,
      porEstado,
      ultimosDias,
      recientes,
      funnel,
    }
  }, [cotizaciones])

  const maxDia = Math.max(...(stats.ultimosDias.map((d) => d.cantidad)), 1)

  if (isLoading) {
    return (
      <div className="space-y-6 animate-fade-in-up">
        <Skeleton className="h-8 w-48" />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-28 rounded-xl" />
          ))}
        </div>
        <div className="grid gap-4 lg:grid-cols-2">
          <Skeleton className="h-64 rounded-xl" />
          <Skeleton className="h-64 rounded-xl" />
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 animate-fade-in-up">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Resumen de tu actividad comercial
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" asChild className="cursor-pointer gap-1.5 transition-colors hover:border-primary/40 hover:text-primary">
            <a href="/historial">
              <FileText className="h-3.5 w-3.5" />
              Historial
            </a>
          </Button>
          <Button size="sm" asChild className="cursor-pointer gap-1.5 bg-gradient-to-r from-primary to-[oklch(0.55_0.16_310)] text-white shadow-md shadow-primary/20 transition-all duration-200 hover:shadow-lg hover:brightness-110">
            <a href="/cotizadores/nuevo">
              <Plus className="h-3.5 w-3.5" />
              Nuevo cotizador
            </a>
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="overflow-hidden border-t-2 border-t-primary/60 transition-shadow duration-300 hover:shadow-md">
          <CardContent className="pt-5 pb-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Total cotizaciones</p>
                <p className="mt-1 text-3xl font-bold tracking-tight">{stats.total}</p>
              </div>
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                <FileText className="h-5 w-5 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="overflow-hidden border-t-2 border-t-blue-400/60 transition-shadow duration-300 hover:shadow-md">
          <CardContent className="pt-5 pb-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Este mes</p>
                <p className="mt-1 text-3xl font-bold tracking-tight">{stats.esteMes}</p>
              </div>
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100">
                <Users className="h-5 w-5 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="overflow-hidden border-t-2 border-t-emerald-400/60 transition-shadow duration-300 hover:shadow-md">
          <CardContent className="pt-5 pb-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Tasa conversion</p>
                <p className="mt-1 text-3xl font-bold tracking-tight">{stats.tasaConversion}%</p>
              </div>
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-100">
                <TrendingUp className="h-5 w-5 text-emerald-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="overflow-hidden border-t-2 border-t-amber-400/60 transition-shadow duration-300 hover:shadow-md">
          <CardContent className="pt-5 pb-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Ingresos aceptados</p>
                <p className="mt-1 text-2xl font-bold tracking-tight">{formatCOP(stats.ingresosPotenciales)}</p>
              </div>
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-100">
                <DollarSign className="h-5 w-5 text-amber-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts row */}
      <div className="grid gap-4 lg:grid-cols-2">
        {/* Bar chart - ultimos 7 dias */}
        <Card className="transition-shadow duration-300 hover:shadow-md">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-base">
              <BarChart3 className="h-4 w-4 text-primary/60" />
              Ultimos 7 dias
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-end justify-between gap-2 h-40">
              {stats.ultimosDias.map((d, i) => (
                <div key={i} className="flex flex-1 flex-col items-center gap-1">
                  <span className="text-xs font-semibold text-primary">
                    {d.cantidad > 0 ? d.cantidad : ""}
                  </span>
                  <div
                    className="w-full rounded-t-md bg-gradient-to-t from-primary/80 to-primary/40 transition-all duration-500"
                    style={{
                      height: `${d.cantidad > 0 ? (d.cantidad / maxDia) * 100 : 4}%`,
                      minHeight: d.cantidad > 0 ? "8px" : "3px",
                      opacity: d.cantidad > 0 ? 1 : 0.2,
                    }}
                  />
                  <span className="text-[10px] text-muted-foreground capitalize">{d.dia}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Funnel de conversion */}
        <Card className="transition-shadow duration-300 hover:shadow-md">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-base">
              <TrendingUp className="h-4 w-4 text-primary/60" />
              Embudo de conversion
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {[
              { label: "Recibidas", valor: stats.funnel.recibidas, icon: Clock, color: "bg-blue-500" },
              { label: "Enviadas", valor: stats.funnel.enviadas, icon: Send, color: "bg-indigo-500" },
              { label: "Aceptadas", valor: stats.funnel.aceptadas, icon: CheckCircle2, color: "bg-emerald-500" },
            ].map((item) => {
              const pct = stats.funnel.recibidas > 0
                ? Math.round((item.valor / stats.funnel.recibidas) * 100)
                : 0
              return (
                <div key={item.label} className="space-y-1.5">
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <item.icon className="h-3.5 w-3.5 text-muted-foreground" />
                      <span className="font-medium">{item.label}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold">{item.valor}</span>
                      <span className="text-xs text-muted-foreground">({pct}%)</span>
                    </div>
                  </div>
                  <div className="h-3 w-full rounded-full bg-muted/60 overflow-hidden">
                    <div
                      className={`h-full rounded-full ${item.color} transition-all duration-700`}
                      style={{ width: `${Math.max(pct, 2)}%` }}
                    />
                  </div>
                </div>
              )
            })}

            {stats.funnel.recibidas === 0 && (
              <p className="text-center text-sm text-muted-foreground py-4">
                Aun no hay datos suficientes
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Actividad reciente */}
      <Card className="transition-shadow duration-300 hover:shadow-md">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-base">
              <Clock className="h-4 w-4 text-primary/60" />
              Actividad reciente
            </CardTitle>
            <Button variant="ghost" size="sm" asChild className="cursor-pointer gap-1 text-xs text-muted-foreground hover:text-primary">
              <a href="/historial">
                Ver todo <ArrowRight className="h-3 w-3" />
              </a>
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {!stats.recientes || stats.recientes.length === 0 ? (
            <div className="flex flex-col items-center py-8 text-center">
              <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-primary/8">
                <FileText className="h-5 w-5 text-primary/50" />
              </div>
              <p className="text-sm text-muted-foreground">
                Las cotizaciones de tus prospectos apareceran aqui
              </p>
              <Button variant="outline" size="sm" asChild className="mt-4 cursor-pointer gap-1.5">
                <a href="/cotizadores">
                  <Plus className="h-3.5 w-3.5" />
                  Crear tu primer cotizador
                </a>
              </Button>
            </div>
          ) : (
            <div className="space-y-2">
              {(stats.recientes || []).map((cot) => (
                <div
                  key={cot.id}
                  className="flex items-center justify-between rounded-lg border border-border/50 p-3 transition-colors hover:bg-muted/30"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/8 text-xs font-semibold text-primary">
                      {cot.prospecto_nombre.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="text-sm font-medium">{cot.prospecto_nombre}</p>
                      <p className="text-xs text-muted-foreground">{cot.cotizador_nombre}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-semibold text-primary">
                      {formatCOP(Number(cot.total))}
                    </span>
                    <Badge
                      variant="secondary"
                      className={`text-[10px] ${ESTADO_COLORS[cot.estado] || ""}`}
                    >
                      {ESTADO_LABELS[cot.estado] || cot.estado}
                    </Badge>
                    <span className="hidden text-[10px] text-muted-foreground sm:inline">
                      {new Date(cot.created_at).toLocaleDateString("es-CO", {
                        day: "2-digit",
                        month: "short",
                      })}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
