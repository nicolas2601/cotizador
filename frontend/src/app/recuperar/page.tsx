"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, Loader2, Mail, KeyRound, CheckCircle2 } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Toaster } from "@/components/ui/sonner"

import { apiFetch } from "@/lib/api"

type Step = "email" | "code" | "done"

export default function RecuperarPage() {
  const router = useRouter()
  const [step, setStep] = useState<Step>("email")
  const [email, setEmail] = useState("")
  const [code, setCode] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [loading, setLoading] = useState(false)

  async function handleEnviarCodigo(e: React.FormEvent) {
    e.preventDefault()
    if (!email) {
      toast.error("Ingresa tu email")
      return
    }
    setLoading(true)
    try {
      await apiFetch("/auth/forgot-password/", {
        method: "POST",
        body: JSON.stringify({ email }),
      })
      toast.success("Codigo enviado a tu correo")
      setStep("code")
    } catch (err: any) {
      toast.error(err.message || "Error al enviar codigo")
    } finally {
      setLoading(false)
    }
  }

  async function handleResetear(e: React.FormEvent) {
    e.preventDefault()
    if (!code || !newPassword) {
      toast.error("Completa todos los campos")
      return
    }
    if (newPassword.length < 8) {
      toast.error("Minimo 8 caracteres")
      return
    }
    setLoading(true)
    try {
      await apiFetch("/auth/reset-password/", {
        method: "POST",
        body: JSON.stringify({ email, code, new_password: newPassword }),
      })
      toast.success("Contrasena actualizada")
      setStep("done")
    } catch (err: any) {
      toast.error(err.message || "Codigo invalido o expirado")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-[oklch(0.25_0.05_300)] via-[oklch(0.20_0.08_310)] to-[oklch(0.15_0.04_280)] px-4">
      <Card className="w-full max-w-sm border-white/10 bg-white/10 shadow-2xl backdrop-blur-xl">
        <CardHeader className="text-center">
          <CardTitle className="bg-gradient-to-r from-purple-300 to-pink-300 bg-clip-text text-xl text-transparent">
            {step === "email" && "Recuperar contrasena"}
            {step === "code" && "Ingresa el codigo"}
            {step === "done" && "Listo"}
          </CardTitle>
          <CardDescription className="text-white/60">
            {step === "email" && "Te enviaremos un codigo de 6 digitos a tu correo"}
            {step === "code" && `Enviamos un codigo a ${email}`}
            {step === "done" && "Tu contrasena fue actualizada"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {step === "email" && (
            <form onSubmit={handleEnviarCodigo} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-white/80">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/40" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="tu@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="border-white/20 bg-white/10 pl-10 text-white placeholder:text-white/30"
                    autoFocus
                  />
                </div>
              </div>
              <Button type="submit" className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white" disabled={loading}>
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Enviar codigo
              </Button>
            </form>
          )}

          {step === "code" && (
            <form onSubmit={handleResetear} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="code" className="text-white/80">Codigo (6 digitos)</Label>
                <div className="relative">
                  <KeyRound className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/40" />
                  <Input
                    id="code"
                    placeholder="123456"
                    value={code}
                    onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                    className="border-white/20 bg-white/10 pl-10 text-center font-mono text-lg tracking-widest text-white placeholder:text-white/30"
                    maxLength={6}
                    autoFocus
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="new-password" className="text-white/80">Nueva contrasena</Label>
                <Input
                  id="new-password"
                  type="password"
                  placeholder="Minimo 8 caracteres"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="border-white/20 bg-white/10 text-white placeholder:text-white/30"
                />
              </div>
              <Button type="submit" className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white" disabled={loading}>
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Cambiar contrasena
              </Button>
            </form>
          )}

          {step === "done" && (
            <div className="flex flex-col items-center py-4">
              <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-green-500/20">
                <CheckCircle2 className="h-7 w-7 text-green-400" />
              </div>
              <Button onClick={() => router.push("/login")} className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white">
                Ir a iniciar sesion
              </Button>
            </div>
          )}

          {step !== "done" && (
            <p className="mt-4 text-center">
              <a href="/login" className="inline-flex items-center gap-1 text-sm text-white/50 transition-colors hover:text-white/80">
                <ArrowLeft className="h-3 w-3" />
                Volver al login
              </a>
            </p>
          )}
        </CardContent>
      </Card>
      <Toaster />
    </div>
  )
}
