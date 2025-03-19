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
        "w-12 h-12 bg-white rounded-lg overflow-hidden cursor-pointer flex items-center justify-center p-1 border-2",
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

