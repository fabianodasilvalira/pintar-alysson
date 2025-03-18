"use client"

import { cn } from "@/lib/utils"
import Image from "next/image"

interface ImageThumbnailProps {
  svgData?: string
  imageUrl?: string
  name: string
  isSelected: boolean
  onClick: () => void
}

export default function ImageThumbnail({ svgData, imageUrl, name, isSelected, onClick }: ImageThumbnailProps) {
  return (
    <div
      className={cn(
        "w-16 h-16 bg-white rounded-xl overflow-hidden cursor-pointer flex items-center justify-center p-1 border-2 transition-all hover:scale-105",
        isSelected ? "border-purple-500 shadow-lg scale-110" : "border-transparent hover:border-purple-300 shadow-md",
      )}
      onClick={onClick}
      title={name}
    >
      {svgData ? (
        <div dangerouslySetInnerHTML={{ __html: svgData }} className="w-full h-full" />
      ) : imageUrl ? (
        <div className="relative w-full h-full">
          <Image src={imageUrl || "/placeholder.svg"} alt={name} fill className="object-contain" />
        </div>
      ) : (
        <div className="text-xs text-center text-muted-foreground">{name}</div>
      )}
      <span className="sr-only">{name}</span>
    </div>
  )
}

