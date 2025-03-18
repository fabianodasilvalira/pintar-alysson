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
        "w-14 h-14 bg-white rounded-md overflow-hidden cursor-pointer flex items-center justify-center p-1 border-2",
        isSelected ? "border-primary" : "border-transparent hover:border-primary/50",
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

