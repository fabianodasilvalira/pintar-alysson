"use client"

import { useState, useEffect } from "react"
import Image from "next/image"

interface ImageThumbnailProps {
  svgData?: string
  imageUrl?: string
  name: string
  isSelected: boolean
  onClick: () => void
}

export default function ImageThumbnail({ svgData, imageUrl, name, isSelected, onClick }: ImageThumbnailProps) {
  const [error, setError] = useState(false)

  // Reset error state if props change
  useEffect(() => {
    setError(false)
  }, [svgData, imageUrl])

  const handleImageError = () => {
    setError(true)
  }

  return (
    <div
      className={`h-12 w-12 bg-white rounded-md overflow-hidden cursor-pointer flex items-center justify-center p-1 border-2 transition-all ${
        isSelected ? "border-purple-500 scale-110 shadow-md" : "border-transparent"
      }`}
      onClick={onClick}
      title={name}
    >
      {svgData ? (
        <div dangerouslySetInnerHTML={{ __html: svgData }} className="w-full h-full" aria-label={name} />
      ) : imageUrl && !error ? (
        <div className="relative w-full h-full">
          <Image
            src={imageUrl || "/placeholder.svg"}
            alt={name}
            fill
            className="object-contain"
            onError={handleImageError}
          />
        </div>
      ) : (
        <div className="w-full h-full flex items-center justify-center text-xs text-gray-400">
          {name.substring(0, 2)}
        </div>
      )}
    </div>
  )
}

