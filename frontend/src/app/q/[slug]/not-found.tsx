import { Button } from "@/components/ui/button"

export default function CotizadorNotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="text-center">
        <p className="text-6xl font-bold text-muted-foreground/20">404</p>
        <h1 className="mt-4 text-xl font-semibold">Cotizador no encontrado</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Este cotizador no existe o ya no esta disponible
        </p>
        <Button variant="outline" className="mt-6" asChild>
          <a href="/">Volver al inicio</a>
        </Button>
      </div>
    </div>
  )
}
