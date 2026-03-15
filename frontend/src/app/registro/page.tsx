"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Loader2 } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Toaster } from "@/components/ui/sonner"

import { useAuthStore } from "@/stores/auth-store"
import { apiFetch } from "@/lib/api"

export default function RegistroPage() {
  const router = useRouter()
  const login = useAuthStore((s) => s.login)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [nombreNegocio, setNombreNegocio] = useState("")
  const [slug, setSlug] = useState("")
  const [loading, setLoading] = useState(false)

  function generarSlug(nombre: string) {
    return nombre
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "")
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!email || !password || !nombreNegocio || !slug) {
      toast.error("Todos los campos son obligatorios")
      return
    }
    if (password.length < 8) {
      toast.error("La contrasena debe tener al menos 8 caracteres")
      return
    }

    setLoading(true)
    try {
      const data = await apiFetch<{
        user: any
        access: string
        refresh: string
      }>("/auth/register/", {
        method: "POST",
        body: JSON.stringify({
          email,
          password,
          nombre_negocio: nombreNegocio,
          slug,
        }),
      })

      login(data)
      toast.success("Cuenta creada correctamente")
      router.push("/cotizadores")
    } catch (err: any) {
      toast.error(err.message || "Error al crear la cuenta")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden px-4">
      {/* Gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-[oklch(0.25_0.12_300)] via-[oklch(0.18_0.10_290)] to-[oklch(0.12_0.08_310)]" />

      {/* Animated gradient orbs */}
      <div className="absolute top-1/3 right-1/4 h-80 w-80 rounded-full bg-[oklch(0.40_0.18_300/0.25)] blur-[80px] animate-float-orb" />
      <div className="absolute bottom-1/3 left-1/4 h-96 w-96 rounded-full bg-[oklch(0.50_0.15_320/0.20)] blur-[100px] animate-float-orb" style={{ animationDelay: "-5s" }} />
      <div className="absolute top-1/4 left-1/2 h-48 w-48 rounded-full bg-[oklch(0.45_0.20_280/0.15)] blur-[60px] animate-float-orb" style={{ animationDelay: "-9s" }} />

      {/* Card */}
      <Card className="animate-fade-in-up relative z-10 w-full max-w-sm border-white/10 bg-white/10 backdrop-blur-xl shadow-2xl shadow-black/20">
        <CardHeader className="text-center">
          <div className="mb-2">
            <span className="bg-gradient-to-r from-white to-purple-200 bg-clip-text text-2xl font-bold tracking-tight text-transparent">
              Tikno
            </span>
          </div>
          <CardTitle className="text-lg text-white/90">Crear cuenta</CardTitle>
          <CardDescription className="text-white/60">
            Registra tu negocio en Tikno
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="nombre-negocio" className="text-white/80">Nombre del negocio</Label>
              <Input
                id="nombre-negocio"
                placeholder="Mi Empresa"
                value={nombreNegocio}
                onChange={(e) => {
                  setNombreNegocio(e.target.value)
                  setSlug(generarSlug(e.target.value))
                }}
                autoFocus
                className="border-white/15 bg-white/10 text-white placeholder:text-white/40 focus-visible:ring-purple-400/50"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="slug" className="text-white/80">URL de tu cotizador</Label>
              <div className="flex items-center gap-1.5">
                <span className="text-xs text-white/40">/q/</span>
                <Input
                  id="slug"
                  placeholder="mi-empresa"
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  className="border-white/15 bg-white/10 font-mono text-sm text-white placeholder:text-white/40 focus-visible:ring-purple-400/50"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="reg-email" className="text-white/80">Email</Label>
              <Input
                id="reg-email"
                type="email"
                placeholder="tu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
                className="border-white/15 bg-white/10 text-white placeholder:text-white/40 focus-visible:ring-purple-400/50"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="reg-password" className="text-white/80">Contrasena</Label>
              <Input
                id="reg-password"
                type="password"
                placeholder="Minimo 8 caracteres"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="new-password"
                className="border-white/15 bg-white/10 text-white placeholder:text-white/40 focus-visible:ring-purple-400/50"
              />
            </div>
            <Button
              type="submit"
              className="w-full cursor-pointer bg-gradient-to-r from-primary to-[oklch(0.55_0.16_310)] text-white shadow-lg shadow-primary/25 transition-all duration-200 hover:shadow-xl hover:shadow-primary/30 hover:brightness-110"
              disabled={loading}
            >
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Crear cuenta
            </Button>
          </form>
          <p className="mt-4 text-center text-sm text-white/50">
            Ya tienes cuenta?{" "}
            <a href="/login" className="font-medium text-white/80 transition-colors hover:text-white hover:underline">
              Iniciar sesion
            </a>
          </p>
          <p className="mt-2 text-center text-sm text-white/50">
            <a href="/docs" className="cursor-pointer transition-colors hover:text-white/80 hover:underline">
              Ver documentacion
            </a>
          </p>
        </CardContent>
      </Card>
      <Toaster />
    </div>
  )
}
