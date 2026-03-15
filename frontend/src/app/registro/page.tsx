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
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <Card className="w-full max-w-sm">
        <CardHeader className="text-center">
          <CardTitle className="text-xl">Crear cuenta</CardTitle>
          <CardDescription>Registra tu negocio en Tikno</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="nombre-negocio">Nombre del negocio</Label>
              <Input
                id="nombre-negocio"
                placeholder="Mi Empresa"
                value={nombreNegocio}
                onChange={(e) => {
                  setNombreNegocio(e.target.value)
                  setSlug(generarSlug(e.target.value))
                }}
                autoFocus
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="slug">URL de tu cotizador</Label>
              <div className="flex items-center gap-1.5">
                <span className="text-xs text-muted-foreground">/q/</span>
                <Input
                  id="slug"
                  placeholder="mi-empresa"
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  className="font-mono text-sm"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="reg-email">Email</Label>
              <Input
                id="reg-email"
                type="email"
                placeholder="tu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="reg-password">Contrasena</Label>
              <Input
                id="reg-password"
                type="password"
                placeholder="Minimo 8 caracteres"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="new-password"
              />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Crear cuenta
            </Button>
          </form>
          <p className="mt-4 text-center text-sm text-muted-foreground">
            Ya tienes cuenta?{" "}
            <a href="/login" className="font-medium text-foreground hover:underline">
              Iniciar sesion
            </a>
          </p>
          <p className="mt-2 text-center text-sm text-muted-foreground">
            <a href="/docs" className="cursor-pointer transition-colors hover:text-foreground hover:underline">
              Ver documentacion
            </a>
          </p>
        </CardContent>
      </Card>
      <Toaster />
    </div>
  )
}
