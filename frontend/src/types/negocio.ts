export interface Negocio {
  id: string
  nombre: string
  slug: string
  logo_url: string
  telefono: string
  direccion: string
  sitio_web: string
  color_primario: string
  activo: boolean
  created_at: string
}

export interface UserProfile {
  id: number
  email: string
  first_name: string
  last_name: string
  negocio: Negocio
}
