"use client"

import { useEffect, useState } from "react"
import { Save, Loader2 } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Skeleton } from "@/components/ui/skeleton"

import { usePerfil, useActualizarNegocio } from "@/hooks/use-perfil"
import { LogoUpload } from "@/components/configuracion/LogoUpload"

export default function ConfiguracionPage() {
  const { data: perfil, isLoading } = usePerfil()
  const actualizarNegocio = useActualizarNegocio()

  const [nombre, setNombre] = useState("")
  const [colorPrimario, setColorPrimario] = useState("#000000")
  const [telefono, setTelefono] = useState("")
  const [sitioWeb, setSitioWeb] = useState("")
  const [logoUrl, setLogoUrl] = useState("")

  useEffect(() => {
    if (perfil?.negocio) {
      setNombre(perfil.negocio.nombre)
      setColorPrimario(perfil.negocio.color_primario || "#000000")
      setTelefono(perfil.negocio.telefono || "")
      setSitioWeb(perfil.negocio.sitio_web || "")
      setLogoUrl(perfil.negocio.logo_url || "")
    }
  }, [perfil])

  function handleGuardar() {
    actualizarNegocio.mutate(
      {
        nombre,
        color_primario: colorPrimario,
        telefono,
        sitio_web: sitioWeb,
        logo_url: logoUrl,
      },
      {
        onSuccess: () => toast.success("Configuracion guardada"),
        onError: () => toast.error("Error al guardar"),
      }
    )
  }

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-[300px] w-full" />
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Configuracion</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Personaliza tu negocio y cuenta
          </p>
        </div>
        <Button
          onClick={handleGuardar}
          disabled={actualizarNegocio.isPending}
          className="gap-2"
        >
          {actualizarNegocio.isPending ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Save className="h-4 w-4" />
          )}
          Guardar
        </Button>
      </div>

      {/* Mi negocio */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Mi negocio</CardTitle>
          <CardDescription>
            Esta informacion aparece en las cotizaciones y el PDF
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="nombre-negocio">Nombre del negocio</Label>
              <Input
                id="nombre-negocio"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="telefono">Telefono</Label>
              <Input
                id="telefono"
                value={telefono}
                onChange={(e) => setTelefono(e.target.value)}
                placeholder="+57 300 000 0000"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="sitio-web">Sitio web</Label>
              <Input
                id="sitio-web"
                value={sitioWeb}
                onChange={(e) => setSitioWeb(e.target.value)}
                placeholder="https://tikno.pro"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="color-primario">Color primario</Label>
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  id="color-primario"
                  value={colorPrimario}
                  onChange={(e) => setColorPrimario(e.target.value)}
                  className="h-9 w-12 cursor-pointer rounded border bg-transparent"
                />
                <Input
                  value={colorPrimario}
                  onChange={(e) => setColorPrimario(e.target.value)}
                  className="w-28 font-mono text-sm"
                  maxLength={7}
                />
              </div>
            </div>
          </div>

          <Separator />

          <div>
            <Label>Logo del negocio</Label>
            <p className="mb-3 text-xs text-muted-foreground">
              Aparece en el header del PDF y el formulario publico
            </p>
            <LogoUpload currentUrl={logoUrl} onUploaded={setLogoUrl} />
          </div>

          <Separator />

          {/* Preview del PDF */}
          <div>
            <Label>Vista previa del PDF</Label>
            <div
              className="mt-3 rounded-lg border p-6"
              style={{ borderTopColor: colorPrimario, borderTopWidth: 3 }}
            >
              <div className="flex items-center justify-between">
                <div>
                  {logoUrl ? (
                    <img src={logoUrl} alt={nombre} className="h-8 object-contain" />
                  ) : (
                    <p className="text-lg font-semibold" style={{ color: colorPrimario }}>
                      {nombre || "Mi Negocio"}
                    </p>
                  )}
                </div>
                <div className="text-right">
                  <p className="text-lg font-semibold" style={{ color: colorPrimario }}>
                    Propuesta Comercial
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {new Date().toLocaleDateString("es-CO")}
                  </p>
                </div>
              </div>
              <div className="mt-4 h-px" style={{ backgroundColor: colorPrimario }} />
              <div className="mt-4 grid grid-cols-2 gap-4">
                <div className="space-y-1 text-xs text-muted-foreground">
                  <p>Nombre: Juan Perez</p>
                  <p>Email: juan@email.com</p>
                </div>
                <div className="space-y-1 text-right text-xs text-muted-foreground">
                  <p>Servicio: Desarrollo Web</p>
                  <p className="font-bold text-foreground">Total: $3.500.000 COP</p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Cuenta */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Cuenta</CardTitle>
          <CardDescription>Informacion de tu cuenta de usuario</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Email</Label>
            <Input value={perfil?.email || ""} disabled className="bg-muted" />
            <p className="text-xs text-muted-foreground">
              El email no se puede cambiar
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
