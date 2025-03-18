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
      className={`h-14 w-14 p-1 rounded-full ${isSelected ? "ring-4 ring-primary" : ""}`}
      onClick={onClick}
      title={name}
    >
      <span className="block w-full h-full rounded-full" style={{ backgroundColor: color }} />
      <span className="sr-only">{name}</span>
    </Button>
  )
}

