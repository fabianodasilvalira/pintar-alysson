"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden"; // Import necessário para esconder o título visualmente

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLogin: (success: boolean) => void;
}

export default function LoginModal({ isOpen, onClose, onLogin }: LoginModalProps) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleLogin = () => {
    // Check credentials
    if (username === "Admin" && password === "admin123") {
      onLogin(true);
      onClose();
    } else {
      setError("Credenciais inválidas. Tente novamente.");
      onLogin(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px] bg-gradient-to-b from-purple-50 to-blue-50 rounded-xl">
        <DialogHeader>
          {/* Se quiser esconder o título, use o VisuallyHidden */}
          <VisuallyHidden>
            <DialogTitle>Acesso Administrativo</DialogTitle>
          </VisuallyHidden>
          <DialogDescription>Entre com suas credenciais para acessar o painel administrativo.</DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          {error && <p className="text-sm font-medium text-destructive bg-red-50 p-2 rounded-md">{error}</p>}
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="username" className="text-right text-purple-700">
              Usuário
            </Label>
            <Input
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="col-span-3 border-purple-200 focus:border-purple-400"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="password" className="text-right text-purple-700">
              Senha
            </Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="col-span-3 border-purple-200 focus:border-purple-400"
            />
          </div>
        </div>
        <DialogFooter>
          <Button
            type="submit"
            onClick={handleLogin}
            className="bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-600 hover:to-indigo-600"
          >
            Entrar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
