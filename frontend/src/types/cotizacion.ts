export type EstadoCotizacion =
  | "pendiente"
  | "procesando"
  | "lista"
  | "enviada"
  | "aceptada"
  | "rechazada"
  | "error"

export const ESTADO_LABELS: Record<EstadoCotizacion, string> = {
  pendiente: "Pendiente",
  procesando: "Procesando",
  lista: "Lista",
  enviada: "Enviada",
  aceptada: "Aceptada",
  rechazada: "Rechazada",
  error: "Error",
}

export const ESTADO_COLORS: Record<EstadoCotizacion, string> = {
  pendiente: "bg-yellow-100 text-yellow-800",
  procesando: "bg-blue-100 text-blue-800",
  lista: "bg-emerald-100 text-emerald-800",
  enviada: "bg-indigo-100 text-indigo-800",
  aceptada: "bg-green-100 text-green-800",
  rechazada: "bg-red-100 text-red-800",
  error: "bg-red-100 text-red-800",
}

export interface Cotizacion {
  id: string
  cotizador: string
  cotizador_nombre: string
  estado: EstadoCotizacion
  prospecto_nombre: string
  prospecto_email: string
  prospecto_telefono: string
  prospecto_empresa: string
  respuestas: Record<string, string>
  desglose_precio: { regla: string; valor: string }[]
  subtotal: string
  total: string
  moneda: string
  descripcion_ia: string
  pdf_url: string
  notas: string
  created_at: string
  updated_at: string
}
