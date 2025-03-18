"use client"

import { Card, CardContent } from "@/components/ui/card"

interface OutlineDrawingProps {
  src?: string
  svgData?: string
  name: string
  onClick: () => void
}

export default function OutlineDrawing({ src, svgData, name, onClick }: OutlineDrawingProps) {
  return (
    <Card className="cursor-pointer hover:scale-105 transition-transform" onClick={onClick}>
      <CardContent className="p-4 flex flex-col items-center">
        <div className="relative w-full aspect-square bg-white rounded-md overflow-hidden flex items-center justify-center p-2">
          {svgData ? (
            <div dangerouslySetInnerHTML={{ __html: svgData }} className="w-full h-full" />
          ) : (
            <div className="text-center text-muted-foreground">{name}</div>
          )}
        </div>
        <p className="mt-2 text-center font-medium">{name}</p>
      </CardContent>
    </Card>
  )
}

