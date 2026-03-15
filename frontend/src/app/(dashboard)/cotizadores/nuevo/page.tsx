"use client"

import { useEffect } from "react"
import { useFormBuilderStore } from "@/stores/form-builder-store"
import { FormBuilder } from "@/components/form-builder/FormBuilder"

export default function NuevoCotizadorPage() {
  const reset = useFormBuilderStore((s) => s.reset)

  useEffect(() => {
    reset()
  }, [reset])

  return <FormBuilder mode="crear" />
}
