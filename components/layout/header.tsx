"use client"

import Image from "next/image"
import { Button } from "@/components/ui/button"
import { LogOut, User } from "lucide-react"

interface HeaderProps {
  user?: {
    name: string
    role: string
  }
  onLogout?: () => void
}

export function Header({ user, onLogout }: HeaderProps) {
  return (
    <header className="bg-white border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-4">
            <Image
              src="/images/hvq-logo.png"
              alt="Hospital Vozandes Quito"
              width={120}
              height={40}
              className="h-10 w-auto"
            />
            <div className="hidden md:block">
              <h1 className="text-lg font-semibold text-[#8B1538]">Sistema de Agendas Médicas</h1>
            </div>
          </div>

          {user && (
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 text-sm text-gray-700">
                <User className="h-4 w-4" />
                <span>{user.name}</span>
                <span className="text-xs border border-gray-300 text-gray-600 px-2 py-1 rounded">
                  {user.role.toUpperCase()}
                </span>
              </div>
              <Button variant="ghost" size="sm" onClick={onLogout} className="text-gray-600 hover:text-[#8B1538]">
                <LogOut className="h-4 w-4 mr-2" />
                Salir
              </Button>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
