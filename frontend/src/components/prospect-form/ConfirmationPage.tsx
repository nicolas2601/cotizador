"use client"

import { CheckCircle2, RotateCcw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"

interface Props {
  negocioNombre: string
  negocioLogo: string
  onReset: () => void
}

export function ConfirmationPage({ negocioNombre, negocioLogo, onReset }: Props) {
  return (
    <div className="flex min-h-screen items-center justify-center px-4 bg-gradient-to-br from-background via-background to-primary/3">
      <Card className="w-full max-w-md text-center overflow-hidden shadow-lg shadow-primary/5 animate-fade-in-up">
        <div className="h-1 bg-gradient-to-r from-primary to-[oklch(0.55_0.16_310)]" />
        <CardContent className="pt-10 pb-8">
          {negocioLogo ? (
            <img
              src={negocioLogo}
              alt={negocioNombre}
              className="mx-auto mb-6 h-10 object-contain"
            />
          ) : negocioNombre ? (
            <p className="mb-6 text-lg font-semibold text-primary">{negocioNombre}</p>
          ) : null}

          <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-green-100 to-green-50 animate-scale-in">
            <CheckCircle2 className="h-8 w-8 text-green-600" style={{ animationDelay: "0.2s" }} />
          </div>

          <h1 className="text-xl font-semibold animate-fade-in-up" style={{ animationDelay: "0.15s" }}>
            Tu cotizacion fue enviada
          </h1>
          <p className="mt-2 text-sm text-muted-foreground animate-fade-in-up" style={{ animationDelay: "0.2s" }}>
            Revisa tu correo electronico. Recibiras la propuesta con el detalle
            de precios y servicios en los proximos minutos.
          </p>

          <Button
            variant="outline"
            className="mt-8 cursor-pointer gap-2 border-primary/20 transition-all duration-200 hover:bg-primary/5 hover:border-primary/40 animate-fade-in-up"
            onClick={onReset}
            style={{ animationDelay: "0.3s" }}
          >
            <RotateCcw className="h-4 w-4" />
            Cotizar de nuevo
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
