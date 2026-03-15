export type CampoTipo = "texto" | "numero" | "seleccion" | "multiple" | "area_m2" | "slider"

export interface OpcionCampo {
  label: string
  valor: string
}

export interface Campo {
  id: string
  tipo: CampoTipo
  label: string
  placeholder?: string
  requerido: boolean
  opciones?: OpcionCampo[]
  min?: number | null
  max?: number | null
  step?: number | null
  unidad?: string
}

export interface Paso {
  id: string
  titulo: string
  descripcion: string
  campos: Campo[]
}

export interface Configuracion {
  pasos: Paso[]
}

export interface ReglaPrecio {
  id: string
  nombre: string
  formula: string
  variables: Record<string, number>
  activa: boolean
  prioridad: number
}

export interface Cotizador {
  id: string
  nombre: string
  slug: string
  descripcion: string
  configuracion: Configuracion
  activo: boolean
  moneda: string
  reglas_precio: ReglaPrecio[]
  created_at: string
  updated_at: string
}

// Respuesta del endpoint publico (CotizadorPublicoSerializer)
export interface CotizadorPublico {
  id: string
  nombre: string
  slug: string
  descripcion: string
  configuracion: Configuracion
  moneda: string
  negocio_nombre: string
  negocio_slug: string
  negocio_logo: string
}
