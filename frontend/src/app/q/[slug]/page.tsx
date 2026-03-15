import type { Metadata } from "next"
import { notFound } from "next/navigation"

import type { CotizadorPublico } from "@/types/cotizador"
import { ProspectFormWrapper } from "@/components/prospect-form/ProspectFormWrapper"

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api"

async function getCotizador(slug: string): Promise<CotizadorPublico | null> {
  try {
    // The public endpoint uses negocio_slug/cotizador_slug
    // For now we try with slug directly as both
    const parts = slug.split("--")
    const negocioSlug = parts[0]
    const cotizadorSlug = parts[1] || parts[0]

    const res = await fetch(`${API_URL}/public/${negocioSlug}/${cotizadorSlug}/`, {
      next: { revalidate: 60 },
    })
    if (!res.ok) return null
    return res.json()
  } catch {
    return null
  }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const cotizador = await getCotizador(slug)

  if (!cotizador) {
    return { title: "Cotizador no encontrado" }
  }

  return {
    title: `${cotizador.nombre} | Cotizacion`,
    description: cotizador.descripcion || `Obtene tu cotizacion de ${cotizador.negocio_nombre}`,
  }
}

export default async function CotizadorPublicoPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const cotizador = await getCotizador(slug)

  if (!cotizador) {
    notFound()
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-muted/30 to-background">
      <ProspectFormWrapper cotizador={cotizador} slug={slug} />
    </div>
  )
}
