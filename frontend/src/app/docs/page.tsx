import Link from "next/link"
import {
  UserPlus,
  Layout,
  Calculator,
  Share2,
  FormInput,
  FileText,
  BarChart3,
  Sparkles,
  ArrowLeft,
  ArrowRight,
  Palette,
  Mail,
  ListChecks,
  Zap,
  Globe,
  MessageSquareText,
  Copy,
  Check,
  Lightbulb,
  AlertTriangle,
  type LucideIcon,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"

function StepItem({
  number,
  icon: Icon,
  title,
  description,
}: {
  number: number
  icon: LucideIcon
  title: string
  description: string
}) {
  return (
    <div className="flex gap-4 animate-fade-in-up" style={{ animationDelay: `${number * 0.05}s` }}>
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-primary to-[oklch(0.55_0.16_310)] text-white text-sm font-bold shadow-md shadow-primary/20">
        {number}
      </div>
      <div className="space-y-1">
        <div className="flex items-center gap-2">
          <Icon className="h-4 w-4 text-primary" />
          <h3 className="font-semibold">{title}</h3>
        </div>
        <p className="text-sm text-muted-foreground leading-relaxed">{description}</p>
      </div>
    </div>
  )
}

function FieldTypeRow({
  tipo,
  descripcion,
  ejemplo,
}: {
  tipo: string
  descripcion: string
  ejemplo: string
}) {
  return (
    <tr className="border-b last:border-0 transition-colors duration-150 hover:bg-primary/3">
      <td className="py-3 pr-4">
        <Badge variant="secondary" className="font-mono text-xs bg-primary/8 text-primary border-primary/15">
          {tipo}
        </Badge>
      </td>
      <td className="py-3 pr-4 text-sm">{descripcion}</td>
      <td className="py-3 text-sm text-muted-foreground">{ejemplo}</td>
    </tr>
  )
}

function IndustryCard({
  title,
  examples,
  accentColor,
}: {
  title: string
  examples: string[]
  accentColor?: string
}) {
  return (
    <Card className="overflow-hidden transition-all duration-300 hover:shadow-lg hover:shadow-primary/10 hover:-translate-y-1 cursor-pointer">
      <div className="h-1 bg-gradient-to-r from-primary to-[oklch(0.55_0.16_310)]" />
      <CardHeader className="pb-3">
        <CardTitle className="text-base">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <ul className="space-y-1.5">
          {examples.map((ex, i) => (
            <li key={i} className="flex items-center gap-2 text-sm text-muted-foreground">
              <span className="h-1 w-1 rounded-full bg-primary/50 shrink-0" />
              {ex}
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  )
}

function PromptExample({
  title,
  prompt,
}: {
  title: string
  prompt: string
}) {
  return (
    <Card className="overflow-hidden shadow-sm transition-shadow duration-300 hover:shadow-md">
      <div className="h-0.5 bg-gradient-to-r from-primary to-[oklch(0.55_0.16_310)]" />
      <CardHeader className="pb-2">
        <CardTitle className="text-base flex items-center gap-2">
          <MessageSquareText className="h-4 w-4 text-primary" />
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="rounded-lg bg-gradient-to-r from-primary/5 to-transparent border border-primary/10 p-4">
          <p className="text-sm whitespace-pre-line leading-relaxed text-muted-foreground">
            {prompt}
          </p>
        </div>
      </CardContent>
    </Card>
  )
}

function TipItem({ text }: { text: string }) {
  return (
    <div className="flex items-start gap-3 rounded-lg border border-green-500/10 bg-green-500/3 p-3 transition-all duration-200">
      <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-green-500/10">
        <Check className="h-3.5 w-3.5 text-green-600 dark:text-green-400" />
      </div>
      <span className="text-sm">{text}</span>
    </div>
  )
}

function MistakeItem({ bad, why }: { bad: string; why: string }) {
  return (
    <div className="flex items-start gap-3 rounded-lg border border-red-500/10 bg-red-500/3 p-3 transition-all duration-200">
      <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-red-500/10">
        <AlertTriangle className="h-3.5 w-3.5 text-red-500 dark:text-red-400" />
      </div>
      <div className="space-y-1">
        <p className="text-sm font-medium">&quot;{bad}&quot;</p>
        <p className="text-xs text-muted-foreground">{why}</p>
      </div>
    </div>
  )
}

export default function DocsPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-border/50 glass">
        <div className="mx-auto flex h-14 max-w-4xl items-center justify-between px-4">
          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="cursor-pointer bg-gradient-to-r from-primary to-[oklch(0.55_0.16_310)] bg-clip-text text-lg font-bold tracking-tight text-transparent transition-opacity hover:opacity-80"
            >
              Tikno
            </Link>
            <Separator orientation="vertical" className="h-5" />
            <span className="text-sm text-muted-foreground">Documentacion</span>
          </div>
          <Link href="/login">
            <Button variant="outline" size="sm" className="cursor-pointer gap-1.5 border-primary/20 transition-all duration-200 hover:bg-primary/5 hover:border-primary/40">
              <ArrowLeft className="h-3.5 w-3.5" />
              Iniciar sesion
            </Button>
          </Link>
        </div>
      </header>

      {/* Hero section */}
      <section className="relative overflow-hidden border-b">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/8 via-background to-[oklch(0.55_0.16_310/0.06)]" />
        <div className="absolute top-0 right-0 h-64 w-64 rounded-full bg-primary/5 blur-[80px]" />
        <div className="absolute bottom-0 left-0 h-48 w-48 rounded-full bg-[oklch(0.55_0.16_310/0.08)] blur-[60px]" />
        <div className="relative mx-auto max-w-4xl px-4 py-16 sm:py-20">
          <div className="animate-fade-in-up">
            <Badge className="mb-4 bg-primary/10 text-primary border-primary/20">
              Documentacion
            </Badge>
            <h1 className="text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl">
              Que es{" "}
              <span className="bg-gradient-to-r from-primary to-[oklch(0.55_0.16_310)] bg-clip-text text-transparent">
                Tikno Cotizador
              </span>
              ?
            </h1>
            <p className="mt-4 text-lg text-muted-foreground leading-relaxed max-w-3xl">
              Tikno es un software para que negocios creen formularios inteligentes que
              calculan precios automaticamente y generan propuestas PDF profesionales.
              Todo sin escribir codigo.
            </p>
          </div>
          <Card className="mt-8 animate-fade-in-up border-primary/15 bg-gradient-to-r from-primary/5 to-transparent shadow-sm" style={{ animationDelay: "0.1s" }}>
            <CardContent className="pt-6">
              <p className="text-sm leading-relaxed">
                <span className="font-semibold text-primary">El problema:</span>{" "}
                Tu cliente pregunta &quot;cuanto cuesta?&quot; y tu pierdes tiempo
                calculando manualmente, buscando precios, armando propuestas en Word.{" "}
                <span className="font-semibold">Con Tikno, el cliente se auto-cotiza</span>{" "}
                y recibe una propuesta profesional al instante.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      <main className="mx-auto max-w-4xl px-4 py-12 space-y-16">
        {/* Section 2: Como funciona */}
        <section className="space-y-6">
          <h2 className="text-2xl font-bold tracking-tight">Como funciona</h2>
          <div className="space-y-6">
            <StepItem
              number={1}
              icon={UserPlus}
              title="Te registras y creas tu negocio"
              description="Crea tu cuenta, ponle nombre a tu negocio y personaliza tu marca."
            />
            <StepItem
              number={2}
              icon={Layout}
              title="Creas un cotizador con pasos y campos"
              description="Arma tu formulario paso a paso con campos como texto, numeros, seleccion y mas."
            />
            <StepItem
              number={3}
              icon={Calculator}
              title="Defines reglas de precio con formulas"
              description="Escribe formulas que usan las respuestas del formulario para calcular el precio total."
            />
            <StepItem
              number={4}
              icon={Share2}
              title="Compartes el link publico"
              description="Cada cotizador tiene un link unico que puedes enviar a tus clientes o poner en tu web."
            />
            <StepItem
              number={5}
              icon={FormInput}
              title="Tu cliente llena el formulario y ve el precio en tiempo real"
              description="El cliente responde las preguntas y el precio se calcula automaticamente mientras avanza."
            />
            <StepItem
              number={6}
              icon={FileText}
              title="Recibe la propuesta PDF en su correo"
              description="Se genera un PDF profesional con el desglose de precios y se envia al email del cliente."
            />
            <StepItem
              number={7}
              icon={BarChart3}
              title="Tu ves todo en el historial y gestionas estados"
              description="Revisa todas las cotizaciones, cambia estados (pendiente, aceptada, rechazada) y da seguimiento."
            />
          </div>
        </section>

        <Separator />

        {/* Section 3: Crear con IA */}
        <section className="space-y-6">
          <div className="flex items-center gap-3">
            <h2 className="text-2xl font-bold tracking-tight">Crear con IA</h2>
            <Badge className="bg-gradient-to-r from-primary/15 to-[oklch(0.55_0.16_310/0.15)] text-primary border-primary/20">Nuevo</Badge>
          </div>
          <p className="text-muted-foreground leading-relaxed">
            Describe tu negocio en palabras y la inteligencia artificial genera todo
            automaticamente: pasos, campos, opciones y reglas de precio. Es la forma
            mas rapida de empezar.
          </p>
          <Card className="overflow-hidden shadow-sm transition-shadow duration-300 hover:shadow-md">
            <div className="h-0.5 bg-gradient-to-r from-primary to-[oklch(0.55_0.16_310)]" />
            <CardContent className="pt-6 space-y-4">
              <div className="space-y-2">
                <p className="text-sm font-medium">Tu escribes:</p>
                <div className="rounded-md bg-gradient-to-r from-primary/5 to-transparent px-4 py-3 border border-primary/10">
                  <p className="text-sm font-mono">
                    &quot;Soy fotografo, cobro por sesion, horas y edicion&quot;
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 text-primary">
                <Sparkles className="h-4 w-4" />
                <span className="text-sm font-medium">La IA genera automaticamente:</span>
              </div>
              <ul className="space-y-1.5 text-sm text-muted-foreground pl-4">
                <li className="flex items-center gap-2">
                  <span className="h-1 w-1 rounded-full bg-primary/50" />
                  Paso 1: Tipo de sesion (Retrato, Boda, Producto...)
                </li>
                <li className="flex items-center gap-2">
                  <span className="h-1 w-1 rounded-full bg-primary/50" />
                  Paso 2: Duracion en horas (slider 1-8)
                </li>
                <li className="flex items-center gap-2">
                  <span className="h-1 w-1 rounded-full bg-primary/50" />
                  Paso 3: Edicion (Basica, Profesional, Premium)
                </li>
                <li className="flex items-center gap-2">
                  <span className="h-1 w-1 rounded-full bg-primary/50" />
                  Reglas de precio en COP configuradas automaticamente
                </li>
              </ul>
            </CardContent>
          </Card>
          <p className="text-sm text-muted-foreground">
            Este es el diferenciador clave de Tikno: en segundos tienes un cotizador
            funcional listo para compartir con tus clientes.
          </p>
        </section>

        <Separator />

        {/* Section: Prompt perfecto para la IA */}
        <section className="space-y-6">
          <div className="flex items-center gap-3">
            <h2 className="text-2xl font-bold tracking-tight">Como escribir el prompt perfecto</h2>
            <Badge className="bg-gradient-to-r from-primary/15 to-[oklch(0.55_0.16_310/0.15)] text-primary border-primary/20">Guia</Badge>
          </div>
          <p className="text-muted-foreground leading-relaxed">
            La IA genera mejores cotizadores cuando le das informacion clara y estructurada.
            Sigue esta plantilla y obtendras un cotizador funcional al primer intento.
          </p>

          {/* Plantilla base */}
          <Card className="overflow-hidden shadow-sm border-primary/20">
            <div className="h-1 bg-gradient-to-r from-primary to-[oklch(0.55_0.16_310)]" />
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Lightbulb className="h-4 w-4 text-primary" />
                Plantilla base — copia y adapta
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="rounded-lg bg-gradient-to-br from-primary/5 via-background to-[oklch(0.55_0.16_310/0.03)] border border-primary/15 p-5">
                <p className="text-sm whitespace-pre-line leading-relaxed font-mono text-muted-foreground">
{`Soy [TU PROFESION] en [CIUDAD], Colombia.

MIS SERVICIOS Y PRECIOS:
- [Servicio 1]: $[PRECIO] COP
- [Servicio 2]: $[PRECIO] COP
- [Servicio 3]: $[PRECIO] COP

FACTORES QUE AFECTAN EL PRECIO:
- [Factor 1]: desde $[MIN] hasta $[MAX] segun [QUE]
- [Factor 2]: cada [UNIDAD] cuesta $[PRECIO]

EXTRAS OPCIONALES (el cliente elige varios):
- [Extra 1]: +$[PRECIO]
- [Extra 2]: +$[PRECIO]

COMO CALCULO EL PRECIO:
[Tu logica. Ej: "Precio base + extras + cantidad * costo unitario"]

MONEDA: COP`}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Ejemplos reales */}
          <div className="space-y-3">
            <h3 className="text-lg font-semibold">Ejemplos reales por tipo de negocio</h3>
            <p className="text-sm text-muted-foreground">
              Estos ejemplos generan cotizadores completos y funcionales al primer intento:
            </p>
          </div>

          <div className="space-y-4">
            <PromptExample
              title="Disenador Web"
              prompt={`Soy disenador web freelance en Bucaramanga, Colombia.

MIS SERVICIOS Y PRECIOS:
- Landing page (1 pagina): $800.000 COP
- Sitio web corporativo (hasta 5 paginas): $2.500.000 COP
- Tienda online con carrito: $4.000.000 COP
- Aplicacion web personalizada: $7.000.000 COP

FACTORES QUE AFECTAN EL PRECIO:
- Paginas adicionales: cada pagina extra cuesta $300.000
- Nivel de diseno: basico sin costo extra, premium +$500.000, ultra personalizado +$1.200.000

EXTRAS OPCIONALES:
- Logo profesional: +$400.000
- SEO basico: +$350.000
- Dominio y hosting 1 ano: +$250.000
- Mantenimiento 3 meses: +$600.000
- Integracion WhatsApp Business: +$150.000

COMO CALCULO EL PRECIO:
tipo_sitio + nivel_diseno + (paginas_extra * 300000) + extras

MONEDA: COP`}
            />

            <PromptExample
              title="Imprenta"
              prompt={`Soy dueno de una imprenta en Medellin, Colombia.

MIS SERVICIOS Y PRECIOS:
- Tarjetas de presentacion (100 und): $45.000 COP
- Volantes (100 und): $35.000 COP
- Brochures plegables (100 und): $85.000 COP
- Pendones banner (1 und): $65.000 COP

FACTORES QUE AFECTAN EL PRECIO:
- Cantidad: precio base por 100 und, se multiplica (200=x2, 500=x5)
- Tamano: estandar sin recargo, grande +30%, extragrande +60%

EXTRAS OPCIONALES:
- Plastificado UV: +$25.000
- Troquelado especial: +$35.000
- Diseno grafico: +$50.000
- Entrega express 24h: +$30.000

COMO CALCULO EL PRECIO:
(producto_base * factor_tamano * paquetes_cantidad) + extras

MONEDA: COP`}
            />

            <PromptExample
              title="Fotografo"
              prompt={`Soy fotografo profesional de eventos en Bogota, Colombia.

MIS SERVICIOS Y PRECIOS:
- Sesion retrato (1 hora): $250.000 COP
- Evento social (4 horas): $800.000 COP
- Matrimonio completo (8 horas): $2.500.000 COP
- Sesion de producto (10 productos): $400.000 COP

FACTORES QUE AFECTAN EL PRECIO:
- Horas adicionales: cada hora extra $150.000
- Locaciones: 1 incluida, cada adicional +$200.000

EXTRAS OPCIONALES:
- Video highlight 1-2 min: +$500.000
- Album impreso 30x30: +$350.000
- Drone aereo: +$300.000
- Segundo fotografo: +$400.000

COMO CALCULO EL PRECIO:
tipo_sesion + (horas_extra * 150000) + (locaciones_extra * 200000) + extras

MONEDA: COP`}
            />

            <PromptExample
              title="Taller Mecanico"
              prompt={`Tengo taller de mecanica automotriz en Barranquilla, Colombia.

MIS SERVICIOS Y PRECIOS:
- Cambio aceite y filtros: $120.000 COP
- Revision frenos completa: $180.000 COP
- Alineacion y balanceo: $80.000 COP
- Mantenimiento preventivo: $350.000 COP

FACTORES QUE AFECTAN EL PRECIO:
- Tipo vehiculo: carro particular sin recargo, camioneta +$50.000, pesado +$120.000

EXTRAS OPCIONALES:
- Lavado completo: +$40.000
- Aceite sintetico premium: +$60.000
- Servicio a domicilio: +$50.000

COMO CALCULO EL PRECIO:
servicio + recargo_vehiculo + extras

MONEDA: COP`}
            />

            <PromptExample
              title="Empresa de Mudanzas"
              prompt={`Empresa de mudanzas y trasteos en Cali, Colombia.

MIS SERVICIOS Y PRECIOS:
- Apartaestudio local: $350.000 COP
- Casa 1-2 habitaciones local: $600.000 COP
- Casa 3+ habitaciones local: $950.000 COP
- Mudanza entre ciudades: $1.800.000 COP

FACTORES QUE AFECTAN EL PRECIO:
- Pisos sin ascensor: cada piso +$50.000
- Distancia extra: cada 10km sobre 20km incluidos +$40.000

EXTRAS OPCIONALES:
- Embalaje profesional: +$200.000
- Seguro contra danos: +$150.000
- Desarmado y armado muebles: +$120.000
- Limpieza post-mudanza: +$100.000

COMO CALCULO EL PRECIO:
tipo_mudanza + (pisos * 50000) + (km_extra * 40000) + extras

MONEDA: COP`}
            />

            <PromptExample
              title="Empresa de Aseo"
              prompt={`Empresa de aseo y limpieza en Pereira, Colombia.

MIS SERVICIOS Y PRECIOS:
- Aseo basico apartamento (hasta 60m2): $80.000 COP
- Aseo profundo apartamento: $150.000 COP
- Aseo casa (hasta 120m2): $120.000 COP
- Aseo profundo casa: $220.000 COP
- Limpieza oficina comercial: $180.000 COP

FACTORES QUE AFECTAN EL PRECIO:
- Area adicional: cada 20m2 extra +$25.000

EXTRAS OPCIONALES:
- Vidrios exteriores: +$40.000
- Lavado tapetes: +$50.000
- Desinfeccion profunda: +$35.000
- Limpieza cocina industrial: +$60.000

COMO CALCULO EL PRECIO:
servicio_base + (area_extra * 25000) + extras

MONEDA: COP`}
            />
          </div>

          {/* Tips */}
          <div className="space-y-3">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Lightbulb className="h-4 w-4 text-primary" />
              Tips para mejores resultados
            </h3>
            <div className="grid gap-2 sm:grid-cols-2">
              <TipItem text="Da precios concretos en numeros, no digas 'variable' o 'depende'" />
              <TipItem text="Explica como calculas: si sumas, multiplicas o aplicas descuentos" />
              <TipItem text="Separa el precio base de los extras opcionales" />
              <TipItem text="Incluye al menos 3 servicios o productos para un cotizador completo" />
              <TipItem text="Menciona la moneda si no es COP" />
              <TipItem text="Piensa en que te pregunta siempre tu cliente cuando pide precio" />
            </div>
          </div>

          {/* Errores comunes */}
          <div className="space-y-3">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-red-500" />
              Errores comunes a evitar
            </h3>
            <div className="grid gap-2 sm:grid-cols-2">
              <MistakeItem
                bad="Hago paginas web"
                why="Muy vago. No tiene precios, tipos de servicio ni extras. La IA tiene que inventar todo."
              />
              <MistakeItem
                bad="Cobro segun el proyecto"
                why="Sin precios concretos la IA no puede crear formulas. Da al menos rangos."
              />
              <MistakeItem
                bad="Mis precios dependen de muchas cosas"
                why="Enumera esas cosas y ponle un precio a cada una."
              />
              <MistakeItem
                bad="Soy fotografo"
                why="No dice que tipos de sesion, ni precios, ni extras. Agrega toda la informacion."
              />
            </div>
          </div>
        </section>

        <Separator />

        {/* Section 4: Tipos de campos disponibles */}
        <section className="space-y-6">
          <h2 className="text-2xl font-bold tracking-tight">Tipos de campos disponibles</h2>
          <Card className="shadow-sm">
            <CardContent className="pt-6">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b text-left">
                      <th className="pb-3 pr-4 text-sm font-semibold">Tipo</th>
                      <th className="pb-3 pr-4 text-sm font-semibold">Descripcion</th>
                      <th className="pb-3 text-sm font-semibold">Ejemplo</th>
                    </tr>
                  </thead>
                  <tbody>
                    <FieldTypeRow
                      tipo="texto"
                      descripcion="Campo libre"
                      ejemplo="Nombre del proyecto"
                    />
                    <FieldTypeRow
                      tipo="numero"
                      descripcion="Solo numeros"
                      ejemplo="Cantidad de unidades"
                    />
                    <FieldTypeRow
                      tipo="seleccion"
                      descripcion="Opciones con precio"
                      ejemplo="Tipo: Landing ($1.9M), E-commerce ($4.9M)"
                    />
                    <FieldTypeRow
                      tipo="area_m2"
                      descripcion="Metros cuadrados"
                      ejemplo="Area a pintar"
                    />
                    <FieldTypeRow
                      tipo="slider"
                      descripcion="Barra deslizante"
                      ejemplo="Numero de paginas (1-20)"
                    />
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </section>

        <Separator />

        {/* Section 5: Como funcionan las reglas de precio */}
        <section className="space-y-6">
          <h2 className="text-2xl font-bold tracking-tight">
            Como funcionan las reglas de precio
          </h2>
          <p className="text-muted-foreground leading-relaxed">
            Las formulas usan los IDs de los campos como variables. Los operadores
            disponibles son <code className="rounded bg-primary/8 px-1.5 py-0.5 text-sm text-primary">+</code>{" "}
            <code className="rounded bg-primary/8 px-1.5 py-0.5 text-sm text-primary">*</code>{" "}
            <code className="rounded bg-primary/8 px-1.5 py-0.5 text-sm text-primary">-</code>{" "}
            <code className="rounded bg-primary/8 px-1.5 py-0.5 text-sm text-primary">/</code>{" "}
            <code className="rounded bg-primary/8 px-1.5 py-0.5 text-sm text-primary">()</code>.
            Cada regla calcula un subtotal y el sistema suma todas las reglas para obtener el total.
          </p>
          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle className="text-base">Ejemplo real: Veterinaria</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2 text-sm">
                <p className="font-medium">Paso 1: tipo_servicio</p>
                <p className="text-muted-foreground pl-4">
                  Seleccion: Consulta = $80.000, Cirugia = $250.000
                </p>
                <p className="font-medium">Paso 2: peso_mascota</p>
                <p className="text-muted-foreground pl-4">Slider de 1 a 80 kg</p>
              </div>
              <Separator />
              <div className="space-y-2 rounded-md bg-gradient-to-r from-primary/5 to-transparent px-4 py-3 font-mono text-sm border border-primary/10">
                <p>Regla 1: tipo_servicio * urgencia = 250.000 * 1.5 = $375.000</p>
                <p>Regla 2: peso_mascota * 2.000 = 25 * 2.000 = $50.000</p>
                <p className="font-bold pt-1 border-t border-primary/15 text-primary">
                  Total: $425.000 COP
                </p>
              </div>
            </CardContent>
          </Card>
        </section>

        <Separator />

        {/* Section 6: Ejemplos por industria */}
        <section className="space-y-6">
          <h2 className="text-2xl font-bold tracking-tight">Ejemplos por industria</h2>
          <p className="text-muted-foreground">
            Tikno se adapta a cualquier negocio que necesite cotizar. Aqui algunos ejemplos:
          </p>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <IndustryCard
              title="Agencia web"
              examples={[
                "Landing Page - $1.900.000",
                "E-commerce - $4.900.000",
                "App movil - $9.900.000",
              ]}
            />
            <IndustryCard
              title="Veterinaria"
              examples={[
                "Consulta - $80.000",
                "Vacunacion - $45.000",
                "Cirugia - $250.000",
              ]}
            />
            <IndustryCard
              title="Constructora"
              examples={[
                "m2 * precio_material * mano_obra",
                "Calculo dinamico por area",
                "Incluye acabados y extras",
              ]}
            />
            <IndustryCard
              title="Imprenta"
              examples={[
                "cantidad * precio_unitario + acabados",
                "Descuentos por volumen",
                "Tipos de papel y acabado",
              ]}
            />
            <IndustryCard
              title="Fotografo"
              examples={[
                "sesion_base + horas * tarifa + extras",
                "Edicion basica o premium",
                "Entrega digital o impresa",
              ]}
            />
          </div>
        </section>

        <Separator />

        {/* Section 7: El PDF generado */}
        <section className="space-y-6">
          <h2 className="text-2xl font-bold tracking-tight">El PDF generado</h2>
          <p className="text-muted-foreground leading-relaxed">
            Cada cotizacion genera un PDF profesional que se envia automaticamente al
            correo del cliente. El documento incluye:
          </p>
          <div className="grid gap-3 sm:grid-cols-2">
            {[
              { icon: Palette, text: "Logo y color primario de tu negocio" },
              { icon: ListChecks, text: "Desglose detallado de precios por regla" },
              { icon: Sparkles, text: "Descripcion generada por IA del servicio" },
              { icon: Mail, text: "Datos del cliente (nombre, email, empresa)" },
              { icon: FileText, text: "Condiciones y notas personalizadas" },
              { icon: Globe, text: "Link para ver la cotizacion online" },
            ].map(({ icon: Icon, text }, i) => (
              <div key={i} className="flex items-start gap-3 rounded-lg border border-primary/10 p-3 transition-all duration-200 hover:bg-primary/3 hover:border-primary/20 cursor-default">
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-primary/10">
                  <Icon className="h-3.5 w-3.5 text-primary" />
                </div>
                <span className="text-sm">{text}</span>
              </div>
            ))}
          </div>
        </section>

        <Separator />

        {/* Section 8: CTA */}
        <section className="relative overflow-hidden rounded-2xl py-12 text-center">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/8 via-transparent to-[oklch(0.55_0.16_310/0.08)] rounded-2xl" />
          <div className="relative space-y-6">
            <h2 className="text-2xl font-bold tracking-tight">
              Listo para automatizar tus cotizaciones?
            </h2>
            <p className="text-muted-foreground max-w-lg mx-auto">
              Crea tu cuenta gratis y ten tu primer cotizador funcionando en minutos.
            </p>
            <div className="flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
              <Link href="/registro">
                <Button size="lg" className="cursor-pointer gap-2 bg-gradient-to-r from-primary to-[oklch(0.55_0.16_310)] text-white shadow-lg shadow-primary/25 transition-all duration-200 hover:shadow-xl hover:shadow-primary/35 hover:brightness-110 animate-pulse-glow">
                  Empieza gratis
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>
            <p className="text-sm text-muted-foreground">
              Ya tienes cuenta?{" "}
              <Link
                href="/login"
                className="cursor-pointer font-medium text-primary transition-colors hover:underline"
              >
                Iniciar sesion
              </Link>
            </p>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t py-6">
        <div className="mx-auto max-w-4xl px-4 text-center text-sm text-muted-foreground">
          <span className="bg-gradient-to-r from-primary to-[oklch(0.55_0.16_310)] bg-clip-text font-semibold text-transparent">Tikno</span>{" "}
          &mdash; tikno.pro
        </div>
      </footer>
    </div>
  )
}
