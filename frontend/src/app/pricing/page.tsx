"use client"

import { Check, ArrowRight, Sparkles, Zap, Crown, ArrowLeft } from "lucide-react"
import { motion } from "framer-motion"
import Link from "next/link"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Toaster } from "@/components/ui/sonner"

const PLANES = [
  {
    nombre: "Gratis",
    precio: "$0",
    periodo: "por siempre",
    descripcion: "Perfecto para probar y empezar",
    icono: Zap,
    destacado: false,
    cta: "Empezar gratis",
    href: "/registro",
    features: [
      "Hasta 3 cotizadores",
      "50 cotizaciones por mes",
      "PDF profesional con tu marca",
      "Descripcion generada por IA",
      "Email automatico al prospecto",
      "Widget embebible",
      "Soporte por email",
    ],
    limitaciones: [
      "Marca 'Powered by Tikno' en PDF",
    ],
  },
  {
    nombre: "Pro",
    precio: "$29",
    periodo: "USD / mes",
    descripcion: "Para negocios que cotizan en serio",
    icono: Crown,
    destacado: true,
    cta: "Proximamente",
    href: null,
    features: [
      "Cotizadores ilimitados",
      "Cotizaciones ilimitadas",
      "PDF sin marca de Tikno",
      "Chat IA para editar propuestas",
      "Firma electronica de aceptacion",
      "Notificaciones en tiempo real",
      "Analytics avanzados",
      "Galeria de plantillas premium",
      "Exportar a CSV/Excel",
      "WhatsApp y email integrados",
      "Soporte prioritario",
    ],
    limitaciones: [],
  },
  {
    nombre: "Enterprise",
    precio: "Contactar",
    periodo: "",
    descripcion: "Para equipos y agencias",
    icono: Sparkles,
    destacado: false,
    cta: "Contactar ventas",
    href: null,
    features: [
      "Todo del plan Pro",
      "Multiples usuarios por cuenta",
      "API de integracion",
      "Dominio personalizado",
      "Onboarding dedicado",
      "SLA garantizado",
    ],
    limitaciones: [],
  },
]

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-[#020617] text-slate-200 overflow-x-hidden">
      {/* Background */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute top-[-10%] right-[-5%] w-[800px] h-[800px] bg-indigo-600/10 blur-[160px] rounded-full" />
        <div className="absolute top-[30%] left-[-15%] w-[900px] h-[900px] bg-cyan-600/5 blur-[180px] rounded-full" />
      </div>

      {/* Header */}
      <header className="relative z-10 border-b border-white/5">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4">
          <Link href="/" className="text-2xl font-[900] text-white tracking-[-0.04em]">
            TIKNO<span className="text-indigo-500">.</span>
          </Link>
          <div className="flex items-center gap-4">
            <Link href="/login">
              <Button variant="ghost" className="text-slate-400 hover:text-white cursor-pointer">
                Iniciar sesion
              </Button>
            </Link>
            <Link href="/registro">
              <Button className="cursor-pointer bg-indigo-600 hover:bg-indigo-500 text-white rounded-full px-6">
                Empezar gratis
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="relative z-10 mx-auto max-w-6xl px-4 py-20">
        {/* Title */}
        <div className="text-center mb-16">
          <Badge className="mb-4 bg-indigo-500/10 text-indigo-400 border-indigo-500/20">
            Planes simples y transparentes
          </Badge>
          <h1 className="text-5xl md:text-7xl font-[900] text-white tracking-[-0.04em] mb-6">
            Empieza gratis.<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-cyan-400">
              Escala cuando quieras.
            </span>
          </h1>
          <p className="text-xl text-slate-400 max-w-2xl mx-auto font-light">
            Sin tarjeta de credito. Sin compromisos. Crea tu primer cotizador en menos de 2 minutos.
          </p>
        </div>

        {/* Plans */}
        <div className="grid gap-6 md:grid-cols-3 mb-20">
          {PLANES.map((plan, i) => {
            const Icon = plan.icono
            return (
              <motion.div
                key={plan.nombre}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.15, duration: 0.6 }}
              >
                <Card className={`relative h-full overflow-hidden ${
                  plan.destacado
                    ? "border-indigo-500/40 bg-indigo-500/5 shadow-2xl shadow-indigo-500/10"
                    : "border-white/5 bg-white/5"
                } backdrop-blur-md`}>
                  {plan.destacado && (
                    <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-indigo-500 to-cyan-500" />
                  )}
                  <CardHeader>
                    <div className="flex items-center gap-3 mb-2">
                      <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${
                        plan.destacado ? "bg-indigo-500/20 text-indigo-400" : "bg-white/10 text-white/60"
                      }`}>
                        <Icon className="h-5 w-5" />
                      </div>
                      {plan.destacado && (
                        <Badge className="bg-indigo-500 text-white border-0 text-[10px]">Popular</Badge>
                      )}
                    </div>
                    <CardTitle className="text-xl text-white">{plan.nombre}</CardTitle>
                    <CardDescription className="text-slate-400">{plan.descripcion}</CardDescription>
                    <div className="mt-4">
                      <span className="text-4xl font-[900] text-white">{plan.precio}</span>
                      {plan.periodo && (
                        <span className="text-sm text-slate-500 ml-2">{plan.periodo}</span>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {plan.href ? (
                      <Link href={plan.href}>
                        <Button className={`w-full cursor-pointer gap-2 rounded-full ${
                          plan.destacado
                            ? "bg-indigo-600 hover:bg-indigo-500 text-white"
                            : "bg-white/10 hover:bg-white/15 text-white"
                        }`}>
                          {plan.cta}
                          <ArrowRight className="h-4 w-4" />
                        </Button>
                      </Link>
                    ) : (
                      <Button disabled className="w-full cursor-not-allowed gap-2 rounded-full bg-white/5 text-white/40">
                        {plan.cta}
                      </Button>
                    )}

                    <div className="space-y-2.5 pt-2">
                      {plan.features.map((feature) => (
                        <div key={feature} className="flex items-start gap-2.5 text-sm">
                          <Check className="h-4 w-4 text-indigo-400 mt-0.5 shrink-0" />
                          <span className="text-slate-300">{feature}</span>
                        </div>
                      ))}
                      {plan.limitaciones.map((lim) => (
                        <div key={lim} className="flex items-start gap-2.5 text-sm">
                          <span className="h-4 w-4 text-center text-slate-600 mt-0.5 shrink-0">-</span>
                          <span className="text-slate-500">{lim}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )
          })}
        </div>

        {/* FAQ section */}
        <div className="text-center mb-12">
          <h2 className="text-3xl font-[900] text-white mb-2">Preguntas frecuentes</h2>
        </div>
        <div className="max-w-2xl mx-auto space-y-4 mb-20">
          {[
            { q: "Puedo cambiar de plan despues?", a: "Si. Puedes actualizar o cancelar en cualquier momento sin penalidad." },
            { q: "Que pasa si supero el limite del plan gratuito?", a: "Te notificaremos y podras actualizar al plan Pro para continuar sin interrupciones." },
            { q: "Necesito tarjeta de credito para empezar?", a: "No. El plan gratuito no requiere tarjeta de credito ni datos de pago." },
            { q: "Puedo cancelar en cualquier momento?", a: "Absolutamente. Sin contratos, sin letra pequena. Cancela cuando quieras." },
          ].map((faq, i) => (
            <div key={i} className="rounded-2xl border border-white/5 bg-white/5 p-6">
              <p className="font-bold text-white mb-2">{faq.q}</p>
              <p className="text-sm text-slate-400">{faq.a}</p>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="text-center">
          <Link href="/registro">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.98 }}
              className="px-12 py-5 bg-indigo-600 text-white font-[900] rounded-full shadow-2xl transition-all duration-500 flex items-center gap-3 mx-auto text-lg"
            >
              EMPEZAR GRATIS
              <ArrowRight className="w-5 h-5" />
            </motion.button>
          </Link>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 py-12 border-t border-white/5 text-center">
        <p className="text-slate-600 text-xs font-bold tracking-widest uppercase">Tikno - Bucaramanga, Col - 2026</p>
      </footer>
      <Toaster />
    </div>
  )
}
