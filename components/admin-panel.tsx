"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Trash2, Plus, X, Upload, Smartphone } from "lucide-react"
import Image from "next/image"
import { Dialog, DialogContent, DialogDescription, DialogHeader } from "@/components/ui/dialog"

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

  // Adicione a função de download da versão mobile antes do return
  // Atualizar a versão mobile para incluir o ícone correto da linha e melhorar os ícones
  const downloadMobileVersion = () => {
    try {
      // Criar um link para download direto
      const downloadLink = document.createElement("a")
      downloadLink.href =
        "data:text/html;charset=utf-8," +
        encodeURIComponent(`
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
  <title>Alysson Lira - App de Desenho</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
      touch-action: none;
      user-select: none;
      -webkit-user-select: none;
    }
    
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      background: linear-gradient(to bottom, #e0f2fe, #e9d5ff);
      height: 100vh;
      overflow: hidden;
      display: flex;
      flex-direction: column;
    }
    
    header {
      padding: 0.5rem;
      background: linear-gradient(to right, #ec4899, #8b5cf6, #6366f1);
      color: white;
      display: flex;
      justify-content: space-between;
      align-items: center;
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
    }
    
    .app-title-container {
      display: flex;
      flex-direction: column;
      margin-right: 1rem;
      flex-shrink: 0;
    }
    
    .app-title {
      font-size: 1.25rem;
      font-weight: bold;
    }
    
    .app-credit {
      font-size: 0.7rem;
      opacity: 0.7;
    }
    
    .tools {
      display: flex;
      gap: 0.5rem;
      overflow-x: auto;
      padding: 0.5rem;
      -webkit-overflow-scrolling: touch;
      scrollbar-width: none;
      -ms-overflow-style: none;
      scroll-snap-type: x mandatory;
      padding-bottom: 0.75rem;
      width: 100%;
    }
    
    .tools::-webkit-scrollbar {
      display: none;
    }
    
    .tool-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 0.2rem;
      flex-shrink: 0;
      scroll-snap-align: center;
    }
    
    .tool-label {
      font-size: 0.65rem;
      color: white;
      text-align: center;
      white-space: nowrap;
    }
    
    .tool-btn {
      width: 3.5rem;
      height: 3.5rem;
      border-radius: 9999px;
      border: none;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      transition: all 0.2s;
    }
    
    .tool-btn.selected {
      background-color: white;
      color: #8b5cf6;
      transform: scale(1.1);
      box-shadow: 0 0 0 2px rgba(255, 255, 255, 0.5);
    }
    
    .tool-btn:not(.selected) {
      background-color: rgba(255, 255, 255, 0.2);
      color: white;
    }
    
    .icon {
      width: 1.8rem;
      height: 1.8rem;
      stroke-width: 2;
      stroke: currentColor;
      fill: none;
      stroke-linecap: round;
      stroke-linejoin: round;
    }
    
    .thickness-popup {
      position: absolute;
      top: 100%;
      left: 50%;
      transform: translateX(-50%);
      margin-top: 0.5rem;
      background-color: white;
      border-radius: 0.5rem;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
      padding: 0.5rem;
      z-index: 10;
      display: none;
      width: 10rem;
    }
    
    .thickness-popup.show {
      display: block;
    }
    
    .thickness-option {
      display: flex;
      align-items: center;
      padding: 0.5rem;
      cursor: pointer;
      border-radius: 0.25rem;
    }
    
    .thickness-option:hover {
      background-color: #f3e8ff;
    }
    
    .thickness-line {
      background-color: #8b5cf6;
      border-radius: 9999px;
      margin-right: 0.5rem;
      width: 3rem;
    }
    
    .thickness-text {
      font-size: 0.75rem;
      color: #4b5563;
    }
    
    main {
      flex: 1;
      display: flex;
      overflow: hidden;
    }
    
    .canvas-container {
      flex: 1;
      position: relative;
      padding: 0.5rem;
    }
    
    .canvas-wrapper {
      width: 100%;
      height: 100%;
      border-radius: 0.75rem;
      overflow: hidden;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
      border: 2px solid #d8b4fe;
      background-color: white;
      position: relative;
    }
    
    canvas {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
    }
    
    .sidebar {
      width: 4rem;
      background: linear-gradient(to bottom, #ddd6fe, #bfdbfe);
      padding: 0.5rem;
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
      overflow-y: auto;
      -webkit-overflow-scrolling: touch;
      touch-action: auto;
      overscroll-behavior: contain;
    }
    
    .thumbnails {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
      margin-bottom: 0.5rem;
    }
    
    .thumbnail {
      width: 3rem;
      height: 3rem;
      background-color: white;
      border-radius: 0.5rem;
      overflow: hidden;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 0.25rem;
      border: 2px solid transparent;
      transition: all 0.2s;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    }
    
    .thumbnail.selected {
      border-color: #8b5cf6;
      transform: scale(1.1);
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    }
    
    .separator {
      height: 1px;
      background-color: rgba(139, 92, 246, 0.3);
      margin: 0.5rem 0;
    }
    
    .colors {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
      align-items: center;
    }
    
    .color-btn {
      width: 2rem;
      height: 2rem;
      border-radius: 9999px;
      border: 2px solid transparent;
      cursor: pointer;
      transition: all 0.2s;
    }
    
    .color-btn.selected {
      border-color: #8b5cf6;
      transform: scale(1.1);
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    }
    
    .loading {
      position: absolute;
      inset: 0;
      display: flex;
      align-items: center;
      justify-content: center;
      background-color: rgba(255, 255, 255, 0.7);
    }
    
    .loading-text {
      font-size: 1.125rem;
      font-weight: 500;
      background-color: white;
      padding: 0.75rem;
      border-radius: 0.75rem;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    }
    
    .sidebar::-webkit-scrollbar {
      width: 0px;
    }
    
    .sidebar {
      scrollbar-width: none;
      -ms-overflow-style: none;
    }
    
    .tool-btn.clear-btn {
      background-color: rgba(239, 68, 68, 0.8);
    }
    
    .tool-btn.share-btn {
      background-color: rgba(34, 197, 94, 0.8);
    }
  </style>
</head>
<body>
  <header>
    <div class="app-title-container">
      <h1 class="app-title">Alysson Lira</h1>
      <div class="app-credit">Desenvolvido por Fabiano Lira</div>
    </div>
    
    <div class="tools">
      <div class="tool-container">
        <button class="tool-btn selected" id="brush-btn">
          <svg class="icon" viewBox="0 0 24 24"><path d="M12 19l7-7 3 3-7 7-3-3z"></path><path d="M18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5z"></path><path d="M2 2l7.586 7.586"></path><circle cx="11" cy="11" r="2"></circle></svg>
        </button>
        <span class="tool-label">Pincel</span>
      </div>
      
      <div class="tool-container">
        <button class="tool-btn" id="eraser-btn">
          <svg class="icon" viewBox="0 0 24 24"><path d="M20 20H9L4 15C2.9 13.9 2.9 12.1 4 11L13 2C14.1 0.9 15.9 0.9 17 2L22 7C23.1 8.1 23.1 9.9 22 11L13 20"></path><path d="M6 14L18 2"></path></svg>
        </button>
        <span class="tool-label">Borracha</span>
      </div>
      
      <div class="tool-container">
        <button class="tool-btn" id="fill-btn">
          <svg class="icon" viewBox="0 0 24 24"><path d="M7 21h10v-2H7v2z"></path><path d="M7.14 9.83l5.66-5.66 5.66 5.66a2 2 0 0 1 0 2.83l-5.66 5.66-5.66-5.66a2 2 0 0 1 0-2.83z"></path><path d="M12.05 4.05l-7.07 7.07a4.008 4.008 0 0 0 0 5.66l7.07 7.07 7.07-7.07a4.008 4.008 0 0 0 0-5.66l-7.07-7.07z"></path></svg>
        </button>
        <span class="tool-label">Pintar</span>
      </div>
      
      <div class="tool-container">
        <button class="tool-btn" id="line-btn">
          <svg class="icon" viewBox="0 0 24 24"><line x1="5" y1="12" x2="19" y2="12"></line></svg>
        </button>
        <span class="tool-label">Linha</span>
      </div>
      
      <div class="tool-container">
        <button class="tool-btn" id="circle-btn">
          <svg class="icon" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"></circle></svg>
        </button>
        <span class="tool-label">Círculo</span>
      </div>
      
      <div class="tool-container">
        <button class="tool-btn" id="square-btn">
          <svg class="icon" viewBox="0 0 24 24"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect></svg>
        </button>
        <span class="tool-label">Quadrado</span>
      </div>
      
      <div class="tool-container">
        <button class="tool-btn" id="thickness-btn">
          <svg class="icon" viewBox="0 0 24 24">
            <path d="M6 12h12" stroke="currentColor" strokeWidth="1" strokeLinecap="round" />
            <path d="M6 8h12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            <path d="M6 16h12" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
          </svg>
        </button>
        <span class="tool-label">Espessura</span>
      </div>
      
      <div class="tool-container">
        <button class="tool-btn clear-btn" id="clear-btn">
          <svg class="icon" viewBox="0 0 24 24"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>
        </button>
        <span class="tool-label">Limpar</span>
      </div>
      
      <div class="tool-container">
        <button class="tool-btn share-btn" id="share-btn">
          <svg class="icon" viewBox="0 0 24 24"><circle cx="18" cy="5" r="3"></circle><circle cx="6" cy="12" r="3"></circle><circle cx="18" cy="19" r="3"></circle><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"></line><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"></line></svg>
        </button>
        <span class="tool-label">Compartilhar</span>
      </div>
    </div>
  </header>

  <main>
    <div class="sidebar">
      <div class="thumbnails" id="thumbnails-container"></div>
      <div class="separator"></div>
      <div class="colors" id="colors-container"></div>
    </div>

    <div class="canvas-container">
      <div class="canvas-wrapper">
        <canvas id="drawing-canvas"></canvas>
      </div>
      <div class="loading" id="loading" style="display: none;">
        <div class="loading-text">Carregando desenho...</div>
      </div>
    </div>
  </main>

  <div id="thickness-popup" class="thickness-popup">
    <div style="font-size: 0.8rem; font-weight: bold; margin-bottom: 0.5rem; text-align: center;">Espessura</div>
    <div class="thickness-option" id="thickness-small">
      <div class="thickness-line" style="height: 3px;"></div>
      <div class="thickness-text">Fino</div>
    </div>
    <div class="thickness-option" id="thickness-medium">
      <div class="thickness-line" style="height: 5px;"></div>
      <div class="thickness-text">Médio</div>
    </div>
    <div class="thickness-option" id="thickness-large">
      <div class="thickness-line" style="height: 8px;"></div>
      <div class="thickness-text">Grosso</div>
    </div>
  </div>

  <script>
    // Outlines data
    const outlines = [
      {
        id: "sun",
        name: "Sol",
        svgData: '<svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg"><circle fill="none" stroke="black" strokeWidth="2" cx="100" cy="100" r="40" /><path fill="none" stroke="black" strokeWidth="2" d="M100,40 L100,20" /><path fill="none" stroke="black" strokeWidth="2" d="M100,180 L100,160" /><path fill="none" stroke="black" strokeWidth="2" d="M40,100 L20,100" /><path fill="none" stroke="black" strokeWidth="2" d="M180,100 L160,100" /><path fill="none" stroke="black" strokeWidth="2" d="M60,60 L45,45" /><path fill="none" stroke="black" strokeWidth="2" d="M140,60 L155,45" /><path fill="none" stroke="black" strokeWidth="2" d="M60,140 L45,155" /><path fill="none" stroke="black" strokeWidth="2" d="M140,140 L155,155" /><circle fill="none" stroke="black" strokeWidth="2" cx="85" cy="90" r="5" /><circle fill="none" stroke="black" strokeWidth="2" cx="115" cy="90" r="5" /><path fill="none" stroke="black" strokeWidth="2" d="M80,115 Q100,130 120,115" /></svg>'
      },
      {
        id: "house",
        name: "Casa",
        svgData: '<svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg"><rect fill="none" stroke="black" strokeWidth="2" x="40" y="80" width="120" height="100" /><path fill="none" stroke="black" strokeWidth="2" d="M30,80 L100,20 L170,80" /><rect fill="none" stroke="black" strokeWidth="2" x="85" y="130" width="30" height="50" /><circle fill="none" stroke="black" strokeWidth="2" cx="105" cy="155" r="3" /><rect fill="none" stroke="black" strokeWidth="2" x="55" y="100" width="25" height="25" /><path fill="none" stroke="black" strokeWidth="2" d="M55,112.5 L80,112.5" /><path fill="none" stroke="black" strokeWidth="2" d="M67.5,100 L67.5,125" /><rect fill="none" stroke="black" strokeWidth="2" x="120" y="100" width="25" height="25" /><path fill="none" stroke="black" strokeWidth="2" d="M120,112.5 L145,112.5" /><path fill="none" stroke="black" strokeWidth="2" d="M132.5,100 L132.5,125" /><path fill="none" stroke="black" strokeWidth="2" d="M130,50 L130,20 L150,20 L150,60" /></svg>'
      },
      {
        id: "car",
        name: "Carro",
        svgData: '<svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg"><path fill="none" stroke="black" strokeWidth="2" d="M30,120 L30,140 L170,140 L170,120 L140,90 L60,90 L30,120 Z" /><path fill="none" stroke="black" strokeWidth="2" d="M60,90 L70,70 L130,70 L140,90" /><path fill="none" stroke="black" strokeWidth="2" d="M80,90 L85,70" /><path fill="none" stroke="black" strokeWidth="2" d="M120,90 L115,70" /><circle fill="none" stroke="black" strokeWidth="2" cx="60" cy="140" r="15" /><circle fill="none" stroke="black" strokeWidth="2" cx="140" cy="140" r="15" /><rect fill="none" stroke="black" strokeWidth="2" x="35" y="110" width="10" height="10" /><rect fill="none" stroke="black" strokeWidth="2" x="155" y="110" width="10" height="10" /><path fill="none" stroke="black" strokeWidth="2" d="M85,90 L85,130" /><circle fill="none" stroke="black" strokeWidth="2" cx="95" cy="110" r="3" /></svg>'
      },
      {
        id: "butterfly",
        name: "Borboleta",
        svgData: '<svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg"><path fill="none" stroke="black" strokeWidth="2" d="M100,50 L100,150" /><path fill="none" stroke="black" strokeWidth="2" d="M100,50 L85,30" /><path fill="none" stroke="black" strokeWidth="2" d="M100,50 L115,30" /><path fill="none" stroke="black" strokeWidth="2" d="M100,70 C60,40 40,70 50,100 C40,130 60,160 100,130" /><path fill="none" stroke="black" strokeWidth="2" d="M100,70 C140,40 160,70 150,100 C160,130 140,160 100,130" /><circle fill="none" stroke="black" strokeWidth="2" cx="75" cy="85" r="10" /><circle fill="none" stroke="black" strokeWidth="2" cx="125" cy="85" r="10" /><circle fill="none" stroke="black" strokeWidth="2" cx="75" cy="115" r="8" /><circle fill="none" stroke="black" strokeWidth="2" cx="125" cy="115" r="8" /></svg>'
      },
      {
        id: "tree",
        name: "Árvore",
        svgData: '<svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg"><rect fill="none" stroke="black" strokeWidth="2" x="85" y="120" width="30" height="60" /><ellipse fill="none" stroke="black" strokeWidth="2" cx="100" cy="50" rx="40" ry="30" /><ellipse fill="none" stroke="black" strokeWidth="2" cx="70" cy="80" rx="30" ry="25" /><ellipse fill="none" stroke="black" strokeWidth="2" cx="130" cy="80" rx="30" ry="25" /><ellipse fill="none" stroke="black" strokeWidth="2" cx="100" cy="100" rx="45" ry="30" /></svg>'
      }
    ];

    // Colors data
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
      { color: "#808080", name: "Cinza" }
    ];

    // App state
    let currentTool = "brush";
    let currentColor = "#FF0000";
    let selectedOutline = null;
    let isDrawing = false;
    let lastAudio = { text: "", timestamp: 0 };
    let lineWidth = 5;
    const eraserSize = 50;

    // Drawing state
    let startPoint = null;
    let canvasSnapshot = null;
    let thicknessPopupVisible = false;

    // DOM elements
    const canvas = document.getElementById("drawing-canvas");
    const ctx = canvas.getContext("2d");
    const thumbnailsContainer = document.getElementById("thumbnails-container");
    const colorsContainer = document.getElementById("colors-container");
    const brushBtn = document.getElementById("brush-btn");
    const eraserBtn = document.getElementById("eraser-btn");
    const fillBtn = document.getElementById("fill-btn");
    const lineBtn = document.getElementById("line-btn");
    const circleBtn = document.getElementById("circle-btn");
    const squareBtn = document.getElementById("square-btn");
    const thicknessBtn = document.getElementById("thickness-btn");
    const clearBtn = document.getElementById("clear-btn");
    const shareBtn = document.getElementById("share-btn");
    const loadingEl = document.getElementById("loading");
    const thicknessPopup = document.getElementById("thickness-popup");
    const thicknessSmall = document.getElementById("thickness-small");
    const thicknessMedium = document.getElementById("thickness-medium");
    const thicknessLarge = document.getElementById("thickness-large");

    // Initialize canvas
    function initCanvas() {
      function resizeCanvas() {
        const container = canvas.parentElement;
        canvas.width = container.clientWidth;
        canvas.height = container.clientHeight;
        
        if (selectedOutline) {
          const outline = outlines.find(o => o.id === selectedOutline);
          if (outline && outline.svgData) {
            renderSVGDirectly(outline.svgData);
          }
        }
      }
      
      resizeCanvas();
      window.addEventListener("resize", resizeCanvas);
      
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      ctx.lineWidth = lineWidth;
      
      setTimeout(() => {
        const sunOutline = outlines.find(o => o.id === "sun");
        if (sunOutline && sunOutline.svgData) {
          renderSVGDirectly(sunOutline.svgData);
          selectedOutline = "sun";
          
          const thumbnails = document.querySelectorAll(".thumbnail");
          thumbnails.forEach(thumb => {
            if (thumb.dataset.id === "sun") {
              thumb.classList.add("selected");
            }
          });
          
          playAudio(sunOutline.name);
        }
      }, 800);
    }

    // Initialize thumbnails
    function initThumbnails() {
      outlines.forEach(outline => {
        const thumbnail = document.createElement("div");
        thumbnail.className = "thumbnail";
        thumbnail.dataset.id = outline.id;
        thumbnail.dataset.name = outline.name;
        thumbnail.innerHTML = outline.svgData;
        thumbnail.addEventListener("click", () => handleOutlineSelect(outline.id));
        thumbnailsContainer.appendChild(thumbnail);
      });
    }

    // Initialize colors
    function initColors() {
      colors.forEach(colorItem => {
        const colorBtn = document.createElement("div");
        colorBtn.className = "color-btn";
        colorBtn.style.backgroundColor = colorItem.color;
        colorBtn.dataset.color = colorItem.color;
        colorBtn.dataset.name = colorItem.name;
        if (colorItem.color === currentColor) {
          colorBtn.classList.add("selected");
        }
        colorBtn.addEventListener("click", () => handleColorSelect(colorItem.color, colorItem.name));
        colorsContainer.appendChild(colorBtn);
      });
    }

    // Initialize tools
    function initTools() {
      brushBtn.addEventListener("click", () => handleToolSelect("brush"));
      eraserBtn.addEventListener("click", () => handleToolSelect("eraser"));
      fillBtn.addEventListener("click", () => handleToolSelect("fill"));
      lineBtn.addEventListener("click", () => handleToolSelect("line"));
      circleBtn.addEventListener("click", () => handleToolSelect("circle"));
      squareBtn.addEventListener("click", () => handleToolSelect("square"));
      clearBtn.addEventListener("click", clearCanvas);
      shareBtn.addEventListener("click", shareDrawing);
      
      thicknessBtn.addEventListener("click", () => {
        thicknessPopupVisible = !thicknessPopupVisible;
        if (thicknessPopupVisible) {
          showThicknessPopup();
        } else {
          hideThicknessPopup();
        }
      });
      
      thicknessSmall.addEventListener("click", () => {
        lineWidth = 3;
        hideThicknessPopup();
        updateLineWidth();
        playAudio("Espessura fina");
      });
      
      thicknessMedium.addEventListener("click", () => {
        lineWidth = 5;
        hideThicknessPopup();
        updateLineWidth();
        playAudio("Espessura média");
      });
      
      thicknessLarge.addEventListener("click", () => {
        lineWidth = 8;
        hideThicknessPopup();
        updateLineWidth();
        playAudio("Espessura grossa");
      });
    }

    // Update line width
    function updateLineWidth() {
      if (ctx) {
        ctx.lineWidth = currentTool === "eraser" ? eraserSize : lineWidth;
      }
    }

    // Show thickness popup
    function showThicknessPopup() {
      const thicknessBtnRect = thicknessBtn.getBoundingClientRect();
      thicknessPopup.style.left = (thicknessBtnRect.left + thicknessBtnRect.width / 2) + "px";
      thicknessPopup.style.top = (thicknessBtnRect.bottom) + "px";
      thicknessPopup.classList.add("show");
      thicknessPopupVisible = true;
    }

    // Hide thickness popup
    function hideThicknessPopup() {
      thicknessPopup.classList.remove("show");
      thicknessPopupVisible = false;
    }

    // Handle tool selection
    function handleToolSelect(tool) {
      currentTool = tool;
      
      hideThicknessPopup();
      
      brushBtn.classList.toggle("selected", tool === "brush");
      eraserBtn.classList.toggle("selected", tool === "eraser");
      fillBtn.classList.toggle("selected", tool === "fill");
      lineBtn.classList.toggle("selected", tool === "line");
      circleBtn.classList.toggle("selected", tool === "circle");
      squareBtn.classList.toggle("selected", tool === "square");
      
      updateLineWidth();
      
      if (tool === "brush") {
        playAudio("Pincel");
      } else if (tool === "eraser") {
        playAudio("Borracha");
      } else if (tool === "fill") {
        playAudio("Balde de tinta");
      } else if (tool === "line") {
        playAudio("Linha");
      } else if (tool === "circle") {
        playAudio("Círculo");
      } else if (tool === "square") {
        playAudio("Quadrado");
      }
    }

    // Handle color selection
    function handleColorSelect(color, name) {
      currentColor = color;
      if (currentTool === "eraser") {
        currentTool = "brush";
        brushBtn.classList.add("selected");
        eraserBtn.classList.remove("selected");
      }
      
      document.querySelectorAll(".color-btn").forEach(btn => {
        btn.classList.toggle("selected", btn.dataset.color === color);
      });
      
      playAudio(name);
    }

    // Handle outline selection
    function handleOutlineSelect(outlineId) {
      const outline = outlines.find(o => o.id === outlineId);
      if (outline) {
        playAudio(outline.name);
        
        selectedOutline = outline.id;
        
        const thumbnails = document.querySelectorAll(".thumbnail");
        thumbnails.forEach(thumb => {
          thumb.classList.toggle("selected", thumb.dataset.id === outlineId);
        });
        
        if (ctx && canvas) {
          ctx.clearRect(0, 0, canvas.width, canvas.height);
          if (outline.svgData) {
            renderSVGDirectly(outline.svgData);
          }
        }
      }
    }

    // Convert hex to RGB
    function hexToRgb(hex) {
      const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
      return result
        ? {
            r: parseInt(result[1], 16),
            g: parseInt(result[2], 16),
            b: parseInt(result[3], 16),
          }
        : null;
    }

    // Flood fill function
    function floodFill(startX, startY, fillColor) {
      if (!ctx || !canvas) return;
      
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imageData.data;
      const width = imageData.width;
      const height = imageData.height;
      
      startX = Math.floor(startX);
      startY = Math.floor(startY);
      
      const startPos = (startY * width + startX) * 4;
      const startR = data[startPos];
      const startG = data[startPos + 1];
      const startB = data[startPos + 2];
      const startA = data[startPos + 3];
      
      const fillRGB = hexToRgb(fillColor);
      if (!fillRGB) return;
      
      if (
        startR === fillRGB.r &&
        startG === fillRGB.g &&
        startB === fillRGB.b
      ) {
        return;
      }
      
      const isSameColor = (pos) => {
        const tolerance = 25;
        return (
          Math.abs(data[pos] - startR) <= tolerance &&
          Math.abs(data[pos + 1] - startG) <= tolerance &&
          Math.abs(data[pos + 2] - startB) <= tolerance &&
          Math.abs(data[pos + 3] - startA) <= tolerance
        );
      };
      
      const setColor = (pos) => {
        data[pos] = fillRGB.r;
        data[pos + 1] = fillRGB.g;
        data[pos + 2] = fillRGB.b;
        data[pos + 3] = 255;
      };
      
      const stack = [[startX, startY]];
      const visited = new Set();

      while (stack.length > 0) {
        const [x, y] = stack.pop();
        const key = x + "," + y;

        if (
          x < 0 || x >= width ||
          y < 0 || y >= height ||
          visited.has(key)
        ) {
          continue;
        }
        const pos = (y * width + x) * 4;
      
        if (!isSameColor(pos)) {
          continue;
        }
        
        setColor(pos);
        visited.add(key);
        
        stack.push([x + 1, y]);
        stack.push([x - 1, y]);
        stack.push([x, y + 1]);
        stack.push([x, y - 1]);
        stack.push([x + 1, y + 1]);
        stack.push([x - 1, y - 1]);
        stack.push([x + 1, y - 1]);
        stack.push([x - 1, y + 1]);
      }
      
      ctx.putImageData(imageData, 0, 0);
    }

    // Draw circle
    function drawCircle(startX, startY, endX, endY) {
      if (!ctx) return;
      
      const radius = Math.sqrt(Math.pow(endX - startX, 2) + Math.pow(endY - startY, 2));
      
      ctx.beginPath();
      ctx.arc(startX, startY, radius, 0, Math.PI * 2);
      ctx.stroke();
    }

    // Draw square
    function drawSquare(startX, startY, endX, endY) {
      if (!ctx) return;
      
      const size = Math.max(Math.abs(endX - startX), Math.abs(endY - startY));
      
      const dirX = endX >= startX ? 1 : -1;
      const dirY = endY >= startY ? 1 : -1;
      
      ctx.beginPath();
      ctx.rect(startX, startY, size * dirX, size * dirY);
      ctx.stroke();
    }

    // Draw line
    function drawLine(startX, startY, endX, endY) {
      if (!ctx) return;
      
      ctx.beginPath();
      ctx.moveTo(startX, startY);
      ctx.lineTo(endX, endY);
      ctx.stroke();
    }

    // Start drawing
    function startDrawing(e) {
      if (!ctx || !canvas) return;
      
      const rect = canvas.getBoundingClientRect();
      let x, y;
      
      if (e.touches) {
        x = e.touches[0].clientX - rect.left;
        y = e.touches[0].clientY - rect.top;
      } else {
        x = e.clientX - rect.left;
        y = e.clientY - rect.top;
      }
      
      const scaleX = canvas.width / rect.width;
      const scaleY = canvas.height / rect.height;
      
      x *= scaleX;
      y *= scaleY;
      
      if (currentTool === "fill") {
        floodFill(x, y, currentColor);
        return;
      }
      
      if (currentTool === "circle" || currentTool === "square" || currentTool === "line") {
        startPoint = { x, y };
        
        canvasSnapshot = ctx.getImageData(0, 0, canvas.width, canvas.height);
        
        ctx.strokeStyle = currentColor;
        ctx.lineWidth = lineWidth;
        
        isDrawing = true;
        return;
      }
      
      isDrawing = true;
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.strokeStyle = currentTool === "brush" ? currentColor : "#FFFFFF";
      ctx.lineWidth = currentTool === "eraser" ? eraserSize : lineWidth;
    }

    // Draw
    function draw(e) {
      if (!ctx || !canvas || !isDrawing) return;
      
      e.preventDefault();
      
      const rect = canvas.getBoundingClientRect();
      let x, y;
      
      if (e.touches) {
        x = e.touches[0].clientX - rect.left;
        y = e.touches[0].clientY - rect.top;
      } else {
        x = e.clientX - rect.left;
        y = e.clientY - rect.top;
      }
      
      const scaleX = canvas.width / rect.width;
      const scaleY = canvas.height / rect.height;
      
      x *= scaleX;
      y *= scaleY;
      
      if ((currentTool === "circle" || currentTool === "square" || currentTool === "line") && startPoint && canvasSnapshot) {
        ctx.putImageData(canvasSnapshot, 0, 0);
        
        if (currentTool === "circle") {
          drawCircle(startPoint.x, startPoint.y, x, y);
        } else if (currentTool === "square") {
          drawSquare(startPoint.x, startPoint.y, x, y);
        } else if (currentTool === "line") {
          drawLine(startPoint.x, startPoint.y, x, y);
        }
        
        return;
      }

      ctx.lineTo(x, y);
      ctx.stroke();
    }

    // Stop drawing
    function stopDrawing() {
      if (!ctx) return;

      startPoint = null;
      canvasSnapshot = null;
      
      isDrawing = false;
      ctx.closePath();
    }

    // Clear canvas
    function clearCanvas() {
      if (!ctx || !canvas) return;
      
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      selectedOutline = null;
      
      document.querySelectorAll(".thumbnail").forEach(thumb => {
        thumb.classList.remove("selected");
      });
      
      playAudio("Limpar tudo");
    }

    // Share drawing
    function shareDrawing() {
      if (!canvas) return;
      
      try {
        setTimeout(() => {
          const tempCanvas = document.createElement('canvas');
          const tempCtx = tempCanvas.getContext('2d');
          
          if (!tempCtx) return;
          
          tempCanvas.width = canvas.width;
          tempCanvas.height = canvas.height;
          
          tempCtx.fillStyle = '#FFFFFF';
          tempCtx.fillRect(0, 0, tempCanvas.width, tempCanvas.height);
          
          tempCtx.drawImage(canvas, 0, 0);
          
          tempCanvas.toBlob((blob) => {
            if (!blob) {
              console.error("Não foi possível criar o blob da imagem");
              downloadDrawing();
              return;
            }
            
            const file = new File([blob], "meu-desenho.png", { type: "image/png" });
            
            if (navigator.share && navigator.canShare && navigator.canShare({ files: [file] })) {
              navigator.share({
                title: "Meu Desenho",
                text: "Veja o desenho que eu fiz no app Alysson Lira!",
                files: [file]
              })
              .then(() => playAudio("Desenho compartilhado"))
              .catch(error => {
                console.error("Erro ao compartilhar:", error);
                downloadDrawing();
              });
            } else if (navigator.share) {
              navigator.share({
                title: "Meu Desenho",
                text: "Veja o desenho que eu fiz no app Alysson Lira!"
              })
              .then(() => playAudio("Link compartilhado"))
              .catch(error => {
                console.error("Erro ao compartilhar:", error);
                downloadDrawing();
              });
            } else {
              downloadDrawing();
            }
          }, "image/png", 1.0);
        }, 100);
      } catch (error) {
        console.error("Erro ao compartilhar:", error);
        downloadDrawing();
      }
    }

    // Download drawing
    function downloadDrawing() {
      if (!canvas) return;
      
      const tempCanvas = document.createElement('canvas');
      const tempCtx = tempCanvas.getContext('2d');
      
      if (!tempCtx) return;
      
      tempCanvas.width = canvas.width;
      tempCanvas.height = canvas.height;
      
      tempCtx.fillStyle = '#FFFFFF';
      tempCtx.fillRect(0, 0, tempCanvas.width, tempCanvas.height);
      
      tempCtx.drawImage(canvas, 0, 0);
      
      const link = document.createElement("a");
      link.download = "meu-desenho.png";
      
      link.href = tempCanvas.toDataURL("image/png", 1.0);
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      playAudio("Desenho salvo");
    }

    // Render SVG
    function renderSVGDirectly(svgData) {
      if (!ctx || !canvas) return;
      
      loadingEl.style.display = "flex";
      
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      const parser = new DOMParser();
      const svgDoc = parser.parseFromString(svgData, "image/svg+xml");
      
      const svgElement = svgDoc.querySelector("svg");
      let viewBox = { x: 0, y: 0, width: 200, height: 200 };
      
      if (svgElement && svgElement.getAttribute("viewBox")) {
        const viewBoxAttr = svgElement.getAttribute("viewBox").split(" ").map(Number);
        viewBox = {
          x: viewBoxAttr[0] || 0,
          y: viewBoxAttr[1] || 0,
          width: viewBoxAttr[2] || 200,
          height: viewBoxAttr[3] || 200
        };
      }
      
      const paths = svgDoc.querySelectorAll("path, circle, rect, ellipse");
      
      ctx.save();
      
      ctx.strokeStyle = "black";
      ctx.lineWidth = 2;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      
      const svgRatio = viewBox.width / viewBox.height;
      
      const targetWidth = canvas.width * 0.9;
      const targetHeight = targetWidth / svgRatio;

      let finalWidth = targetWidth;
      let finalHeight = targetHeight;

      if (targetHeight > canvas.height * 0.9) {
        finalHeight = canvas.height * 0.9;
        finalWidth = finalHeight * svgRatio;
      }
      
      const scale = finalWidth / viewBox.width;
      const offsetX = (canvas.width - finalWidth) / 2;
      const offsetY = (canvas.height - finalHeight) / 2;
      
      ctx.translate(offsetX, offsetY);
      ctx.scale(scale, scale);
      
      paths.forEach(path => {
        if (path.tagName === "path") {
          const d = path.getAttribute("d");
          if (d) {
            drawSVGPath(d);
          }
        } else if (path.tagName === "circle") {
          const cx = parseFloat(path.getAttribute("cx") || "0");
          const cy = parseFloat(path.getAttribute("cy") || "0");
          const r = parseFloat(path.getAttribute("r") || "0");
          ctx.beginPath();
          ctx.arc(cx, cy, r, 0, Math.PI * 2);
          ctx.stroke();
        } else if (path.tagName === "rect") {
          const x = parseFloat(path.getAttribute("x") || "0");
          const y = parseFloat(path.getAttribute("y") || "0");
          const width = parseFloat(path.getAttribute("width") || "0");
          const height = parseFloat(path.getAttribute("height") || "0");
          ctx.strokeRect(x, y, width, height);
        } else if (path.tagName === "ellipse") {
          const cx = parseFloat(path.getAttribute("cx") || "0");
          const cy = parseFloat(path.getAttribute("cy") || "0");
          const rx = parseFloat(path.getAttribute("rx") || "0");
          const ry = parseFloat(path.getAttribute("ry") || "0");
          drawEllipse(cx, cy, rx, ry);
        }
      });
      
      ctx.restore();
      
      loadingEl.style.display = "none";
    }

    // Draw SVG path
    function drawSVGPath(d) {
      const commands = d.match(/[a-df-z][^a-df-z]*/gi) || [];
      let currentX = 0;
      let currentY = 0;
      
      ctx.beginPath();
      
      commands.forEach(cmd => {
        const type = cmd[0];
        const args = cmd.slice(1).trim().split(/[\s,]+/).map(parseFloat);
        
        switch (type) {
          case "M":
            currentX = args[0];
            currentY = args[1];
            ctx.moveTo(currentX, currentY);
            break;
          case "L":
            currentX = args[0];
            currentY = args[1];
            ctx.lineTo(currentX, currentY);
            break;
          case "C":
            ctx.bezierCurveTo(args[0], args[1], args[2], args[3], args[4], args[5]);
            currentX = args[4];
            currentY = args[5];
            break;
          case "Q":
            ctx.quadraticCurveTo(args[0], args[1], args[2], args[3]);
            currentX = args[2];
            currentY = args[3];
            break;
          case "Z":
            ctx.closePath();
            break;
        }
      });
      
      ctx.stroke();
    }

    // Draw ellipse
    function drawEllipse(cx, cy, rx, ry) {
      ctx.beginPath();
      ctx.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2);
      ctx.stroke();
    }

    // Play audio
    function playAudio(text) {
      const now = Date.now();
      if (lastAudio.text === text && now - lastAudio.timestamp < 500) {
        return;
      }
      
      lastAudio = { text, timestamp: now };
      
      if ("speechSynthesis" in window) {
        window.speechSynthesis.cancel();
        
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = "pt-BR";
        speechSynthesis.speak(utterance);
      }
    }

    // Add event listeners
    function addEventListeners() {
      canvas.addEventListener("mousedown", startDrawing);
      canvas.addEventListener("mousemove", draw);
      canvas.addEventListener("mouseup", stopDrawing);
      canvas.addEventListener("mouseleave", stopDrawing);
      
      canvas.addEventListener("touchstart", startDrawing, { passive: false });
      canvas.addEventListener("touchmove", draw, { passive: false });
      canvas.addEventListener("touchend", stopDrawing);
      
      document.addEventListener("click", (e) => {
        if (thicknessPopupVisible) {
          if (!thicknessPopup.contains(e.target) && e.target !== thicknessBtn) {
            hideThicknessPopup();
          }
        }
      });
    }

    // Initialize app
    function init() {
      initCanvas();
      initThumbnails();
      initColors();
      initTools();
      addEventListeners();
    }

    // Start the app
    init();
  </script>
</body>
</html>
    `)

      downloadLink.download = "alysson-lira-app-de-desenho.html"
      document.body.appendChild(downloadLink)
      downloadLink.click()
      document.body.removeChild(downloadLink)

      alert("Versão mobile baixada com sucesso!")
    } catch (error) {
      console.error("Erro ao baixar versão mobile:", error)
      alert("Erro ao baixar a versão mobile. Por favor, tente novamente.")
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[80%] max-h-[90vh] overflow-y-auto w-[95%]">
        {/* Modifique a seção do título do painel administrativo para incluir o botão de download mobile */}
        <DialogHeader>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-2">
            <h3 className="text-lg font-medium">Painel Administrativo</h3>
            <div className="flex gap-2 w-full sm:w-auto">
              <Button
                variant="outline"
                onClick={downloadMobileVersion}
                className="flex items-center gap-2 bg-gradient-to-r from-purple-500 to-indigo-500 text-white hover:from-purple-600 hover:to-indigo-600 w-full sm:w-auto text-xs sm:text-sm"
              >
                <Smartphone className="h-4 w-4" /> Baixar Versão Mobile
              </Button>
              <Button variant="ghost" size="icon" onClick={() => setShowAddForm(false)} className="ml-auto">
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
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

              <Tabs defaultValue="svg" value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="svg">Código SVG</TabsTrigger>
                  <TabsTrigger value="image">Imagem (PNG/JPG)</TabsTrigger>
                </TabsList>

                <TabsContent value="svg" className="mt-4 w-full">
                  <div className="grid w-full items-center gap-1.5">
                    <Label htmlFor="svg">Código SVG</Label>
                    <Textarea
                      id="svg"
                      value={newOutlineSvg}
                      onChange={(e) => setNewOutlineSvg(e.target.value)}
                      placeholder="Cole o código SVG aqui..."
                      className="min-h-[150px] sm:min-h-[200px] font-mono text-sm"
                    />
                  </div>
                </TabsContent>

                <TabsContent value="image" className="mt-4 w-full">
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
                      <div className="relative w-full h-[150px] sm:h-[200px] border rounded-md overflow-hidden">
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

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
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

