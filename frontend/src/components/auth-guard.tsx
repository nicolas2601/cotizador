"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuthStore } from "@/stores/auth-store"

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)
  const [checked, setChecked] = useState(false)

  useEffect(() => {
    // Wait for zustand to hydrate from localStorage
    const unsub = useAuthStore.persist.onFinishHydration(() => {
      setChecked(true)
    })
    // If already hydrated
    if (useAuthStore.persist.hasHydrated()) {
      setChecked(true)
    }
    return unsub
  }, [])

  useEffect(() => {
    if (checked && !isAuthenticated) {
      router.replace("/login")
    }
  }, [checked, isAuthenticated, router])

  if (!checked || !isAuthenticated) {
    return null
  }

  return <>{children}</>
}
