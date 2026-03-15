import { create } from "zustand"
import { persist } from "zustand/middleware"

interface ProspectFormState {
  cotizadorSlug: string
  respuestas: Record<string, string>
  pasoActual: number
  enviado: boolean

  prospecto: {
    nombre: string
    email: string
    telefono: string
  }

  setRespuesta: (campoId: string, valor: string) => void
  setPasoActual: (paso: number) => void
  setProspecto: (data: Partial<ProspectFormState["prospecto"]>) => void
  setEnviado: (enviado: boolean) => void
  iniciar: (slug: string) => void
  reset: () => void
}

export const useProspectFormStore = create<ProspectFormState>()(
  persist(
    (set) => ({
      cotizadorSlug: "",
      respuestas: {},
      pasoActual: 0,
      enviado: false,
      prospecto: { nombre: "", email: "", telefono: "" },

      setRespuesta: (campoId, valor) =>
        set((s) => ({ respuestas: { ...s.respuestas, [campoId]: valor } })),

      setPasoActual: (paso) => set({ pasoActual: paso }),

      setProspecto: (data) =>
        set((s) => ({ prospecto: { ...s.prospecto, ...data } })),

      setEnviado: (enviado) => set({ enviado }),

      iniciar: (slug) =>
        set((s) => {
          if (s.cotizadorSlug === slug && !s.enviado) return {}
          return {
            cotizadorSlug: slug,
            respuestas: {},
            pasoActual: 0,
            enviado: false,
            prospecto: { nombre: "", email: "", telefono: "" },
          }
        }),

      reset: () =>
        set({
          cotizadorSlug: "",
          respuestas: {},
          pasoActual: 0,
          enviado: false,
          prospecto: { nombre: "", email: "", telefono: "" },
        }),
    }),
    { name: "tikno-prospect-form" }
  )
)
