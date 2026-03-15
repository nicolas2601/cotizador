import { Toaster } from "@/components/ui/sonner"
import { Providers } from "@/components/providers"
import { AuthGuard } from "@/components/auth-guard"
import { DashboardNav } from "@/components/dashboard-nav"

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <Providers>
      <AuthGuard>
        <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/3">
          <DashboardNav />
          <main className="mx-auto max-w-7xl px-4 py-8">{children}</main>
          <Toaster />
        </div>
      </AuthGuard>
    </Providers>
  )
}
