"use client"

import { useState, useRef, useEffect } from "react"
import {
  Calendar,
  Building2,
  Mail,
  Phone,
  User,
  FileText,
  Copy,
  ChevronDown,
  Sparkles,
  ClipboardList,
  MessageCircle,
  Send,
  Loader2,
  RefreshCw,
  Eye,
  Bot,
  MailCheck,
} from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

import type { Cotizacion, EstadoCotizacion } from "@/types/cotizacion"
import { ESTADO_LABELS, ESTADO_COLORS } from "@/types/cotizacion"
import { useCambiarEstado, useChatIA, useReenviar } from "@/hooks/use-cotizaciones"
import { formatCOP } from "@/lib/format"

interface ChatMessage {
  role: "user" | "assistant"
  content: string
  pdfRegenerado?: boolean
}

interface Props {
  cotizacion: Cotizacion | null
  open: boolean
  onClose: () => void
}

export function CotizacionDetalle({ cotizacion, open, onClose }: Props) {
  const cambiarEstado = useCambiarEstado()
  const chatIA = useChatIA()
  const reenviar = useReenviar()

  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([])
  const [chatInput, setChatInput] = useState("")
  const [showPdfPreview, setShowPdfPreview] = useState(false)
  const [cotData, setCotData] = useState<Cotizacion | null>(null)
  const chatEndRef = useRef<HTMLDivElement>(null)

  // Sync cotizacion data
  useEffect(() => {
    if (cotizacion) setCotData(cotizacion)
  }, [cotizacion])

  // Reset chat when changing cotizacion
  useEffect(() => {
    if (open) {
      setChatMessages([])
      setShowPdfPreview(false)
    }
  }, [cotizacion?.id, open])

  // Auto scroll chat
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [chatMessages])

  if (!cotData) return null

  const cot = cotData

  function handleCambiarEstado(estado: EstadoCotizacion) {
    cambiarEstado.mutate(
      { id: cot.id, estado },
      {
        onSuccess: () => {
          toast.success(`Estado cambiado a "${ESTADO_LABELS[estado]}"`)
          onClose()
        },
        onError: () => toast.error("Error al cambiar el estado"),
      }
    )
  }

  function handleEnviarChat() {
    const msg = chatInput.trim()
    if (!msg) return

    setChatMessages((prev) => [...prev, { role: "user", content: msg }])
    setChatInput("")

    chatIA.mutate(
      { id: cot.id, mensaje: msg },
      {
        onSuccess: (data) => {
          setChatMessages((prev) => [
            ...prev,
            {
              role: "assistant",
              content: data.respuesta,
              pdfRegenerado: data.pdf_regenerado,
            },
          ])
          if (data.cotizacion) {
            setCotData(data.cotizacion)
          }
          if (data.pdf_regenerado) {
            toast.success("PDF actualizado con los cambios")
          }
        },
        onError: () => {
          setChatMessages((prev) => [
            ...prev,
            { role: "assistant", content: "Error al comunicarse con la IA. Intenta de nuevo." },
          ])
        },
      }
    )
  }

  function handleReenviarEmail() {
    reenviar.mutate(
      { id: cot.id, canal: "email" },
      {
        onSuccess: () => toast.success("Email reenviado al prospecto"),
        onError: () => toast.error("Error al reenviar el email"),
      }
    )
  }

  function handleWhatsApp() {
    const phone = cot.prospecto_telefono?.replace(/\D/g, "") || ""
    const msg = encodeURIComponent(
      `Hola ${cot.prospecto_nombre}, te enviamos tu propuesta comercial de ${cot.cotizador_nombre} por un valor de ${formatCOP(Number(cot.total))} ${cot.moneda}.${cot.pdf_url ? `\n\nPuedes ver tu propuesta aqui: ${cot.pdf_url}` : ""}\n\nQuedamos atentos a tus comentarios.`
    )
    window.open(`https://wa.me/${phone}?text=${msg}`, "_blank")
  }

  const fecha = new Date(cot.created_at).toLocaleDateString("es-CO", {
    day: "2-digit",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })

  return (
    <Sheet open={open} onOpenChange={(o) => !o && onClose()}>
      <SheetContent className="w-full overflow-y-auto border-l-primary/10 sm:max-w-xl">
        <SheetHeader className="pb-2">
          <div className="flex items-start justify-between">
            <div>
              <SheetTitle className="text-lg">{cot.prospecto_nombre}</SheetTitle>
              <p className="mt-0.5 text-sm text-muted-foreground">{cot.cotizador_nombre}</p>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={cambiarEstado.isPending}
                  className="cursor-pointer gap-1.5"
                >
                  <span
                    className={`inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-xs font-medium ${
                      ESTADO_COLORS[cot.estado]
                    }`}
                  >
                    <span className="h-1.5 w-1.5 rounded-full bg-current" />
                    {ESTADO_LABELS[cot.estado]}
                  </span>
                  <ChevronDown className="h-3 w-3 text-muted-foreground" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {(Object.keys(ESTADO_LABELS) as EstadoCotizacion[])
                  .filter((e) => e !== cot.estado)
                  .map((estado) => (
                    <DropdownMenuItem
                      key={estado}
                      onClick={() => handleCambiarEstado(estado)}
                      className="cursor-pointer gap-2"
                    >
                      <span
                        className={`inline-block h-2 w-2 rounded-full ${
                          ESTADO_COLORS[estado]?.includes("green")
                            ? "bg-green-500"
                            : ESTADO_COLORS[estado]?.includes("red")
                            ? "bg-red-500"
                            : ESTADO_COLORS[estado]?.includes("blue")
                            ? "bg-blue-500"
                            : ESTADO_COLORS[estado]?.includes("yellow")
                            ? "bg-yellow-500"
                            : "bg-gray-500"
                        }`}
                      />
                      {ESTADO_LABELS[estado]}
                    </DropdownMenuItem>
                  ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </SheetHeader>

        <div className="mt-4 space-y-4">
          {/* PDF Preview */}
          {cot.pdf_url && showPdfPreview && (
            <div className="rounded-lg border overflow-hidden">
              <iframe
                src={cot.pdf_url}
                className="w-full h-[400px] border-none"
                title="Vista previa del PDF"
              />
            </div>
          )}

          {/* Quick actions bar */}
          <div className="flex flex-wrap gap-2">
            {cot.pdf_url && (
              <Button
                variant={showPdfPreview ? "default" : "outline"}
                size="sm"
                className="cursor-pointer gap-1.5 text-xs"
                onClick={() => setShowPdfPreview(!showPdfPreview)}
              >
                <Eye className="h-3 w-3" />
                {showPdfPreview ? "Ocultar PDF" : "Ver PDF"}
              </Button>
            )}
            <Button
              variant="outline"
              size="sm"
              className="cursor-pointer gap-1.5 text-xs border-blue-200 text-blue-700 hover:border-blue-400 hover:bg-blue-50"
              onClick={handleReenviarEmail}
              disabled={reenviar.isPending}
            >
              {reenviar.isPending ? (
                <Loader2 className="h-3 w-3 animate-spin" />
              ) : (
                <MailCheck className="h-3 w-3" />
              )}
              Reenviar email
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="cursor-pointer gap-1.5 text-xs border-green-200 text-green-700 hover:border-green-400 hover:bg-green-50"
              onClick={handleWhatsApp}
            >
              <MessageCircle className="h-3 w-3" />
              WhatsApp
            </Button>
            {cot.pdf_url && (
              <Button
                variant="ghost"
                size="sm"
                className="cursor-pointer gap-1.5 text-xs"
                onClick={() => window.open(cot.pdf_url, "_blank")}
              >
                <FileText className="h-3 w-3" />
                Abrir PDF
              </Button>
            )}
          </div>

          {/* Info del prospecto */}
          <Card className="border-primary/10">
            <CardContent className="grid gap-2.5 pt-4">
              <div className="flex items-center gap-3 text-sm">
                <User className="h-3.5 w-3.5 text-primary/60" />
                <span className="text-muted-foreground">Nombre</span>
                <span className="ml-auto font-medium">{cot.prospecto_nombre}</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <Mail className="h-3.5 w-3.5 text-primary/60" />
                <span className="text-muted-foreground">Email</span>
                <span className="ml-auto font-medium text-xs">{cot.prospecto_email}</span>
              </div>
              {cot.prospecto_telefono && (
                <div className="flex items-center gap-3 text-sm">
                  <Phone className="h-3.5 w-3.5 text-primary/60" />
                  <span className="text-muted-foreground">Telefono</span>
                  <span className="ml-auto font-medium">{cot.prospecto_telefono}</span>
                </div>
              )}
              {cot.prospecto_empresa && (
                <div className="flex items-center gap-3 text-sm">
                  <Building2 className="h-3.5 w-3.5 text-primary/60" />
                  <span className="text-muted-foreground">Empresa</span>
                  <span className="ml-auto font-medium">{cot.prospecto_empresa}</span>
                </div>
              )}
              <div className="flex items-center gap-3 text-sm">
                <Calendar className="h-3.5 w-3.5 text-primary/60" />
                <span className="text-muted-foreground">Fecha</span>
                <span className="ml-auto font-medium text-xs">{fecha}</span>
              </div>
            </CardContent>
          </Card>

          {/* Respuestas */}
          {Object.keys(cot.respuestas).length > 0 && (
            <div>
              <div className="mb-2 flex items-center gap-2">
                <ClipboardList className="h-4 w-4 text-primary/60" />
                <p className="text-sm font-medium">Especificaciones</p>
              </div>
              <div className="space-y-1">
                {Object.entries(cot.respuestas).map(([key, val]) => (
                  <div
                    key={key}
                    className="flex items-center justify-between rounded-md bg-muted/40 px-3 py-1.5 text-xs"
                  >
                    <span className="text-muted-foreground">{key.replace(/_/g, " ")}</span>
                    <span className="font-medium">{val}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Precio */}
          <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
            <CardContent className="pt-4">
              {cot.desglose_precio.length > 0 && (
                <div className="mb-3 space-y-1.5">
                  {cot.desglose_precio.map((item, i) => (
                    <div key={i} className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">{item.regla}</span>
                      <span className="font-mono text-sm">{formatCOP(Number(item.valor))}</span>
                    </div>
                  ))}
                  <div className="my-2 h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent" />
                </div>
              )}
              <div className="flex items-baseline justify-between">
                <span className="text-sm font-medium">Total</span>
                <span className="bg-gradient-to-r from-primary to-[oklch(0.55_0.16_310)] bg-clip-text text-2xl font-bold tracking-tight text-transparent">
                  {formatCOP(Number(cot.total))}
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Descripcion IA */}
          {cot.descripcion_ia && (
            <div>
              <div className="mb-2 flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-primary/60" />
                <p className="text-sm font-medium">Descripcion de la propuesta</p>
              </div>
              <div className="rounded-lg border border-primary/10 bg-primary/3 px-3 py-2.5 max-h-40 overflow-y-auto">
                <p className="text-xs leading-relaxed text-muted-foreground whitespace-pre-line">
                  {cot.descripcion_ia}
                </p>
              </div>
            </div>
          )}

          {/* Chat IA */}
          <div className="rounded-lg border border-primary/20 bg-gradient-to-b from-primary/3 to-transparent">
            <div className="flex items-center gap-2 px-3 py-2.5 border-b border-primary/10">
              <Bot className="h-4 w-4 text-primary" />
              <span className="text-sm font-semibold">Asistente IA</span>
              <Badge variant="secondary" className="text-[9px] ml-auto">
                Edita propuesta y regenera PDF
              </Badge>
            </div>

            {/* Messages */}
            {chatMessages.length > 0 && (
              <div className="max-h-48 overflow-y-auto px-3 py-2 space-y-2">
                {chatMessages.map((msg, i) => (
                  <div
                    key={i}
                    className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-[85%] rounded-lg px-3 py-2 text-xs leading-relaxed ${
                        msg.role === "user"
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted/60 text-foreground"
                      }`}
                    >
                      {msg.content}
                      {msg.pdfRegenerado && (
                        <div className="mt-1 flex items-center gap-1 text-[10px] opacity-80">
                          <RefreshCw className="h-2.5 w-2.5" />
                          PDF regenerado
                        </div>
                      )}
                    </div>
                  </div>
                ))}
                {chatIA.isPending && (
                  <div className="flex justify-start">
                    <div className="bg-muted/60 rounded-lg px-3 py-2 text-xs flex items-center gap-2">
                      <Loader2 className="h-3 w-3 animate-spin text-primary" />
                      Pensando...
                    </div>
                  </div>
                )}
                <div ref={chatEndRef} />
              </div>
            )}

            {/* Input */}
            <div className="p-2 border-t border-primary/10">
              <form
                onSubmit={(e) => {
                  e.preventDefault()
                  handleEnviarChat()
                }}
                className="flex items-center gap-2"
              >
                <Input
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  placeholder="Ej: Hazla mas formal, agrega garantia de 60 dias..."
                  className="h-8 text-xs flex-1 border-primary/20 focus-visible:ring-primary/30"
                  disabled={chatIA.isPending}
                />
                <Button
                  type="submit"
                  size="icon"
                  disabled={chatIA.isPending || !chatInput.trim()}
                  className="h-8 w-8 cursor-pointer bg-primary/90 hover:bg-primary shrink-0"
                >
                  <Send className="h-3.5 w-3.5" />
                </Button>
              </form>
              <p className="mt-1.5 text-[10px] text-muted-foreground px-1">
                Pide cambios a la propuesta y el PDF se regenera automaticamente
              </p>
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}
