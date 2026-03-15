"use client"

import { useEffect, useRef, useState } from "react"
import { Loader2 } from "lucide-react"
import { useProspectFormStore } from "@/stores/prospect-form-store"
import type { CotizadorPublico } from "@/types/cotizador"
import { formatCOP } from "@/lib/format"

interface Props {
  cotizador: CotizadorPublico
}

interface PriceResult {
  total: number
  desglose: { regla: string; valor: number }[]
  moneda: string
}

export function PriceDisplay({ cotizador }: Props) {
  const respuestas = useProspectFormStore((s) => s.respuestas)
  const [price, setPrice] = useState<PriceResult | null>(null)
  const [loading, setLoading] = useState(false)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const abortRef = useRef<AbortController | null>(null)

  const hasResponses = Object.values(respuestas).some((v) => v.trim())

  useEffect(() => {
    if (!hasResponses) {
      setPrice(null)
      return
    }

    if (timerRef.current) clearTimeout(timerRef.current)
    if (abortRef.current) abortRef.current.abort()

    timerRef.current = setTimeout(async () => {
      const controller = new AbortController()
      abortRef.current = controller
      setLoading(true)

      try {
        const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api"
        const negocioSlug =
          cotizador.negocio_nombre?.toLowerCase().replace(/\s+/g, "-") || "tikno"

        const res = await fetch(
          `${API_URL}/public/${negocioSlug}/${cotizador.slug}/cotizar/`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ respuestas }),
            signal: controller.signal,
          }
        )

        if (res.ok) {
          const data = await res.json()
          setPrice({
            total: Number(data.total),
            desglose: (data.desglose || []).map((d: any) => ({
              regla: d.regla,
              valor: Number(d.valor),
            })),
            moneda: data.moneda || "COP",
          })
        }
      } catch (err) {
        if (err instanceof DOMException && err.name === "AbortError") return
      } finally {
        setLoading(false)
      }
    }, 500)

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [respuestas, cotizador.slug, hasResponses])

  if (!hasResponses && !price) return null

  return (
    <div className="mt-4 overflow-hidden rounded-lg border bg-card">
      <div className="flex items-center justify-between border-b px-4 py-2.5">
        <span className="text-xs font-medium text-muted-foreground">
          Precio estimado
        </span>
        {loading && <Loader2 className="h-3.5 w-3.5 animate-spin text-muted-foreground" />}
      </div>

      <div className="px-4 py-3">
        {price ? (
          <>
            {price.desglose.length > 1 && (
              <div className="mb-2 space-y-1">
                {price.desglose.map((item, i) => (
                  <div key={i} className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>{item.regla}</span>
                    <span>{formatCOP(item.valor)}</span>
                  </div>
                ))}
                <div className="my-1.5 h-px bg-border" />
              </div>
            )}
            <div className="flex items-baseline justify-between">
              <span className="text-sm font-medium">Total</span>
              <span className="text-2xl font-bold tracking-tight text-primary">
                {formatCOP(price.total)}
              </span>
            </div>
            <p className="mt-0.5 text-right text-xs text-muted-foreground">
              {price.moneda}
            </p>
          </>
        ) : (
          <p className="text-center text-xs text-muted-foreground">
            Completa el formulario para ver el precio
          </p>
        )}
      </div>
    </div>
  )
}
