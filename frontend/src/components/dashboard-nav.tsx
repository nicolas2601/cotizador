"use client"

import { useRouter } from "next/navigation"
import { LogOut } from "lucide-react"

import { Button } from "@/components/ui/button"
import { useAuthStore } from "@/stores/auth-store"

export function DashboardNav() {
  const router = useRouter()
  const { user, logout } = useAuthStore()

  function handleLogout() {
    logout()
    router.replace("/login")
  }

  return (
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
          <a href="/docs" className="transition-colors hover:text-foreground" target="_blank" rel="noopener noreferrer">
            Docs
          </a>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleLogout}
            className="gap-1.5 text-muted-foreground"
          >
            <LogOut className="h-3.5 w-3.5" />
            {user?.email?.split("@")[0]}
          </Button>
        </nav>
      </div>
    </header>
  )
}
