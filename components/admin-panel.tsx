"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Trash2, Plus, X, Upload } from "lucide-react"
import Image from "next/image"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"

interface OutlineDrawing {
  id: string
  name: string
  svgData?: string
  imageUrl?: string
}

interface AdminPanelProps {
  isOpen: boolean
  onClose: () => void
  outlines: OutlineDrawing[]
  onAddOutline: (outline: OutlineDrawing) => void
  onDeleteOutline: (id: string) => void
}

export default function AdminPanel({ isOpen, onClose, outlines, onAddOutline, onDeleteOutline }: AdminPanelProps) {
  const [showAddForm, setShowAddForm] = useState(false)
  const [newOutlineName, setNewOutlineName] = useState("")
  const [newOutlineSvg, setNewOutlineSvg] = useState("")
  const [error, setError] = useState("")
  const [activeTab, setActiveTab] = useState("svg")
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Update the handleAddOutline function to properly handle image uploads
  const handleAddOutline = () => {
    if (!newOutlineName.trim()) {
      setError("Por favor, adicione um nome para a imagem.")
      return
    }

    if (activeTab === "svg") {
      if (!newOutlineSvg.trim()) {
        setError("Por favor, adicione o código SVG.")
        return
      }

      // Validate SVG data
      if (!newOutlineSvg.includes("<svg") || !newOutlineSvg.includes("</svg>")) {
        setError("O código SVG parece inválido. Verifique se é um SVG completo.")
        return
      }

      // Create a new outline with a unique ID
      const newId = `custom-${Date.now()}`
      onAddOutline({
        id: newId,
        name: newOutlineName,
        svgData: newOutlineSvg,
      })
    } else if (activeTab === "image") {
      if (!imagePreview) {
        setError("Por favor, faça upload de uma imagem.")
        return
      }

      // Create a new outline with the image URL
      const newId = `image-${Date.now()}`
      onAddOutline({
        id: newId,
        name: newOutlineName,
        imageUrl: imagePreview,
      })
    }

    // Reset form
    setNewOutlineName("")
    setNewOutlineSvg("")
    setImagePreview(null)
    setShowAddForm(false)
    setError("")
  }

  // Fix the file input handling to ensure images load properly
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Check if file is an image
    if (!file.type.startsWith("image/")) {
      setError("Por favor, selecione apenas arquivos de imagem (JPG, PNG, etc).")
      return
    }

    // Create a preview URL
    const reader = new FileReader()
    reader.onload = (event) => {
      if (event.target?.result) {
        setImagePreview(event.target.result as string)
        setError("")
      }
    }
    reader.readAsDataURL(file)
  }

  const triggerFileInput = () => {
    fileInputRef.current?.click()
  }

  // Update the handleClose function to properly reset state
  const handleClose = () => {
    // Reset form state when closing
    setShowAddForm(false)
    setNewOutlineName("")
    setNewOutlineSvg("")
    setImagePreview(null)
    setError("")
    setActiveTab("svg")
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[80%] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Painel Administrativo</DialogTitle>
          <DialogDescription>Gerencie as imagens disponíveis para as crianças pintarem.</DialogDescription>
        </DialogHeader>

        <div className="flex justify-end mb-4">
          <Button onClick={() => setShowAddForm(true)}>
            <Plus className="mr-2 h-4 w-4" /> Adicionar Nova Imagem
          </Button>
        </div>

        {showAddForm && (
          <Card className="mb-6 p-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium">Adicionar Nova Imagem</h3>
              <Button variant="ghost" size="icon" onClick={() => setShowAddForm(false)}>
                <X className="h-4 w-4" />
              </Button>
            </div>
            {error && <p className="text-sm font-medium text-destructive mb-4">{error}</p>}

            <div className="space-y-4">
              <div className="grid w-full items-center gap-1.5">
                <Label htmlFor="name">Nome da Imagem</Label>
                <Input
                  id="name"
                  value={newOutlineName}
                  onChange={(e) => setNewOutlineName(e.target.value)}
                  placeholder="Ex: Flor"
                />
              </div>

              <Tabs defaultValue="svg" value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="svg">Código SVG</TabsTrigger>
                  <TabsTrigger value="image">Imagem (PNG/JPG)</TabsTrigger>
                </TabsList>

                <TabsContent value="svg" className="mt-4">
                  <div className="grid w-full items-center gap-1.5">
                    <Label htmlFor="svg">Código SVG</Label>
                    <Textarea
                      id="svg"
                      value={newOutlineSvg}
                      onChange={(e) => setNewOutlineSvg(e.target.value)}
                      placeholder="Cole o código SVG aqui..."
                      className="min-h-[200px] font-mono text-sm"
                    />
                  </div>
                </TabsContent>

                <TabsContent value="image" className="mt-4">
                  <div className="grid w-full items-center gap-4">
                    <input
                      type="file"
                      ref={fileInputRef}
                      className="hidden"
                      accept="image/*"
                      onChange={handleFileChange}
                    />

                    <Button type="button" onClick={triggerFileInput} className="w-full">
                      <Upload className="mr-2 h-4 w-4" /> Selecionar Imagem
                    </Button>

                    {imagePreview && (
                      <div className="relative w-full h-[200px] border rounded-md overflow-hidden">
                        <Image src={imagePreview || "/placeholder.svg"} alt="Preview" fill className="object-contain" />
                      </div>
                    )}
                  </div>
                </TabsContent>
              </Tabs>

              <Button onClick={handleAddOutline}>Adicionar Imagem</Button>
            </div>
          </Card>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {outlines.map((outline) => (
            <Card key={outline.id} className="overflow-hidden">
              <CardContent className="p-4">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-medium">{outline.name}</h3>
                  <Button
                    variant="destructive"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => onDeleteOutline(outline.id)}
                    disabled={outlines.length <= 1}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
                <div className="bg-white rounded-md p-2 h-40 flex items-center justify-center">
                  {outline.svgData ? (
                    <div dangerouslySetInnerHTML={{ __html: outline.svgData }} className="w-full h-full" />
                  ) : outline.imageUrl ? (
                    <div className="relative w-full h-full">
                      <Image
                        src={outline.imageUrl || "/placeholder.svg"}
                        alt={outline.name}
                        fill
                        className="object-contain"
                      />
                    </div>
                  ) : (
                    <div className="text-center text-muted-foreground">Sem imagem</div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  )
}

