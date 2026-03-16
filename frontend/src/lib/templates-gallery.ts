export interface CotizadorTemplate {
  id: string
  nombre: string
  descripcion: string
  categoria: string
  icono: string // lucide icon name
  configuracion: {
    pasos: Array<{
      id: string
      titulo: string
      descripcion: string
      campos: Array<{
        id: string
        tipo: string
        label: string
        requerido: boolean
        opciones?: Array<{ label: string; valor: string }>
        min?: number | null
        max?: number | null
        step?: number | null
        unidad?: string | null
      }>
    }>
  }
  reglas_precio: Array<{
    nombre: string
    formula: string
    variables: Record<string, number>
    prioridad: number
  }>
}

export const CATEGORIAS = [
  { id: "todos", label: "Todos" },
  { id: "tecnologia", label: "Tecnologia" },
  { id: "diseno", label: "Diseno" },
  { id: "construccion", label: "Construccion" },
  { id: "eventos", label: "Eventos" },
  { id: "servicios", label: "Servicios" },
]

export const TEMPLATES: CotizadorTemplate[] = [
  {
    id: "desarrollo-web",
    nombre: "Desarrollo Web",
    descripcion: "Cotiza sitios web, landing pages y aplicaciones",
    categoria: "tecnologia",
    icono: "Globe",
    configuracion: {
      pasos: [
        {
          id: "paso-1",
          titulo: "Tipo de proyecto",
          descripcion: "Selecciona que necesitas",
          campos: [
            {
              id: "tipo_proyecto",
              tipo: "seleccion",
              label: "Que tipo de sitio web necesitas?",
              requerido: true,
              opciones: [
                { label: "Landing page (1 pagina)", valor: "800000" },
                { label: "Sitio corporativo (5 paginas)", valor: "2500000" },
                { label: "E-commerce basico", valor: "4000000" },
                { label: "Aplicacion web personalizada", valor: "7000000" },
              ],
            },
          ],
        },
        {
          id: "paso-2",
          titulo: "Funcionalidades",
          descripcion: "Que necesitas incluir?",
          campos: [
            {
              id: "extras",
              tipo: "multiple",
              label: "Funcionalidades adicionales",
              requerido: false,
              opciones: [
                { label: "Blog integrado", valor: "500000" },
                { label: "Sistema de reservas", valor: "800000" },
                { label: "Chat en vivo", valor: "300000" },
                { label: "SEO avanzado", valor: "600000" },
                { label: "Multi-idioma", valor: "700000" },
              ],
            },
          ],
        },
        {
          id: "paso-3",
          titulo: "Diseno",
          descripcion: "Nivel de personalizacion",
          campos: [
            {
              id: "nivel_diseno",
              tipo: "seleccion",
              label: "Que nivel de diseno necesitas?",
              requerido: true,
              opciones: [
                { label: "Template pre-diseñado", valor: "0" },
                { label: "Diseno personalizado", valor: "1200000" },
                { label: "Diseno premium con branding", valor: "2500000" },
              ],
            },
          ],
        },
      ],
    },
    reglas_precio: [
      {
        nombre: "Precio total",
        formula: "tipo_proyecto + extras + nivel_diseno",
        variables: {},
        prioridad: 0,
      },
    ],
  },
  {
    id: "fotografia",
    nombre: "Fotografia Profesional",
    descripcion: "Sesiones fotograficas, eventos y producto",
    categoria: "diseno",
    icono: "Camera",
    configuracion: {
      pasos: [
        {
          id: "paso-1",
          titulo: "Tipo de sesion",
          descripcion: "Que tipo de fotografia necesitas?",
          campos: [
            {
              id: "tipo_sesion",
              tipo: "seleccion",
              label: "Selecciona el tipo de sesion",
              requerido: true,
              opciones: [
                { label: "Retrato personal (1 hora)", valor: "250000" },
                { label: "Sesion de producto (hasta 20 productos)", valor: "450000" },
                { label: "Evento social (4 horas)", valor: "800000" },
                { label: "Evento corporativo (8 horas)", valor: "1500000" },
                { label: "Sesion de marca/branding", valor: "600000" },
              ],
            },
          ],
        },
        {
          id: "paso-2",
          titulo: "Extras",
          descripcion: "Servicios adicionales",
          campos: [
            {
              id: "extras_foto",
              tipo: "multiple",
              label: "Agrega servicios extras",
              requerido: false,
              opciones: [
                { label: "Edicion avanzada (retoque profesional)", valor: "150000" },
                { label: "Entrega express (24 horas)", valor: "200000" },
                { label: "Album impreso premium", valor: "350000" },
                { label: "Video highlight reel (1 min)", valor: "500000" },
              ],
            },
          ],
        },
      ],
    },
    reglas_precio: [
      {
        nombre: "Precio sesion",
        formula: "tipo_sesion + extras_foto",
        variables: {},
        prioridad: 0,
      },
    ],
  },
  {
    id: "remodelacion",
    nombre: "Remodelacion y Construccion",
    descripcion: "Cotiza proyectos de construccion y remodelacion",
    categoria: "construccion",
    icono: "Hammer",
    configuracion: {
      pasos: [
        {
          id: "paso-1",
          titulo: "Tipo de proyecto",
          descripcion: "Que necesitas remodelar?",
          campos: [
            {
              id: "tipo_remodelacion",
              tipo: "seleccion",
              label: "Tipo de remodelacion",
              requerido: true,
              opciones: [
                { label: "Cocina completa", valor: "8000000" },
                { label: "Bano completo", valor: "5000000" },
                { label: "Habitacion / sala", valor: "4000000" },
                { label: "Fachada exterior", valor: "6000000" },
                { label: "Oficina comercial", valor: "10000000" },
              ],
            },
          ],
        },
        {
          id: "paso-2",
          titulo: "Area",
          descripcion: "Metros cuadrados del espacio",
          campos: [
            {
              id: "area",
              tipo: "area_m2",
              label: "Area aproximada en metros cuadrados",
              requerido: true,
              min: 5,
              max: 200,
              step: 5,
              unidad: "m2",
              opciones: undefined,
            },
          ],
        },
        {
          id: "paso-3",
          titulo: "Acabados",
          descripcion: "Nivel de acabados",
          campos: [
            {
              id: "acabados",
              tipo: "seleccion",
              label: "Que nivel de acabados prefieres?",
              requerido: true,
              opciones: [
                { label: "Acabados estandar", valor: "0" },
                { label: "Acabados semi-premium", valor: "3000000" },
                { label: "Acabados premium importados", valor: "7000000" },
              ],
            },
          ],
        },
      ],
    },
    reglas_precio: [
      {
        nombre: "Precio base + acabados",
        formula: "tipo_remodelacion + acabados",
        variables: {},
        prioridad: 0,
      },
      {
        nombre: "Ajuste por area",
        formula: "area * precio_m2",
        variables: { precio_m2: 50000 },
        prioridad: 1,
      },
    ],
  },
  {
    id: "eventos",
    nombre: "Organizacion de Eventos",
    descripcion: "Bodas, cumpleanos, corporativos y mas",
    categoria: "eventos",
    icono: "PartyPopper",
    configuracion: {
      pasos: [
        {
          id: "paso-1",
          titulo: "Tipo de evento",
          descripcion: "Que evento estas planeando?",
          campos: [
            {
              id: "tipo_evento",
              tipo: "seleccion",
              label: "Selecciona el tipo de evento",
              requerido: true,
              opciones: [
                { label: "Cumpleanos o reunion pequena (hasta 30 personas)", valor: "1500000" },
                { label: "Evento corporativo (hasta 100 personas)", valor: "5000000" },
                { label: "Boda o celebracion grande (hasta 200 personas)", valor: "12000000" },
                { label: "Conferencia o congreso", valor: "8000000" },
              ],
            },
          ],
        },
        {
          id: "paso-2",
          titulo: "Servicios incluidos",
          descripcion: "Que necesitas para tu evento?",
          campos: [
            {
              id: "servicios_evento",
              tipo: "multiple",
              label: "Servicios adicionales",
              requerido: false,
              opciones: [
                { label: "Decoracion tematica", valor: "1200000" },
                { label: "Catering / banquete", valor: "2500000" },
                { label: "DJ y sonido profesional", valor: "800000" },
                { label: "Fotografia y video", valor: "1500000" },
                { label: "Mobiliario premium", valor: "900000" },
              ],
            },
          ],
        },
      ],
    },
    reglas_precio: [
      {
        nombre: "Precio del evento",
        formula: "tipo_evento + servicios_evento",
        variables: {},
        prioridad: 0,
      },
    ],
  },
  {
    id: "marketing-digital",
    nombre: "Marketing Digital",
    descripcion: "Community management, ads y estrategia digital",
    categoria: "tecnologia",
    icono: "Megaphone",
    configuracion: {
      pasos: [
        {
          id: "paso-1",
          titulo: "Servicio principal",
          descripcion: "Que servicio necesitas?",
          campos: [
            {
              id: "servicio_marketing",
              tipo: "seleccion",
              label: "Selecciona el servicio",
              requerido: true,
              opciones: [
                { label: "Community Management (redes sociales)", valor: "1200000" },
                { label: "Campanas de publicidad (Google/Meta Ads)", valor: "1800000" },
                { label: "Estrategia digital completa", valor: "3500000" },
                { label: "Email marketing y automatizacion", valor: "900000" },
              ],
            },
          ],
        },
        {
          id: "paso-2",
          titulo: "Duracion",
          descripcion: "Por cuantos meses?",
          campos: [
            {
              id: "meses",
              tipo: "slider",
              label: "Numero de meses",
              requerido: true,
              min: 1,
              max: 12,
              step: 1,
              unidad: "meses",
              opciones: undefined,
            },
          ],
        },
      ],
    },
    reglas_precio: [
      {
        nombre: "Precio por duracion",
        formula: "servicio_marketing * meses",
        variables: {},
        prioridad: 0,
      },
    ],
  },
  {
    id: "diseno-grafico",
    nombre: "Diseno Grafico",
    descripcion: "Logos, branding, material impreso y digital",
    categoria: "diseno",
    icono: "Palette",
    configuracion: {
      pasos: [
        {
          id: "paso-1",
          titulo: "Que necesitas?",
          descripcion: "Selecciona el tipo de diseno",
          campos: [
            {
              id: "tipo_diseno",
              tipo: "seleccion",
              label: "Tipo de proyecto de diseno",
              requerido: true,
              opciones: [
                { label: "Logo + manual de marca basico", valor: "1500000" },
                { label: "Branding completo (logo + papeleria + guia)", valor: "3500000" },
                { label: "Paquete redes sociales (30 piezas)", valor: "800000" },
                { label: "Catalogo o brochure (hasta 16 paginas)", valor: "1200000" },
              ],
            },
          ],
        },
        {
          id: "paso-2",
          titulo: "Extras",
          descripcion: "Necesitas algo adicional?",
          campos: [
            {
              id: "extras_diseno",
              tipo: "multiple",
              label: "Servicios complementarios",
              requerido: false,
              opciones: [
                { label: "Animacion de logo (motion)", valor: "500000" },
                { label: "Diseno de packaging", valor: "800000" },
                { label: "Ilustraciones personalizadas", valor: "600000" },
                { label: "Adaptacion a formatos impresos", valor: "300000" },
              ],
            },
          ],
        },
      ],
    },
    reglas_precio: [
      {
        nombre: "Precio total diseno",
        formula: "tipo_diseno + extras_diseno",
        variables: {},
        prioridad: 0,
      },
    ],
  },
  {
    id: "consultoria",
    nombre: "Consultoria Empresarial",
    descripcion: "Asesoria en negocios, finanzas y procesos",
    categoria: "servicios",
    icono: "Briefcase",
    configuracion: {
      pasos: [
        {
          id: "paso-1",
          titulo: "Tipo de consultoria",
          descripcion: "En que area necesitas asesoria?",
          campos: [
            {
              id: "tipo_consultoria",
              tipo: "seleccion",
              label: "Area de consultoria",
              requerido: true,
              opciones: [
                { label: "Estrategia de negocios", valor: "2000000" },
                { label: "Finanzas y contabilidad", valor: "1500000" },
                { label: "Procesos y operaciones", valor: "1800000" },
                { label: "Recursos humanos", valor: "1200000" },
                { label: "Transformacion digital", valor: "2500000" },
              ],
            },
          ],
        },
        {
          id: "paso-2",
          titulo: "Alcance",
          descripcion: "Cuantas sesiones necesitas?",
          campos: [
            {
              id: "sesiones",
              tipo: "slider",
              label: "Numero de sesiones (2 horas c/u)",
              requerido: true,
              min: 1,
              max: 20,
              step: 1,
              unidad: "sesiones",
              opciones: undefined,
            },
          ],
        },
      ],
    },
    reglas_precio: [
      {
        nombre: "Precio consultoria",
        formula: "tipo_consultoria + sesiones * precio_sesion",
        variables: { precio_sesion: 250000 },
        prioridad: 0,
      },
    ],
  },
]
