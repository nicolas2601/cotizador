import { create } from "zustand"
import type { Campo, CampoTipo, Configuracion, Paso, ReglaPrecio } from "@/types/cotizador"

function uid(): string {
  return crypto.randomUUID()
}

function crearCampoVacio(tipo: CampoTipo = "texto"): Campo {
  return {
    id: uid(),
    tipo,
    label: "",
    placeholder: "",
    requerido: false,
    opciones: tipo === "seleccion" ? [{ label: "", valor: "" }] : undefined,
    min: tipo === "slider" || tipo === "numero" || tipo === "area_m2" ? 0 : null,
    max: tipo === "slider" ? 100 : null,
    step: tipo === "slider" ? 1 : null,
    unidad: tipo === "area_m2" ? "m2" : undefined,
  }
}

function crearPasoVacio(): Paso {
  return {
    id: uid(),
    titulo: "",
    descripcion: "",
    campos: [],
  }
}

interface FormBuilderState {
  nombre: string
  slug: string
  descripcion: string
  configuracion: Configuracion
  reglasPrecio: ReglaPrecio[]
  pasoActivo: string | null
  campoActivo: string | null
  isDirty: boolean

  setNombre: (nombre: string) => void
  setSlug: (slug: string) => void
  setDescripcion: (descripcion: string) => void

  agregarPaso: () => void
  eliminarPaso: (pasoId: string) => void
  actualizarPaso: (pasoId: string, data: Partial<Paso>) => void
  moverPaso: (fromIndex: number, toIndex: number) => void
  seleccionarPaso: (pasoId: string | null) => void

  agregarCampo: (pasoId: string, tipo?: CampoTipo) => void
  eliminarCampo: (pasoId: string, campoId: string) => void
  actualizarCampo: (pasoId: string, campoId: string, data: Partial<Campo>) => void
  seleccionarCampo: (campoId: string | null) => void

  agregarRegla: () => void
  eliminarRegla: (reglaId: string) => void
  actualizarRegla: (reglaId: string, data: Partial<ReglaPrecio>) => void

  cargarCotizador: (data: {
    nombre: string
    slug: string
    descripcion: string
    configuracion: Configuracion
    reglas_precio: ReglaPrecio[]
  }) => void
  reset: () => void
}

export const useFormBuilderStore = create<FormBuilderState>((set, get) => ({
  nombre: "",
  slug: "",
  descripcion: "",
  configuracion: { pasos: [] },
  reglasPrecio: [],
  pasoActivo: null,
  campoActivo: null,
  isDirty: false,

  setNombre: (nombre) => set({ nombre, isDirty: true }),
  setSlug: (slug) => set({ slug, isDirty: true }),
  setDescripcion: (descripcion) => set({ descripcion, isDirty: true }),

  agregarPaso: () => {
    const paso = crearPasoVacio()
    set((s) => ({
      configuracion: { pasos: [...s.configuracion.pasos, paso] },
      pasoActivo: paso.id,
      isDirty: true,
    }))
  },

  eliminarPaso: (pasoId) =>
    set((s) => ({
      configuracion: { pasos: s.configuracion.pasos.filter((p) => p.id !== pasoId) },
      pasoActivo: s.pasoActivo === pasoId ? null : s.pasoActivo,
      isDirty: true,
    })),

  actualizarPaso: (pasoId, data) =>
    set((s) => ({
      configuracion: {
        pasos: s.configuracion.pasos.map((p) => (p.id === pasoId ? { ...p, ...data } : p)),
      },
      isDirty: true,
    })),

  moverPaso: (fromIndex, toIndex) =>
    set((s) => {
      const pasos = [...s.configuracion.pasos]
      const [moved] = pasos.splice(fromIndex, 1)
      pasos.splice(toIndex, 0, moved)
      return { configuracion: { pasos }, isDirty: true }
    }),

  seleccionarPaso: (pasoId) => set({ pasoActivo: pasoId, campoActivo: null }),

  agregarCampo: (pasoId, tipo = "texto") =>
    set((s) => ({
      configuracion: {
        pasos: s.configuracion.pasos.map((p) =>
          p.id === pasoId ? { ...p, campos: [...p.campos, crearCampoVacio(tipo)] } : p
        ),
      },
      isDirty: true,
    })),

  eliminarCampo: (pasoId, campoId) =>
    set((s) => ({
      configuracion: {
        pasos: s.configuracion.pasos.map((p) =>
          p.id === pasoId ? { ...p, campos: p.campos.filter((c) => c.id !== campoId) } : p
        ),
      },
      campoActivo: s.campoActivo === campoId ? null : s.campoActivo,
      isDirty: true,
    })),

  actualizarCampo: (pasoId, campoId, data) =>
    set((s) => ({
      configuracion: {
        pasos: s.configuracion.pasos.map((p) =>
          p.id === pasoId
            ? { ...p, campos: p.campos.map((c) => (c.id === campoId ? { ...c, ...data } : c)) }
            : p
        ),
      },
      isDirty: true,
    })),

  seleccionarCampo: (campoId) => set({ campoActivo: campoId }),

  agregarRegla: () =>
    set((s) => ({
      reglasPrecio: [
        ...s.reglasPrecio,
        {
          id: uid(),
          nombre: "",
          formula: "",
          variables: {},
          activa: true,
          prioridad: s.reglasPrecio.length,
        },
      ],
      isDirty: true,
    })),

  eliminarRegla: (reglaId) =>
    set((s) => ({
      reglasPrecio: s.reglasPrecio.filter((r) => r.id !== reglaId),
      isDirty: true,
    })),

  actualizarRegla: (reglaId, data) =>
    set((s) => ({
      reglasPrecio: s.reglasPrecio.map((r) => (r.id === reglaId ? { ...r, ...data } : r)),
      isDirty: true,
    })),

  cargarCotizador: (data) =>
    set({
      nombre: data.nombre,
      slug: data.slug,
      descripcion: data.descripcion,
      configuracion: data.configuracion,
      reglasPrecio: data.reglas_precio,
      pasoActivo: data.configuracion.pasos[0]?.id || null,
      isDirty: false,
    }),

  reset: () =>
    set({
      nombre: "",
      slug: "",
      descripcion: "",
      configuracion: { pasos: [] },
      reglasPrecio: [],
      pasoActivo: null,
      campoActivo: null,
      isDirty: false,
    }),
}))
