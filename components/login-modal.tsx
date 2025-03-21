"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogDescription, DialogHeader } from "@/components/ui/dialog"

interface LoginModalProps {
  isOpen: boolean
  onClose: () => void
  onLogin: (success: boolean) => void
}

export default function LoginModal({ isOpen, onClose, onLogin }: LoginModalProps) {
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")

  const handleLogin = () => {
    if (username === "fabiano" && password === "123456") {
      onLogin(true)
      onClose()
    } else {
      setError("Usuário ou senha incorretos.")
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <h3 className="text-lg font-medium">Login Administrativo</h3>
          <DialogDescription>Insira suas credenciais para acessar o painel administrativo.</DialogDescription>
        </DialogHeader>
        {error && <p className="text-sm font-medium text-destructive mb-4">{error}</p>}
        <div className="grid gap-4 py-4">
          <div className="grid w-full items-center gap-1.5">
            <Label htmlFor="username">Usuário</Label>
            <Input type="text" id="username" value={username} onChange={(e) => setUsername(e.target.value)} />
          </div>
          <div className="grid w-full items-center gap-1.5">
            <Label htmlFor="password">Senha</Label>
            <Input type="password" id="password" value={password} onChange={(e) => setPassword(e.target.value)} />
          </div>
        </div>
        <Button onClick={handleLogin}>Entrar</Button>
      </DialogContent>
    </Dialog>
  )
}

