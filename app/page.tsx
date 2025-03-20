"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
// Corrigir o ícone da ferramenta de linha (substituir Square por um ícone apropriado)
// Importar o ícone de linha
import { Paintbrush, Eraser, Trash2, Droplet, Circle, Square, Minus } from "lucide-react"
import ImageThumbnail from "@/components/image-thumbnail"
import LoginModal from "@/components/login-modal"
import AdminPanel from "@/components/admin-panel"

export default function DrawingApp() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [context, setContext] = useState<CanvasRenderingContext2D | null>(null)
  const [isDrawing, setIsDrawing] = useState(false)
  // Modificar o tipo de ferramenta para incluir "circle" e "square"
  const [tool, setTool] = useState<"brush" | "eraser" | "fill" | "circle" | "square" | "line">("brush")
  const [color, setColor] = useState("#FF0000") // Red as default
  const [selectedOutline, setSelectedOutline] = useState<string | null>(null)
  const [brushSize, setBrushSize] = useState(5)
  const [eraserSize, setEraserSize] = useState(50) // 10x larger eraser
  const [isLoading, setIsLoading] = useState(false)
  const [lastAudio, setLastAudio] = useState<{ text: string; timestamp: number }>({ text: "", timestamp: 0 })

  // Adicionar estado para armazenar o ponto inicial do desenho de formas
  const [startPoint, setStartPoint] = useState<{ x: number; y: number } | null>(null)
  // Adicionar estado para controlar o popup de espessura do pincel
  const [showBrushSizes, setShowBrushSizes] = useState(false)
  const [brushSizeTimer, setBrushSizeTimer] = useState<NodeJS.Timeout | null>(null)
  // Adicionar estado para armazenar a imagem do canvas antes de começar a desenhar formas
  const [canvasSnapshot, setCanvasSnapshot] = useState<ImageData | null>(null)

  // Admin panel states
  const [showLoginModal, setShowLoginModal] = useState(false)
  const [showAdminPanel, setShowAdminPanel] = useState(false)
  const [adminButtonPressTimer, setAdminButtonPressTimer] = useState<NodeJS.Timeout | null>(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  // State for managing outlines
  const [outlines, setOutlines] = useState([
    {
      id: "sun",
      name: "Sol",
      svgData: `<svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
        <!-- Sun circle -->
        <circle fill="none" stroke="black" strokeWidth="2" cx="100" cy="100" r="40" />
        <!-- Sun rays -->
        <path fill="none" stroke="black" strokeWidth="2" d="M100,40 L100,20" />
        <path fill="none" stroke="black" strokeWidth="2" d="M100,180 L100,160" />
        <path fill="none" stroke="black" strokeWidth="2" d="M40,100 L20,100" />
        <path fill="none" stroke="black" strokeWidth="2" d="M180,100 L160,100" />
        <path fill="none" stroke="black" strokeWidth="2" d="M60,60 L45,45" />
        <path fill="none" stroke="black" strokeWidth="2" d="M140,60 L155,45" />
        <path fill="none" stroke="black" strokeWidth="2" d="M60,140 L45,155" />
        <path fill="none" stroke="black" strokeWidth="2" d="M140,140 L155,155" />
        <!-- Sun face -->
        <circle fill="none" stroke="black" strokeWidth="2" cx="85" cy="90" r="5" />
        <circle fill="none" stroke="black" strokeWidth="2" cx="115" cy="90" r="5" />
        <path fill="none" stroke="black" strokeWidth="2" d="M80,115 Q100,130 120,115" />
      </svg>`,
    },
    {
      id: "house",
      name: "Casa",
      svgData: `<svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
        <!-- House base -->
        <rect fill="none" stroke="black" strokeWidth="2" x="40" y="80" width="120" height="100" />
        <!-- Roof -->
        <path fill="none" stroke="black" strokeWidth="2" d="M30,80 L100,20 L170,80" />
        <!-- Door -->
        <rect fill="none" stroke="black" strokeWidth="2" x="85" y="130" width="30" height="50" />
        <circle fill="none" stroke="black" strokeWidth="2" cx="105" cy="155" r="3" />
        <!-- Windows -->
        <rect fill="none" stroke="black" strokeWidth="2" x="55" y="100" width="25" height="25" />
        <path fill="none" stroke="black" strokeWidth="2" d="M55,112.5 L80,112.5" />
        <path fill="none" stroke="black" strokeWidth="2" d="M67.5,100 L67.5,125" />
        <!-- Second window -->
        <rect fill="none" stroke="black" strokeWidth="2" x="120" y="100" width="25" height="25" />
        <path fill="none" stroke="black" strokeWidth="2" d="M120,112.5 L145,112.5" />
        <path fill="none" stroke="black" strokeWidth="2" d="M132.5,100 L132.5,125" />
        <!-- Chimney -->
        <path fill="none" stroke="black" strokeWidth="2" d="M130,50 L130,20 L150,20 L150,60" />
      </svg>`,
    },
    {
      id: "car",
      name: "Carro",
      svgData: `<svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
        <!-- Car body -->
        <path fill="none" stroke="black" strokeWidth="2" d="M30,120 L30,140 L170,140 L170,120 L140,90 L60,90 L30,120 Z" />
        <!-- Windows -->
        <path fill="none" stroke="black" strokeWidth="2" d="M60,90 L70,70 L130,70 L140,90" />
        <path fill="none" stroke="black" strokeWidth="2" d="M80,90 L85,70" />
        <path fill="none" stroke="black" strokeWidth="2" d="M120,90 L115,70" />
        <!-- Wheels -->
        <circle fill="none" stroke="black" strokeWidth="2" cx="60" cy="140" r="15" />
        <circle fill="none" stroke="black" strokeWidth="2" cx="140" cy="140" r="15" />
        <!-- Headlights -->
        <rect fill="none" stroke="black" strokeWidth="2" x="35" y="110" width="10" height="10" />
        <rect fill="none" stroke="black" strokeWidth="2" x="155" y="110" width="10" height="10" />
        <!-- Door -->
        <path fill="none" stroke="black" strokeWidth="2" d="M85,90 L85,130" />
        <circle fill="none" stroke="black" strokeWidth="2" cx="95" cy="110" r="3" />
      </svg>`,
    },
    {
      id: "butterfly",
      name: "Borboleta",
      svgData: `<svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
        <!-- Body -->
        <path fill="none" stroke="black" strokeWidth="2" d="M100,50 L100,150" />
        <!-- Antennae -->
        <path fill="none" stroke="black" strokeWidth="2" d="M100,50 L85,30" />
        <path fill="none" stroke="black" strokeWidth="2" d="M100,50 L115,30" />
        <!-- Wings -->
        <path fill="none" stroke="black" strokeWidth="2" d="M100,70 C60,40 40,70 50,100 C40,130 60,160 100,130" />
        <path fill="none" stroke="black" strokeWidth="2" d="M100,70 C140,40 160,70 150,100 C160,130 140,160 100,130" />
        <!-- Wing patterns -->
        <circle fill="none" stroke="black" strokeWidth="2" cx="75" cy="85" r="10" />
        <circle fill="none" stroke="black" strokeWidth="2" cx="125" cy="85" r="10" />
        <circle fill="none" stroke="black" strokeWidth="2" cx="75" cy="115" r="8" />
        <circle fill="none" stroke="black" strokeWidth="2" cx="125" cy="115" r="8" />
      </svg>`,
    },
    {
      id: "tree",
      name: "Árvore",
      svgData: `<svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
        <!-- Tree trunk -->
        <rect fill="none" stroke="black" strokeWidth="2" x="85" y="120" width="30" height="60" />
        <!-- Tree foliage -->
        <ellipse fill="none" stroke="black" strokeWidth="2" cx="100" cy="50" rx="40" ry="30" />
        <ellipse fill="none" stroke="black" strokeWidth="2" cx="70" cy="80" rx="30" ry="25" />
        <ellipse fill="none" stroke="black" strokeWidth="2" cx="130" cy="80" rx="30" ry="25" />
        <ellipse fill="none" stroke="black" strokeWidth="2" cx="100" cy="100" rx="45" ry="30" />
      </svg>`,
    },
  ])

  // Expanded color palette with more options
  const colors = [
    { color: "#FF0000", name: "Vermelho" },
    { color: "#0000FF", name: "Azul" },
    { color: "#FFFF00", name: "Amarelo" },
    { color: "#00FF00", name: "Verde" },
    { color: "#FFA500", name: "Laranja" },
    { color: "#800080", name: "Roxo" },
    { color: "#FF69B4", name: "Rosa" },
    { color: "#00FFFF", name: "Ciano" },
    { color: "#8B4513", name: "Marrom" },
    { color: "#000000", name: "Preto" },
    { color: "#FFFFFF", name: "Branco" },
    { color: "#808080", name: "Cinza" },
  ]

  // Função para reproduzir áudio
  const playAudio = (text: string) => {
    // Verifica se o mesmo áudio foi tocado nos últimos 500ms para evitar repetições
    const now = Date.now()
    if (lastAudio.text === text && now - lastAudio.timestamp < 500) {
      return
    }

    // Atualiza o último áudio tocado
    setLastAudio({ text, timestamp: now })

    if ("speechSynthesis" in window) {
      // Cancela qualquer áudio em reprodução
      window.speechSynthesis.cancel()

      // Cria e reproduz o novo áudio
      const utterance = new SpeechSynthesisUtterance(text)
      utterance.lang = "pt-BR" // Define o idioma para português brasileiro
      speechSynthesis.speak(utterance)
    }
  }

  // Initialize canvas
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    // Set canvas dimensions to match parent container
    const resizeCanvas = () => {
      const container = canvas.parentElement
      if (container) {
        // Importante: definir o tamanho do canvas em pixels, não em CSS
        canvas.width = container.clientWidth
        canvas.height = container.clientHeight
      }
    }

    resizeCanvas()
    window.addEventListener("resize", resizeCanvas)

    const ctx = canvas.getContext("2d")
    if (ctx) {
      ctx.lineCap = "round"
      ctx.lineJoin = "round"
      ctx.lineWidth = brushSize
      setContext(ctx)
    }

    return () => {
      window.removeEventListener("resize", resizeCanvas)
    }
  }, [brushSize])

  // Add this useEffect to ensure the sun image is loaded on initial render
  useEffect(() => {
    // Wait for the canvas to be initialized
    if (context && canvasRef.current) {
      // Load the sun image by default when the app starts
      const sunOutline = outlines.find((o) => o.id === "sun")
      if (sunOutline && sunOutline.svgData) {
        // Set a small delay to ensure the canvas is fully ready
        setTimeout(() => {
          renderSVGDirectly(sunOutline.svgData)
          setSelectedOutline("sun")
          // Also speak the name of the initial drawing
          playAudio(sunOutline.name)
        }, 800) // Slightly longer delay to ensure canvas is ready
      }
    }
  }, [context])

  // Admin button press handlers
  const handleAdminButtonPress = () => {
    const timer = setTimeout(() => {
      setShowLoginModal(true)
    }, 2000) // 2 seconds press to show login modal

    setAdminButtonPressTimer(timer)
  }

  const handleAdminButtonRelease = () => {
    if (adminButtonPressTimer) {
      clearTimeout(adminButtonPressTimer)
      setAdminButtonPressTimer(null)
    }
  }

  // Handle login result
  const handleLoginResult = (success: boolean) => {
    setIsAuthenticated(success)
    if (success) {
      setShowAdminPanel(true)
    }
  }

  // Admin panel handlers
  const handleAddOutline = (newOutline: (typeof outlines)[0]) => {
    setOutlines([...outlines, newOutline])
  }

  const handleDeleteOutline = (id: string) => {
    // Don't allow deleting if there's only one outline left
    if (outlines.length <= 1) {
      return
    }

    setOutlines(outlines.filter((outline) => outline.id !== id))

    // If the deleted outline was selected, select another one
    if (selectedOutline === id) {
      const firstOutline = outlines.find((o) => o.id !== id)
      if (firstOutline) {
        setSelectedOutline(firstOutline.id)
        if (firstOutline.svgData) {
          renderSVGDirectly(firstOutline.svgData)
        } else if (firstOutline.imageUrl) {
          loadImageToCanvas(firstOutline.imageUrl)
        }
      }
    }
  }

  // Função auxiliar para obter as coordenadas precisas do toque/clique
  const getCoordinates = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current
    if (!canvas) return { x: 0, y: 0 }

    const rect = canvas.getBoundingClientRect()

    // Calcular a escala do canvas (caso o tamanho CSS seja diferente do tamanho real)
    const scaleX = canvas.width / rect.width
    const scaleY = canvas.height / rect.height

    if ("touches" in e) {
      // Evento de toque
      const x = (e.touches[0].clientX - rect.left) * scaleX
      const y = (e.touches[0].clientY - rect.top) * scaleY
      return { x, y }
    } else {
      // Evento de mouse
      const x = (e.clientX - rect.left) * scaleX
      const y = (e.clientY - rect.top) * scaleY
      return { x, y }
    }
  }

  // Adicionar a função de preenchimento (flood fill)
  const floodFill = (startX: number, startY: number, fillColor: string) => {
    if (!context || !canvasRef.current) return

    const canvas = canvasRef.current
    const ctx = context

    // Obter os dados da imagem
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
    const data = imageData.data
    const width = imageData.width
    const height = imageData.height

    // Converter as coordenadas para inteiros
    startX = Math.floor(startX)
    startY = Math.floor(startY)

    // Obter a cor do pixel inicial (RGBA)
    const startPos = (startY * width + startX) * 4
    const startR = data[startPos]
    const startG = data[startPos + 1]
    const startB = data[startPos + 2]
    const startA = data[startPos + 3]

    // Se o pixel já tem a cor de preenchimento, não fazer nada
    const fillRGB = hexToRgb(fillColor)
    if (!fillRGB) return

    if (startR === fillRGB.r && startG === fillRGB.g && startB === fillRGB.b) {
      return
    }

    // Função para verificar se um pixel tem a mesma cor do pixel inicial
    const isSameColor = (pos: number) => {
      // Tolerância para comparação de cores
      const tolerance = 10
      return (
        Math.abs(data[pos] - startR) <= tolerance &&
        Math.abs(data[pos + 1] - startG) <= tolerance &&
        Math.abs(data[pos + 2] - startB) <= tolerance &&
        Math.abs(data[pos + 3] - startA) <= tolerance
      )
    }

    // Função para definir a cor de um pixel
    const setColor = (pos: number) => {
      data[pos] = fillRGB.r
      data[pos + 1] = fillRGB.g
      data[pos + 2] = fillRGB.b
      data[pos + 3] = 255 // Opacidade total
    }

    // Algoritmo de preenchimento (flood fill)
    const stack: [number, number][] = [[startX, startY]]
    const visited = new Set<string>()

    while (stack.length > 0) {
      const [x, y] = stack.pop()!
      const key = `${x},${y}`

      if (x < 0 || x >= width || y < 0 || y >= height || visited.has(key)) {
        continue
      }

      const pos = (y * width + x) * 4

      if (!isSameColor(pos)) {
        continue
      }

      setColor(pos)
      visited.add(key)

      // Adicionar os pixels vizinhos à pilha
      stack.push([x + 1, y])
      stack.push([x - 1, y])
      stack.push([x, y + 1])
      stack.push([x, y - 1])
    }

    // Atualizar a imagem no canvas
    ctx.putImageData(imageData, 0, 0)
  }

  // Função auxiliar para converter hex para RGB
  const hexToRgb = (hex: string) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
    return result
      ? {
          r: Number.parseInt(result[1], 16),
          g: Number.parseInt(result[2], 16),
          b: Number.parseInt(result[3], 16),
        }
      : null
  }

  // Função para desenhar um círculo
  const drawCircle = (startX: number, startY: number, endX: number, endY: number) => {
    if (!context || !canvasRef.current) return

    // Calcular o raio com base na distância entre os pontos
    const radius = Math.sqrt(Math.pow(endX - startX, 2) + Math.pow(endY - startY, 2))

    // Desenhar o círculo
    context.beginPath()
    context.arc(startX, startY, radius, 0, Math.PI * 2)
    context.stroke()
  }

  // Função para desenhar um quadrado
  const drawSquare = (startX: number, startY: number, endX: number, endY: number) => {
    if (!context || !canvasRef.current) return

    // Calcular o tamanho do quadrado (usar o maior lado para garantir um quadrado perfeito)
    const size = Math.max(Math.abs(endX - startX), Math.abs(endY - startY))

    // Determinar a direção (para manter o ponto inicial como referência)
    const dirX = endX >= startX ? 1 : -1
    const dirY = endY >= startY ? 1 : -1

    // Desenhar o quadrado
    context.beginPath()
    context.rect(startX, startY, size * dirX, size * dirY)
    context.stroke()
  }

  // Modificar a função handleToolSelect para incluir a linha
  const handleToolSelect = (selectedTool: "brush" | "eraser" | "fill" | "circle" | "square" | "line") => {
    setTool(selectedTool)
    setShowBrushSizes(false) // Esconder o popup de espessuras ao trocar de ferramenta

    // Play audio feedback based on the selected tool
    if (selectedTool === "brush") {
      playAudio("Pincel")
    } else if (selectedTool === "eraser") {
      playAudio("Borracha")
    } else if (selectedTool === "fill") {
      playAudio("Balde de tinta")
    } else if (selectedTool === "circle") {
      playAudio("Círculo")
    } else if (selectedTool === "square") {
      playAudio("Quadrado")
    } else if (selectedTool === "line") {
      playAudio("Linha")
    }
  }

  // Adicionar função para lidar com o pressionar longo no botão do pincel
  const handleBrushPress = () => {
    const timer = setTimeout(() => {
      setShowBrushSizes(true)
    }, 1000) // 1 segundo de pressão para mostrar as opções

    setBrushSizeTimer(timer)
  }

  // Adicionar função para lidar com a liberação do botão do pincel
  const handleBrushRelease = () => {
    if (brushSizeTimer) {
      clearTimeout(brushSizeTimer)
      setBrushSizeTimer(null)
    }

    // Se não estiver mostrando as opções de tamanho, selecione a ferramenta
    if (!showBrushSizes) {
      handleToolSelect("brush")
    }
  }

  // Adicionar função para selecionar o tamanho do pincel
  const handleBrushSizeSelect = (size: number) => {
    setBrushSize(size)
    setShowBrushSizes(false)
    handleToolSelect("brush")
    playAudio(`Pincel tamanho ${size}`)
  }

  // Modificar o estado para ter uma espessura global
  const [lineWidth, setLineWidth] = useState(5) // Espessura global para todas as ferramentas
  const [showThicknessOptions, setShowThicknessOptions] = useState(false)

  // Modificar a função handleBrushSizeSelect para aplicar a todas as ferramentas
  const handleThicknessSelect = (size: number) => {
    setLineWidth(size)
    setShowThicknessOptions(false)

    // Atualizar o contexto com a nova espessura
    if (context) {
      context.lineWidth = size
    }

    playAudio(`Espessura ${size}`)
  }

  // Modificar a função startDrawing para incluir a linha
  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!context || !canvasRef.current) return

    const { x, y } = getCoordinates(e)

    // Se a ferramenta for o balde de tinta, preencher a área
    if (tool === "fill") {
      floodFill(x, y, color)
      return
    }

    // Se for círculo, quadrado ou linha, salvar o ponto inicial e o estado atual do canvas
    if (tool === "circle" || tool === "square" || tool === "line") {
      setStartPoint({ x, y })

      // Salvar o estado atual do canvas
      const canvas = canvasRef.current
      setCanvasSnapshot(context.getImageData(0, 0, canvas.width, canvas.height))

      // Configurar o contexto para desenhar apenas o contorno
      context.strokeStyle = color
      context.lineWidth = tool === "eraser" ? eraserSize : lineWidth
      context.fillStyle = "transparent"

      setIsDrawing(true)
      return
    }

    setIsDrawing(true)
    context.beginPath()
    context.moveTo(x, y)
    context.strokeStyle = tool === "brush" ? color : "#FFFFFF"
    context.lineWidth = tool === "eraser" ? eraserSize : lineWidth
  }

  // Adicionar função para desenhar uma linha
  const drawLine = (startX: number, startY: number, endX: number, endY: number) => {
    if (!context || !canvasRef.current) return

    // Desenhar a linha
    context.beginPath()
    context.moveTo(startX, startY)
    context.lineTo(endX, endY)
    context.stroke()
  }

  // Modificar a função draw para incluir a prévia de linha
  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!context || !canvasRef.current || !isDrawing) return

    // Prevenir rolagem da tela em dispositivos móveis
    if ("touches" in e) {
      e.preventDefault()
    }

    // Obter coordenadas precisas
    const { x, y } = getCoordinates(e)

    // Se for círculo, quadrado ou linha, desenhar a prévia
    if ((tool === "circle" || tool === "square" || tool === "line") && startPoint && canvasSnapshot) {
      // Restaurar o canvas ao estado antes de começar a desenhar
      context.putImageData(canvasSnapshot, 0, 0)

      // Desenhar a forma de acordo com a ferramenta selecionada
      if (tool === "circle") {
        drawCircle(startPoint.x, startPoint.y, x, y)
      } else if (tool === "square") {
        drawSquare(startPoint.x, startPoint.y, x, y)
      } else if (tool === "line") {
        drawLine(startPoint.x, startPoint.y, x, y)
      }

      return
    }

    // Para pincel e borracha, continuar com o comportamento normal
    context.lineTo(x, y)
    context.stroke()
  }

  // Modificar a função stopDrawing para finalizar o desenho de círculo e quadrado
  const stopDrawing = () => {
    if (!context) return

    // Limpar os estados de desenho de formas
    setStartPoint(null)
    setCanvasSnapshot(null)

    setIsDrawing(false)
    context.closePath()
  }

  // Modificar a função clearCanvas para garantir que limpe completamente
  const clearCanvas = () => {
    if (!context || !canvasRef.current) return

    // Limpar completamente o canvas
    context.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height)

    // Resetar o estado do desenho selecionado
    setSelectedOutline(null)

    // Play audio feedback for clearing the canvas
    playAudio("Limpar tudo")
  }

  // Handle color selection
  const handleColorSelect = (selectedColor: string, colorName: string) => {
    setColor(selectedColor)
    if (tool === "eraser") {
      setTool("brush")
    }

    // Play audio for the color name
    playAudio(colorName)
  }

  // Handle outline selection
  const handleOutlineSelect = (outlineId: string) => {
    const outline = outlines.find((o) => o.id === outlineId)
    if (outline) {
      // Play audio announcement of the drawing name
      playAudio(outline.name)

      // Set the selected outline
      setSelectedOutline(outline.id)

      // Clear the canvas
      if (context && canvasRef.current) {
        context.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height)
      }

      // Load the image based on type
      if (outline.svgData) {
        renderSVGDirectly(outline.svgData)
      } else if (outline.imageUrl) {
        loadImageToCanvas(outline.imageUrl)
      }
    }
  }

  // Substitua a função loadImageToCanvas existente por esta versão atualizada
  // que garante que a imagem sempre se ajuste à largura da área de desenho

  // Add a new function to load regular images to canvas
  const loadImageToCanvas = (imageUrl: string) => {
    if (!context || !canvasRef.current) return

    setIsLoading(true)

    const img = new Image()
    img.crossOrigin = "anonymous"

    img.onload = () => {
      if (!context || !canvasRef.current) {
        setIsLoading(false)
        return
      }

      // Get canvas dimensions
      const canvas = canvasRef.current
      const canvasWidth = canvas.width
      const canvasHeight = canvas.height

      // Calcular a proporção da imagem
      const imgRatio = img.width / img.height

      // Sempre usar a largura como base para o dimensionamento
      // e calcular a altura proporcional
      const targetWidth = canvasWidth * 0.9 // Usar 90% da largura para dar uma margem
      const targetHeight = targetWidth / imgRatio

      // Garantir que a altura também não ultrapasse o canvas
      let finalWidth = targetWidth
      let finalHeight = targetHeight

      if (targetHeight > canvasHeight * 0.9) {
        // Se a altura calculada for maior que 90% da altura do canvas,
        // recalcular usando a altura como base
        finalHeight = canvasHeight * 0.9
        finalWidth = finalHeight * imgRatio
      }

      // Center the image on the canvas
      const x = (canvasWidth - finalWidth) / 2
      const y = (canvasHeight - finalHeight) / 2

      // Clear the canvas before drawing
      context.clearRect(0, 0, canvasWidth, canvasHeight)

      // Draw the image on the canvas
      context.drawImage(img, x, y, finalWidth, finalHeight)

      setIsLoading(false)
    }

    img.onerror = () => {
      console.error("Error loading image")
      setIsLoading(false)
    }

    img.src = imageUrl
  }

  // Também vamos atualizar a função renderSVGDirectly para usar a mesma lógica
  // Add this new function to directly render SVG paths to canvas
  const renderSVGDirectly = (svgData: string) => {
    if (!context || !canvasRef.current) return

    // Clear the canvas
    context.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height)

    // Parse the SVG data to extract paths
    const parser = new DOMParser()
    const svgDoc = parser.parseFromString(svgData, "image/svg+xml")

    // Obter o viewBox do SVG para manter a proporção correta
    const svgElement = svgDoc.querySelector("svg")
    let viewBox = { x: 0, y: 0, width: 200, height: 200 }

    if (svgElement && svgElement.getAttribute("viewBox")) {
      const viewBoxAttr = svgElement.getAttribute("viewBox")?.split(" ").map(Number) || [0, 0, 200, 200]
      viewBox = {
        x: viewBoxAttr[0] || 0,
        y: viewBoxAttr[1] || 0,
        width: viewBoxAttr[2] || 200,
        height: viewBoxAttr[3] || 200,
      }
    }

    const paths = svgDoc.querySelectorAll("path, circle, rect, ellipse")

    // Save current context state
    context.save()

    // Set up the context for drawing
    context.strokeStyle = "black"
    context.lineWidth = 2 // Thicker lines for better visibility
    context.lineCap = "round"
    context.lineJoin = "round"

    // Get canvas dimensions
    const canvas = canvasRef.current
    const canvasWidth = canvas.width
    const canvasHeight = canvas.height

    // Calcular a proporção do SVG
    const svgRatio = viewBox.width / viewBox.height

    // Sempre usar a largura como base para o dimensionamento
    // e calcular a altura proporcional
    const targetWidth = canvasWidth * 0.9 // Usar 90% da largura para dar uma margem
    const targetHeight = targetWidth / svgRatio

    // Garantir que a altura também não ultrapasse o canvas
    let finalWidth = targetWidth
    let finalHeight = targetHeight

    if (targetHeight > canvasHeight * 0.9) {
      // Se a altura calculada for maior que 90% da altura do canvas,
      // recalcular usando a altura como base
      finalHeight = canvasHeight * 0.9
      finalWidth = finalHeight * svgRatio
    }

    // Calcular a escala e o deslocamento para centralizar
    const scale = finalWidth / viewBox.width
    const offsetX = (canvasWidth - finalWidth) / 2
    const offsetY = (canvasHeight - finalHeight) / 2

    context.translate(offsetX, offsetY)
    context.scale(scale, scale)

    // Draw each path
    paths.forEach((path) => {
      if (path.tagName === "path") {
        const d = path.getAttribute("d")
        if (d) {
          drawSVGPath(d)
        }
      } else if (path.tagName === "circle") {
        const cx = Number.parseFloat(path.getAttribute("cx") || "0")
        const cy = Number.parseFloat(path.getAttribute("cy") || "0")
        const r = Number.parseFloat(path.getAttribute("r") || "0")
        context.beginPath()
        context.arc(cx, cy, r, 0, Math.PI * 2)
        context.stroke()
      } else if (path.tagName === "rect") {
        const x = Number.parseFloat(path.getAttribute("x") || "0")
        const y = Number.parseFloat(path.getAttribute("y") || "0")
        const width = Number.parseFloat(path.getAttribute("width") || "0")
        const height = Number.parseFloat(path.getAttribute("height") || "0")
        context.strokeRect(x, y, width, height)
      } else if (path.tagName === "ellipse") {
        const cx = Number.parseFloat(path.getAttribute("cx") || "0")
        const cy = Number.parseFloat(path.getAttribute("cy") || "0")
        const rx = Number.parseFloat(path.getAttribute("rx") || "0")
        const ry = Number.parseFloat(path.getAttribute("ry") || "0")
        drawEllipse(cx, cy, rx, ry)
      }
    })

    // Restore context
    context.restore()
  }

  // Add this helper function for drawing SVG paths
  const drawSVGPath = (d: string) => {
    if (!context) return

    // Simple SVG path parser and renderer
    const commands = d.match(/[a-df-z][^a-df-z]*/gi) || []
    let currentX = 0
    let currentY = 0

    context.beginPath()

    commands.forEach((cmd) => {
      const type = cmd[0]
      const args = cmd
        .slice(1)
        .trim()
        .split(/[\s,]+/)
        .map(Number.parseFloat)

      switch (type) {
        case "M": // Move to
          currentX = args[0]
          currentY = args[1]
          context.moveTo(currentX, currentY)
          break
        case "L": // Line to
          currentX = args[0]
          currentY = args[1]
          context.lineTo(currentX, currentY)
          break
        case "C": // Cubic bezier curve
          context.bezierCurveTo(args[0], args[1], args[2], args[3], args[4], args[5])
          currentX = args[4]
          currentY = args[5]
          break
        case "Q": // Quadratic bezier curve
          context.quadraticCurveTo(args[0], args[1], args[2], args[3])
          currentX = args[2]
          currentY = args[3]
          break
        case "Z": // Close path
          context.closePath()
          break
      }
    })

    context.stroke()
  }

  // Add this helper function for drawing ellipses
  const drawEllipse = (cx: number, cy: number, rx: number, ry: number) => {
    if (!context) return

    context.beginPath()
    context.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2)
    context.stroke()
  }

  // Download the drawing as an image
  const downloadDrawing = () => {
    if (!canvasRef.current) return

    // Create a temporary link element
    const link = document.createElement("a")
    link.download = "meu-desenho.png"

    // Convert canvas to data URL
    link.href = canvasRef.current.toDataURL("image/png")

    // Append to the document, click it, and remove it
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <div className="flex flex-col h-screen max-h-screen bg-gradient-to-b from-blue-100 to-purple-100">
      {/* Barra de navegação única */}
      <header className="p-2 bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 text-white flex items-center shadow-lg">
        {/* Nome do sistema à esquerda com crédito abaixo */}
        <div className="mr-6">
          <h1
            className="text-xl font-bold cursor-pointer"
            onMouseDown={handleAdminButtonPress}
            onMouseUp={handleAdminButtonRelease}
            onTouchStart={handleAdminButtonPress}
            onTouchEnd={handleAdminButtonRelease}
          >
            Allyson Lira
          </h1>
          <div className="text-xs opacity-70">Desenvolvido por Fabiano Lira</div>
        </div>
        <div className="flex items-center space-x-3 mx-auto">
          <Button
            variant={tool === "brush" ? "default" : "outline"}
            size="icon"
            onClick={() => handleToolSelect("brush")}
            className={`h-12 w-12 rounded-full ${
              tool === "brush" ? "bg-white text-purple-600" : "bg-purple-600/20 text-white hover:bg-purple-600/40"
            }`}
            title="Pincel"
          >
            <Paintbrush className="h-6 w-6" />
            <span className="sr-only">Pincel</span>
          </Button>

          <Button
            variant={tool === "eraser" ? "default" : "outline"}
            size="icon"
            onClick={() => handleToolSelect("eraser")}
            className={`h-12 w-12 rounded-full ${
              tool === "eraser" ? "bg-white text-purple-600" : "bg-purple-600/20 text-white hover:bg-purple-600/40"
            }`}
            title="Borracha"
          >
            <Eraser className="h-6 w-6" />
            <span className="sr-only">Borracha</span>
          </Button>

          <Button
            variant={tool === "fill" ? "default" : "outline"}
            size="icon"
            onClick={() => handleToolSelect("fill")}
            className={`h-12 w-12 rounded-full ${
              tool === "fill" ? "bg-white text-purple-600" : "bg-purple-600/20 text-white hover:bg-purple-600/40"
            }`}
            title="Balde de Tinta"
          >
            <Droplet className="h-6 w-6" />
            <span className="sr-only">Balde de Tinta</span>
          </Button>

          <Button
            variant={tool === "line" ? "default" : "outline"}
            size="icon"
            onClick={() => handleToolSelect("line")}
            className={`h-12 w-12 rounded-full ${
              tool === "line" ? "bg-white text-purple-600" : "bg-purple-600/20 text-white hover:bg-purple-600/40"
            }`}
            title="Linha"
          >
            <Minus className="h-6 w-6" />
            <span className="sr-only">Linha</span>
          </Button>

          <Button
            variant={tool === "circle" ? "default" : "outline"}
            size="icon"
            onClick={() => handleToolSelect("circle")}
            className={`h-12 w-12 rounded-full ${
              tool === "circle" ? "bg-white text-purple-600" : "bg-purple-600/20 text-white hover:bg-purple-600/40"
            }`}
            title="Círculo"
          >
            <Circle className="h-6 w-6" />
            <span className="sr-only">Círculo</span>
          </Button>

          <Button
            variant={tool === "square" ? "default" : "outline"}
            size="icon"
            onClick={() => handleToolSelect("square")}
            className={`h-12 w-12 rounded-full ${
              tool === "square" ? "bg-white text-purple-600" : "bg-purple-600/20 text-white hover:bg-purple-600/40"
            }`}
            title="Quadrado"
          >
            <Square className="h-6 w-6" />
            <span className="sr-only">Quadrado</span>
          </Button>

          {/* Botão de espessura */}
          <div className="relative">
            <Button
              variant="outline"
              size="icon"
              onClick={() => setShowThicknessOptions(!showThicknessOptions)}
              className="h-12 w-12 rounded-full bg-purple-600/20 text-white hover:bg-purple-600/40"
              title="Espessura"
            >
              <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M6 12h12" stroke="currentColor" strokeWidth="1" strokeLinecap="round" />
                <path d="M6 8h12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                <path d="M6 16h12" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
              </svg>
              <span className="sr-only">Espessura</span>
            </Button>

            {showThicknessOptions && (
              <div className="absolute top-full left-1/2 transform -translate-x-1/2 bg-white rounded-md shadow-md p-2 flex flex-col space-y-2 z-10 mt-2 w-32">
                <div className="text-xs font-medium text-center text-gray-700 mb-1">Espessura</div>
                {[
                  { size: 3, name: "Fino" },
                  { size: 5, name: "Médio" },
                  { size: 8, name: "Grosso" },
                ].map((option) => (
                  <button
                    key={option.size}
                    className="px-3 py-2 rounded hover:bg-gray-100 flex items-center"
                    onClick={() => handleThicknessSelect(option.size)}
                  >
                    <div className="w-12 mr-2 bg-purple-600 rounded-full" style={{ height: `${option.size}px` }} />
                    <span className="text-sm">{option.name}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          <Button
            variant="outline"
            size="icon"
            onClick={clearCanvas}
            className="h-12 w-12 rounded-full bg-red-500/80 text-white hover:bg-red-600"
            title="Limpar Tudo"
          >
            <Trash2 className="h-6 w-6" />
            <span className="sr-only">Limpar</span>
          </Button>
        </div>
      </header>

      <main className="flex flex-1 overflow-hidden">
        {/* Área lateral esquerda com desenhos e cores */}
        <div className="w-16 bg-gradient-to-b from-purple-200 to-blue-200 p-2 flex flex-col gap-2 overflow-y-auto touch-auto overscroll-contain">
          {/* Desenhos para colorir */}
          <div className="flex flex-col gap-2 mb-4">
            {outlines.map((outline) => (
              <ImageThumbnail
                key={outline.id}
                svgData={outline.svgData}
                imageUrl={outline.imageUrl}
                name={outline.name}
                isSelected={selectedOutline === outline.id}
                onClick={() => handleOutlineSelect(outline.id)}
              />
            ))}
          </div>

          {/* Separador */}
          <div className="border-t border-purple-300 my-2"></div>

          {/* Paleta de cores abaixo dos desenhos */}
          <div className="flex flex-col gap-2 mt-2">
            {colors.map((colorItem) => (
              <div
                key={colorItem.color}
                className={`h-8 w-8 rounded-full cursor-pointer transition-transform hover:scale-110 mx-auto ${
                  color === colorItem.color && tool !== "eraser" ? "ring-2 ring-purple-500 scale-110" : ""
                }`}
                style={{ backgroundColor: colorItem.color }}
                onClick={() => handleColorSelect(colorItem.color, colorItem.name)}
                title={colorItem.name}
              />
            ))}
          </div>
        </div>

        {/* Área de desenho principal */}
        <div className="flex-1 relative">
          <div className="absolute inset-0 p-2">
            <div className="w-full h-full rounded-xl overflow-hidden shadow-lg border-2 border-purple-300 bg-white">
              <canvas
                ref={canvasRef}
                className="absolute top-0 left-0 w-full h-full touch-none"
                onMouseDown={startDrawing}
                onMouseMove={draw}
                onMouseUp={stopDrawing}
                onMouseLeave={stopDrawing}
                onTouchStart={startDrawing}
                onTouchMove={draw}
                onTouchEnd={stopDrawing}
              />
              {isLoading && (
                <div className="absolute inset-0 flex items-center justify-center bg-white/50">
                  <div className="text-lg font-medium bg-white p-3 rounded-xl shadow-md">Carregando desenho...</div>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Admin Modals */}
      <LoginModal isOpen={showLoginModal} onClose={() => setShowLoginModal(false)} onLogin={handleLoginResult} />

      <AdminPanel
        isOpen={showAdminPanel}
        onClose={() => setShowAdminPanel(false)}
        outlines={outlines}
        onAddOutline={handleAddOutline}
        onDeleteOutline={handleDeleteOutline}
      />
    </div>
  )
}

