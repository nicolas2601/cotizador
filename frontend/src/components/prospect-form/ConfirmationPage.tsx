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
    <div className="flex min-h-screen items-center justify-center px-4">
      <Card className="w-full max-w-md text-center">
        <CardContent className="pt-10 pb-8">
          {negocioLogo ? (
            <img
              src={negocioLogo}
              alt={negocioNombre}
              className="mx-auto mb-6 h-10 object-contain"
            />
          ) : negocioNombre ? (
            <p className="mb-6 text-lg font-semibold">{negocioNombre}</p>
          ) : null}

          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-green-100 text-green-600">
            <CheckCircle2 className="h-7 w-7" />
          </div>

          <h1 className="text-xl font-semibold">Tu cotizacion fue enviada</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Revisa tu correo electronico. Recibiras la propuesta con el detalle
            de precios y servicios en los proximos minutos.
          </p>

          <Button variant="outline" className="mt-8 gap-2" onClick={onReset}>
            <RotateCcw className="h-4 w-4" />
            Cotizar de nuevo
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
