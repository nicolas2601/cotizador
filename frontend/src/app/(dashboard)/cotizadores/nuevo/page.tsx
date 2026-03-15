"use client"

import { useEffect } from "react"
import { Sparkles } from "lucide-react"
import { useFormBuilderStore } from "@/stores/form-builder-store"
import { FormBuilder } from "@/components/form-builder/FormBuilder"
import { AIGeneratorDialog } from "@/components/form-builder/AIGeneratorDialog"
import { Button } from "@/components/ui/button"

export default function NuevoCotizadorPage() {
  const reset = useFormBuilderStore((s) => s.reset)

  useEffect(() => {
    reset()
  }, [reset])

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div className="flex items-center justify-end">
        <AIGeneratorDialog
          trigger={
            <Button variant="outline" className="cursor-pointer gap-2 border-primary/30 text-primary transition-all duration-200 hover:bg-primary/5 hover:border-primary/50 animate-pulse-glow">
              <Sparkles className="h-4 w-4" />
              Crear con IA
            </Button>
          }
        />
      </div>
      <FormBuilder mode="crear" />
    </div>
  )
}
