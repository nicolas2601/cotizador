"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { CheckCircle2, XCircle, FileText, Loader2, Shield, Clock, Building2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Toaster } from "@/components/ui/sonner"
import { toast } from "sonner"

interface PropuestaData {
  id: string
  negocio_nombre: string
  negocio_logo: string
  color_primario: string
  cotizador_nombre: string
  prospecto_nombre: string
  estado: string
  total: string
  moneda: string
  desglose_precio: { regla: string; valor: string }[]
  descripcion_ia: string
  pdf_url: string
  fecha_aceptacion: string | null
  created_at: string
}

export default function PropuestaPage() {
  const params = useParams()
  const token = params.token as string
  const [data, setData] = useState<PropuestaData | null>(null)
  const [loading, setLoading] = useState(true)
  const [acting, setActing] = useState(false)
  const [done, setDone] = useState<"aceptada" | "rechazada" | null>(null)
  const [error, setError] = useState("")

  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api"

  useEffect(() => {
    fetch(`${API_URL}/propuesta/${token}/`)
      .then((r) => {
        if (!r.ok) throw new Error("not found")
        return r.json()
      })
      .then((d) => {
        setData(d)
        if (d.estado === "aceptada" || d.estado === "rechazada") {
          setDone(d.estado as "aceptada" | "rechazada")
        }
      })
      .catch(() => setError("Propuesta no encontrada o enlace invalido."))
      .finally(() => setLoading(false))
  }, [token, API_URL])

  async function handleAccion(accion: "aceptar" | "rechazar") {
    setActing(true)
    try {
      const res = await fetch(`${API_URL}/propuesta/${token}/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ accion }),
      })
      const body = await res.json()
      if (body.estado === "aceptada") {
        setDone("aceptada")
        toast.success("Propuesta aceptada")
      } else if (body.estado === "rechazada") {
        setDone("rechazada")
        toast.info("Propuesta rechazada")
      }
    } catch {
      toast.error("Error al procesar. Intenta de nuevo.")
    } finally {
      setActing(false)
    }
  }

  function formatCOP(value: number) {
    return new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", maximumFractionDigits: 0 }).format(value)
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (error || !data) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 px-4">
        <Card className="w-full max-w-md text-center shadow-lg">
          <CardContent className="pt-10 pb-8">
            <XCircle className="mx-auto mb-4 h-12 w-12 text-red-400" />
            <h1 className="text-xl font-semibold">Propuesta no encontrada</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              El enlace puede haber expirado o ser invalido.
            </p>
          </CardContent>
        </Card>
        <Toaster />
      </div>
    )
  }

  const brandColor = data.color_primario || "#800080"

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 px-4 py-10">
      <div className="mx-auto max-w-lg">
        {/* Header */}
        <div className="mb-6 text-center">
          {data.negocio_logo ? (
            <img src={data.negocio_logo} alt={data.negocio_nombre} className="mx-auto mb-3 h-12 object-contain" />
          ) : (
            <h2 className="mb-3 text-2xl font-bold" style={{ color: brandColor }}>{data.negocio_nombre}</h2>
          )}
          <p className="text-sm text-muted-foreground">Propuesta comercial</p>
        </div>

        {/* Done state */}
        {done && (
          <Card className="mb-6 overflow-hidden shadow-lg">
            <div className="h-1" style={{ backgroundColor: done === "aceptada" ? "#16a34a" : "#dc2626" }} />
            <CardContent className="pt-8 pb-6 text-center">
              {done === "aceptada" ? (
                <>
                  <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
                    <CheckCircle2 className="h-8 w-8 text-green-600" />
                  </div>
                  <h2 className="text-xl font-bold text-green-800">Propuesta aceptada</h2>
                  <p className="mt-2 text-sm text-muted-foreground">
                    Hemos registrado tu aceptacion. {data.negocio_nombre} se pondra en contacto contigo para los siguientes pasos.
                  </p>
                  <div className="mt-4 flex items-center justify-center gap-2 text-xs text-muted-foreground">
                    <Shield className="h-3 w-3" />
                    Registro con validez legal
                  </div>
                </>
              ) : (
                <>
                  <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
                    <XCircle className="h-8 w-8 text-red-500" />
                  </div>
                  <h2 className="text-xl font-bold text-red-800">Propuesta rechazada</h2>
                  <p className="mt-2 text-sm text-muted-foreground">
                    Tu decision ha sido registrada. Si cambias de opinion, contacta a {data.negocio_nombre}.
                  </p>
                </>
              )}
            </CardContent>
          </Card>
        )}

        {/* Proposal details */}
        <Card className="overflow-hidden shadow-lg">
          <div className="h-1" style={{ backgroundColor: brandColor }} />
          <CardContent className="pt-6 space-y-5">
            {/* Prospect greeting */}
            <div>
              <p className="text-sm text-muted-foreground">Preparada para</p>
              <p className="text-lg font-semibold">{data.prospecto_nombre}</p>
            </div>

            {/* Service */}
            <div className="flex items-center gap-3 rounded-lg bg-muted/40 px-4 py-3">
              <Building2 className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-xs text-muted-foreground">Servicio</p>
                <p className="text-sm font-medium">{data.cotizador_nombre}</p>
              </div>
            </div>

            {/* Price breakdown */}
            {data.desglose_precio.length > 0 && (
              <div className="space-y-2">
                {data.desglose_precio.map((item, i) => (
                  <div key={i} className="flex justify-between text-sm">
                    <span className="text-muted-foreground">{item.regla}</span>
                    <span className="font-mono">{formatCOP(Number(item.valor))}</span>
                  </div>
                ))}
                <div className="h-px bg-border" />
              </div>
            )}

            {/* Total */}
            <div className="rounded-xl p-4 text-center" style={{ backgroundColor: brandColor }}>
              <p className="text-xs text-white/70 uppercase tracking-wider font-semibold mb-1">Inversion Total</p>
              <p className="text-3xl font-bold text-white">{formatCOP(Number(data.total))} {data.moneda}</p>
            </div>

            {/* Description */}
            {data.descripcion_ia && (
              <div className="rounded-lg border bg-muted/20 px-4 py-3">
                <p className="text-xs leading-relaxed text-muted-foreground whitespace-pre-line line-clamp-6">
                  {data.descripcion_ia}
                </p>
              </div>
            )}

            {/* PDF link */}
            {data.pdf_url && (
              <Button
                variant="outline"
                className="w-full cursor-pointer gap-2"
                onClick={() => window.open(data.pdf_url, "_blank")}
              >
                <FileText className="h-4 w-4" />
                Ver propuesta completa (PDF)
              </Button>
            )}

            {/* Date */}
            <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
              <Clock className="h-3 w-3" />
              Enviada el {new Date(data.created_at).toLocaleDateString("es-CO", { day: "2-digit", month: "long", year: "numeric" })}
            </div>

            {/* Actions */}
            {!done && (
              <div className="space-y-2 pt-2">
                <Button
                  className="w-full cursor-pointer gap-2 text-white"
                  style={{ backgroundColor: "#16a34a" }}
                  onClick={() => handleAccion("aceptar")}
                  disabled={acting}
                >
                  {acting ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
                  Aceptar Propuesta
                </Button>
                <Button
                  variant="outline"
                  className="w-full cursor-pointer gap-2 text-red-600 border-red-200 hover:bg-red-50"
                  onClick={() => handleAccion("rechazar")}
                  disabled={acting}
                >
                  <XCircle className="h-4 w-4" />
                  Rechazar
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Footer */}
        <p className="mt-6 text-center text-[10px] text-muted-foreground">
          Propuesta generada con <a href="https://tikno.pro" className="font-semibold hover:underline" style={{ color: brandColor }}>Tikno</a>
        </p>
      </div>
      <Toaster />
    </div>
  )
}
