"use client"

import { useCallback, useRef, useState } from "react"
import { Upload, X, Loader2 } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { supabase } from "@/lib/supabase"

interface Props {
  currentUrl: string
  onUploaded: (url: string) => void
}

export function LogoUpload({ currentUrl, onUploaded }: Props) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [preview, setPreview] = useState(currentUrl)
  const [uploading, setUploading] = useState(false)
  const [dragOver, setDragOver] = useState(false)

  const handleFile = useCallback(
    async (file: File) => {
      if (!file.type.startsWith("image/")) {
        toast.error("Solo se permiten imagenes")
        return
      }
      if (file.size > 2 * 1024 * 1024) {
        toast.error("El archivo no puede superar 2MB")
        return
      }

      const objectUrl = URL.createObjectURL(file)
      setPreview(objectUrl)
      setUploading(true)

      try {
        const ext = file.name.split(".").pop() || "png"
        const fileName = `negocios/logos/${Date.now()}.${ext}`

        const { data, error } = await supabase.storage
          .from("media")
          .upload(fileName, file, { upsert: true })

        if (error) throw error

        const { data: urlData } = supabase.storage
          .from("media")
          .getPublicUrl(data.path)

        const publicUrl = urlData.publicUrl
        setPreview(publicUrl)
        onUploaded(publicUrl)
        toast.success("Logo subido correctamente")
      } catch (err: any) {
        toast.error(err?.message || "Error al subir el logo")
        setPreview(currentUrl)
      } finally {
        setUploading(false)
      }
    },
    [currentUrl, onUploaded]
  )

  function onDrop(e: React.DragEvent) {
    e.preventDefault()
    setDragOver(false)
    const file = e.dataTransfer.files[0]
    if (file) handleFile(file)
  }

  function onInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (file) handleFile(file)
  }

  function remover() {
    setPreview("")
    onUploaded("")
    if (inputRef.current) inputRef.current.value = ""
  }

  return (
    <div>
      {preview ? (
        <div className="relative inline-block">
          <img
            src={preview}
            alt="Logo"
            className="h-20 rounded-lg border object-contain p-2"
          />
          <Button
            variant="destructive"
            size="icon-xs"
            className="absolute -right-2 -top-2"
            onClick={remover}
            disabled={uploading}
          >
            <X className="h-3 w-3" />
          </Button>
          {uploading && (
            <div className="absolute inset-0 flex items-center justify-center rounded-lg bg-background/80">
              <Loader2 className="h-5 w-5 animate-spin" />
            </div>
          )}
        </div>
      ) : (
        <div
          onDrop={onDrop}
          onDragOver={(e) => {
            e.preventDefault()
            setDragOver(true)
          }}
          onDragLeave={() => setDragOver(false)}
          onClick={() => inputRef.current?.click()}
          className={`flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed px-6 py-8 transition-colors ${
            dragOver ? "border-primary bg-primary/5" : "border-muted-foreground/25 hover:border-muted-foreground/50"
          }`}
        >
          <Upload className="mb-2 h-6 w-6 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">
            Arrastra tu logo o <span className="font-medium text-primary">selecciona</span>
          </p>
          <p className="mt-1 text-xs text-muted-foreground">PNG, JPG o SVG hasta 2MB</p>
        </div>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        onChange={onInputChange}
        className="hidden"
      />
    </div>
  )
}
