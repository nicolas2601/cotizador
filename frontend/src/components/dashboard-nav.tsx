"use client"

import { useRouter, usePathname } from "next/navigation"
import { LogOut } from "lucide-react"

import { Button } from "@/components/ui/button"
import { useAuthStore } from "@/stores/auth-store"

export function DashboardNav() {
  const router = useRouter()
  const pathname = usePathname()
  const { user, logout } = useAuthStore()

  function handleLogout() {
    logout()
    router.replace("/login")
  }

  const links: { href: string; label: string; external?: boolean; exact?: boolean }[] = [
    { href: "/dashboard", label: "Dashboard", exact: true },
    { href: "/cotizadores", label: "Cotizadores" },
    { href: "/historial", label: "Historial" },
    { href: "/configuracion", label: "Configuracion" },
    { href: "/docs", label: "Docs", external: true },
  ]

  const initials = user?.email
    ? user.email.substring(0, 2).toUpperCase()
    : "U"

  return (
    <header className="sticky top-0 z-40 border-b border-border/50 glass">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4">
        <a
          href="/dashboard"
          className="bg-gradient-to-r from-primary to-[oklch(0.55_0.16_310)] bg-clip-text text-lg font-bold tracking-tight text-transparent transition-opacity hover:opacity-80"
        >
          Tikno
        </a>
        <nav className="flex items-center gap-1 text-sm">
          {links.map((link) => {
            const isActive = !link.external && (
              link.exact ? pathname === link.href : pathname?.startsWith(link.href)
            )
            return (
              <a
                key={link.href}
                href={link.href}
                {...(link.external
                  ? { target: "_blank", rel: "noopener noreferrer" }
                  : {})}
                className={`relative cursor-pointer rounded-md px-3 py-1.5 text-sm font-medium transition-all duration-200 ${
                  isActive
                    ? "text-primary bg-primary/8"
                    : "text-muted-foreground hover:text-foreground hover:bg-accent/60"
                }`}
              >
                {link.label}
                {isActive && (
                  <span className="absolute bottom-0 left-1/2 h-0.5 w-4 -translate-x-1/2 rounded-full bg-primary" />
                )}
              </a>
            )
          })}
          <div className="ml-3 flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
              {initials}
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLogout}
              className="cursor-pointer gap-1.5 text-muted-foreground hover:text-foreground transition-colors duration-200"
            >
              <LogOut className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">
                {user?.email?.split("@")[0]}
              </span>
            </Button>
          </div>
        </nav>
      </div>
    </header>
  )
}
