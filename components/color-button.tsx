"use client"

import { Button } from "@/components/ui/button"

interface ColorButtonProps {
  color: string
  name: string
  isSelected: boolean
  onClick: () => void
}

export default function ColorButton({ color, name, isSelected, onClick }: ColorButtonProps) {
  return (
    <Button
      variant="outline"
      className={`h-14 w-14 p-1 rounded-full transition-all hover:scale-110 ${
        isSelected ? "ring-4 ring-purple-500 shadow-lg scale-110" : "shadow-md"
      }`}
      onClick={onClick}
      title={name}
    >
      <span
        className="block w-full h-full rounded-full"
        style={{
          backgroundColor: color,
          boxShadow: "inset 0 2px 4px rgba(0,0,0,0.1)",
        }}
      />
      <span className="sr-only">{name}</span>
    </Button>
  )
}

