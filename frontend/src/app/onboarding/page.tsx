"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import {
  Palette, Sparkles, Share2, ArrowRight, ArrowLeft, Check,
  Loader2, Globe, Camera, Hammer, Upload
} from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Progress } from "@/components/ui/progress"
import { Toaster } from "@/components/ui/sonner"

import { useAuthStore } from "@/stores/auth-store"
import { apiFetch } from "@/lib/api"

const PASOS = [
  { titulo: "Personaliza tu marca", icono: Palette, desc: "Logo y colores" },
  { titulo: "Crea tu cotizador", icono: Sparkles, desc: "Elige una plantilla o usa IA" },
  { titulo: "Comparte tu link", icono: Share2, desc: "Listo para recibir clientes" },
]

const QUICK_TEMPLATES = [
  { id: "desarrollo-web", nombre: "Desarrollo Web", icono: "Globe" },
  { id: "fotografia", nombre: "Fotografia", icono: "Camera" },
  { id: "remodelacion", nombre: "Construccion", icono: "Hammer" },
]

export default function OnboardingPage() {
  const router = useRouter()
  const token = useAuthStore((s) => s.token)
  const [paso, setPaso] = useState(0)
  const [loading, setLoading] = useState(false)

  // Step 1 state
  const [colorPrimario, setColorPrimario] = useState("#800080")
  const [telefono, setTelefono] = useState("")
  const [sitioWeb, setSitioWeb] = useState("")

  // Step 2 state
  const [cotizadorCreado, setCotizadorCreado] = useState(false)
  const [descripcionIA, setDescripcionIA] = useState("")
  const [generandoIA, setGenerandoIA] = useState(false)

  // Step 3 state
  const [negocioSlug, setNegocioSlug] = useState("")
  const [cotizadorSlug, setCotizadorSlug] = useState("")

  useEffect(() => {
    if (!token) {
      router.replace("/login")
      return
    }
    apiFetch<{ negocio: { slug: string } }>("/auth/me/", { token })
      .then((data) => setNegocioSlug(data.negocio?.slug || ""))
      .catch(() => {})
  }, [token, router])

  const progress = ((paso + 1) / PASOS.length) * 100

  async function guardarPerfil() {
    setLoading(true)
    try {
      await apiFetch("/auth/me/negocio/", {
        method: "PUT",
        token,
        body: JSON.stringify({
          color_primario: colorPrimario,
          telefono,
          sitio_web: sitioWeb,
        }),
      })
      toast.success("Perfil actualizado")
      setPaso(1)
    } catch {
      toast.error("Error al guardar")
    } finally {
      setLoading(false)
    }
  }

  async function crearConIA() {
    if (!descripcionIA.trim()) {
      toast.error("Describe tu negocio primero")
      return
    }
    setGenerandoIA(true)
    try {
      const res = await apiFetch<{ id: string; slug: string }>("/ia/generar-cotizador/", {
        method: "POST",
        token,
        body: JSON.stringify({ descripcion: descripcionIA }),
      })
      setCotizadorSlug(res.slug)
      setCotizadorCreado(true)
      toast.success("Cotizador creado con IA")
      setPaso(2)
    } catch (err: any) {
      toast.error(err.message || "Error al generar")
    } finally {
      setGenerandoIA(false)
    }
  }

  async function usarTemplate(templateId: string) {
    setLoading(true)
    try {
      // Import template data dynamically
      const { TEMPLATES } = await import("@/lib/templates-gallery")
      const template = TEMPLATES.find((t) => t.id === templateId)
      if (!template) throw new Error("Template no encontrado")

      const slug = template.id + "-" + Date.now().toString(36)
      const res = await apiFetch<{ id: string; slug: string }>("/cotizadores/", {
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

      for (const regla of template.reglas_precio) {
        await apiFetch(`/cotizadores/${res.id}/reglas/`, {
          method: "POST",
          token,
          body: JSON.stringify(regla),
        })
      }

      setCotizadorSlug(res.slug || slug)
      setCotizadorCreado(true)
      toast.success(`Cotizador "${template.nombre}" creado`)
      setPaso(2)
    } catch (err: any) {
      toast.error(err.message || "Error al crear")
    } finally {
      setLoading(false)
    }
  }

  const publicUrl = negocioSlug && cotizadorSlug
    ? `${typeof window !== "undefined" ? window.location.origin : ""}/q/${negocioSlug}--${cotizadorSlug}`
    : ""

  return (
    <div className="min-h-screen bg-gradient-to-br from-[oklch(0.25_0.12_300)] via-[oklch(0.18_0.10_290)] to-[oklch(0.12_0.08_310)]">
      <div className="mx-auto max-w-lg px-4 py-12">
        {/* Header */}
        <div className="mb-8 text-center">
          <span className="bg-gradient-to-r from-white to-purple-200 bg-clip-text text-3xl font-bold tracking-tight text-transparent">
            Tikno
          </span>
          <p className="mt-2 text-sm text-white/60">Configura tu cotizador en 3 pasos</p>
        </div>

        {/* Progress */}
        <div className="mb-6">
          <div className="mb-3 flex justify-between">
            {PASOS.map((p, i) => (
              <div key={i} className={`flex items-center gap-2 text-xs ${i <= paso ? "text-white" : "text-white/30"}`}>
                <div className={`flex h-6 w-6 items-center justify-center rounded-full text-[10px] font-bold ${
                  i < paso ? "bg-green-500 text-white" : i === paso ? "bg-primary text-white" : "bg-white/10 text-white/40"
                }`}>
                  {i < paso ? <Check className="h-3 w-3" /> : i + 1}
                </div>
                <span className="hidden sm:inline">{p.desc}</span>
              </div>
            ))}
          </div>
          <Progress value={progress} className="h-1.5" />
        </div>

        {/* Step content */}
        <Card className="border-white/10 bg-white/10 backdrop-blur-xl shadow-2xl shadow-black/20">
          <CardContent className="pt-6 pb-6">
            {/* STEP 1: Profile */}
            {paso === 0 && (
              <div className="space-y-5">
                <div className="text-center">
                  <Palette className="mx-auto h-8 w-8 text-primary mb-2" />
                  <h2 className="text-lg font-semibold text-white">Personaliza tu marca</h2>
                  <p className="text-sm text-white/50 mt-1">Estos datos apareceran en tus cotizaciones y PDFs</p>
                </div>
                <div className="space-y-2">
                  <Label className="text-white/80">Color primario</Label>
                  <div className="flex items-center gap-3">
                    <input type="color" value={colorPrimario} onChange={(e) => setColorPrimario(e.target.value)} className="h-9 w-12 cursor-pointer rounded border bg-transparent" />
                    <Input value={colorPrimario} onChange={(e) => setColorPrimario(e.target.value)} className="w-28 font-mono text-sm border-white/15 bg-white/10 text-white" maxLength={7} />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-white/80">Telefono (opcional)</Label>
                  <Input value={telefono} onChange={(e) => setTelefono(e.target.value)} placeholder="+57 300 000 0000" className="border-white/15 bg-white/10 text-white placeholder:text-white/40" />
                </div>
                <div className="space-y-2">
                  <Label className="text-white/80">Sitio web (opcional)</Label>
                  <Input value={sitioWeb} onChange={(e) => setSitioWeb(e.target.value)} placeholder="https://miempresa.com" className="border-white/15 bg-white/10 text-white placeholder:text-white/40" />
                </div>
                <Button onClick={guardarPerfil} disabled={loading} className="w-full cursor-pointer gap-2 bg-gradient-to-r from-primary to-[oklch(0.55_0.16_310)] text-white">
                  {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <ArrowRight className="h-4 w-4" />}
                  Continuar
                </Button>
                <Button variant="ghost" className="w-full text-white/40 hover:text-white/60 cursor-pointer" onClick={() => setPaso(1)}>
                  Omitir por ahora
                </Button>
              </div>
            )}

            {/* STEP 2: Create cotizador */}
            {paso === 1 && (
              <div className="space-y-5">
                <div className="text-center">
                  <Sparkles className="mx-auto h-8 w-8 text-primary mb-2" />
                  <h2 className="text-lg font-semibold text-white">Crea tu primer cotizador</h2>
                  <p className="text-sm text-white/50 mt-1">Elige una plantilla o describe tu negocio</p>
                </div>

                {/* Quick templates */}
                <div>
                  <p className="text-xs font-semibold text-white/60 uppercase tracking-wider mb-2">Plantillas populares</p>
                  <div className="grid grid-cols-3 gap-2">
                    {QUICK_TEMPLATES.map((t) => (
                      <Button
                        key={t.id}
                        variant="outline"
                        className="h-auto flex-col gap-1.5 py-3 cursor-pointer border-white/15 bg-white/5 text-white hover:bg-white/10 hover:border-white/30"
                        onClick={() => usarTemplate(t.id)}
                        disabled={loading}
                      >
                        {t.icono === "Globe" && <Globe className="h-5 w-5 text-primary" />}
                        {t.icono === "Camera" && <Camera className="h-5 w-5 text-primary" />}
                        {t.icono === "Hammer" && <Hammer className="h-5 w-5 text-primary" />}
                        <span className="text-[10px]">{t.nombre}</span>
                      </Button>
                    ))}
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="h-px flex-1 bg-white/10" />
                  <span className="text-xs text-white/30">o</span>
                  <div className="h-px flex-1 bg-white/10" />
                </div>

                {/* AI generation */}
                <div className="space-y-2">
                  <Label className="text-white/80">Describe tu negocio y la IA creara el cotizador</Label>
                  <textarea
                    value={descripcionIA}
                    onChange={(e) => setDescripcionIA(e.target.value)}
                    placeholder="Ej: Soy fotografo profesional, hago sesiones de retrato, eventos y producto..."
                    className="w-full h-20 rounded-md border border-white/15 bg-white/10 text-white text-sm px-3 py-2 placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none"
                  />
                  <Button onClick={crearConIA} disabled={generandoIA} className="w-full cursor-pointer gap-2 bg-gradient-to-r from-primary to-[oklch(0.55_0.16_310)] text-white">
                    {generandoIA ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
                    {generandoIA ? "Generando con IA..." : "Generar con IA"}
                  </Button>
                </div>

                <Button variant="ghost" className="w-full text-white/40 hover:text-white/60 cursor-pointer" onClick={() => { setPaso(0) }}>
                  <ArrowLeft className="h-4 w-4 mr-2" /> Volver
                </Button>
              </div>
            )}

            {/* STEP 3: Share */}
            {paso === 2 && (
              <div className="space-y-5">
                <div className="text-center">
                  <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-green-500/20">
                    <Check className="h-7 w-7 text-green-400" />
                  </div>
                  <h2 className="text-lg font-semibold text-white">Todo listo!</h2>
                  <p className="text-sm text-white/50 mt-1">Tu cotizador esta listo para recibir clientes</p>
                </div>

                {publicUrl && (
                  <div className="space-y-2">
                    <Label className="text-white/80">Tu link publico</Label>
                    <div className="flex items-center gap-2">
                      <code className="flex-1 truncate rounded-lg bg-white/10 px-3 py-2 font-mono text-xs text-white/70">
                        {publicUrl}
                      </code>
                      <Button
                        variant="outline"
                        size="sm"
                        className="cursor-pointer border-white/20 text-white hover:bg-white/10"
                        onClick={() => {
                          navigator.clipboard.writeText(publicUrl)
                          toast.success("Link copiado")
                        }}
                      >
                        Copiar
                      </Button>
                    </div>
                  </div>
                )}

                <Button
                  onClick={() => router.push("/dashboard")}
                  className="w-full cursor-pointer gap-2 bg-gradient-to-r from-primary to-[oklch(0.55_0.16_310)] text-white"
                >
                  Ir al Dashboard
                  <ArrowRight className="h-4 w-4" />
                </Button>

                <Button variant="ghost" className="w-full text-white/40 hover:text-white/60 cursor-pointer" asChild>
                  <a href="/cotizadores">Ver mis cotizadores</a>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
      <Toaster />
    </div>
  )
}
