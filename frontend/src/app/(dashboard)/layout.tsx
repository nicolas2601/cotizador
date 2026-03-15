import { Toaster } from "@/components/ui/sonner"
import { Providers } from "@/components/providers"

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <Providers>
      <div className="min-h-screen bg-background">
        <header className="sticky top-0 z-40 border-b bg-background/80 backdrop-blur-sm">
          <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4">
            <a href="/cotizadores" className="text-lg font-semibold tracking-tight">
              Tikno
            </a>
            <nav className="flex items-center gap-6 text-sm text-muted-foreground">
              <a href="/cotizadores" className="transition-colors hover:text-foreground">
                Cotizadores
              </a>
              <a href="/historial" className="transition-colors hover:text-foreground">
                Historial
              </a>
              <a href="/configuracion" className="transition-colors hover:text-foreground">
                Configuracion
              </a>
            </nav>
          </div>
        </header>
        <main className="mx-auto max-w-7xl px-4 py-8">{children}</main>
        <Toaster />
      </div>
    </Providers>
  )
}
