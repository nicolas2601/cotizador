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
    <div className="space-y-6">
      <div className="flex items-center justify-end">
        <AIGeneratorDialog
          trigger={
            <Button variant="outline">
              <Sparkles className="mr-2 h-4 w-4" />
              Crear con IA
            </Button>
          }
        />
      </div>
      <FormBuilder mode="crear" />
    </div>
  )
}
