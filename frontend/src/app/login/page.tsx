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

export default function LoginPage() {
  const router = useRouter()
  const login = useAuthStore((s) => s.login)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!email || !password) {
      toast.error("Email y contrasena son obligatorios")
      return
    }

    setLoading(true)
    try {
      const data = await apiFetch<{
        user: any
        access: string
        refresh: string
      }>("/auth/login/", {
        method: "POST",
        body: JSON.stringify({ email, password }),
      })

      login(data)
      toast.success("Sesion iniciada")
      router.push("/cotizadores")
    } catch (err: any) {
      toast.error(err.message || "Credenciales invalidas")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden px-4">
      {/* Gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-[oklch(0.25_0.12_300)] via-[oklch(0.18_0.10_290)] to-[oklch(0.12_0.08_310)]" />

      {/* Animated gradient orbs */}
      <div className="absolute top-1/4 left-1/4 h-72 w-72 rounded-full bg-[oklch(0.40_0.18_300/0.25)] blur-[80px] animate-float-orb" />
      <div className="absolute bottom-1/4 right-1/4 h-96 w-96 rounded-full bg-[oklch(0.50_0.15_320/0.20)] blur-[100px] animate-float-orb" style={{ animationDelay: "-4s" }} />
      <div className="absolute top-1/2 right-1/3 h-56 w-56 rounded-full bg-[oklch(0.45_0.20_280/0.15)] blur-[60px] animate-float-orb" style={{ animationDelay: "-8s" }} />

      {/* Card */}
      <Card className="animate-fade-in-up relative z-10 w-full max-w-sm border-white/10 bg-white/10 backdrop-blur-xl shadow-2xl shadow-black/20">
        <CardHeader className="text-center">
          <div className="mb-2">
            <span className="bg-gradient-to-r from-white to-purple-200 bg-clip-text text-2xl font-bold tracking-tight text-transparent">
              Tikno
            </span>
          </div>
          <CardTitle className="text-lg text-white/90">Bienvenido</CardTitle>
          <CardDescription className="text-white/60">
            Inicia sesion en tu cuenta
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-white/80">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="tu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
                autoFocus
                className="border-white/15 bg-white/10 text-white placeholder:text-white/40 focus-visible:ring-purple-400/50"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password" className="text-white/80">Contrasena</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
                className="border-white/15 bg-white/10 text-white placeholder:text-white/40 focus-visible:ring-purple-400/50"
              />
            </div>
            <Button
              type="submit"
              className="w-full cursor-pointer bg-gradient-to-r from-primary to-[oklch(0.55_0.16_310)] text-white shadow-lg shadow-primary/25 transition-all duration-200 hover:shadow-xl hover:shadow-primary/30 hover:brightness-110"
              disabled={loading}
            >
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Iniciar sesion
            </Button>
          </form>
          <p className="mt-4 text-center text-sm text-white/50">
            No tienes cuenta?{" "}
            <a href="/registro" className="font-medium text-white/80 transition-colors hover:text-white hover:underline">
              Registrate
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
