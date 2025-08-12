"use client"

import Image from "next/image"
import { Button } from "@/components/ui/button"
import { LogOut, User } from "lucide-react"
import { componentStyles } from "@/styles"

interface HeaderProps {
  user?: {
    name: string
    role: string
  }
  onLogout?: () => void
}

export function Header({ user, onLogout }: HeaderProps) {
  return (
    <header className={componentStyles.header.container}>
      <div className={componentStyles.header.content}>
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-4">
            <Image
              src="/images/hvq-logo.png"
              alt="Hospital Vozandes Quito"
              width={120}
              height={40}
              className={componentStyles.header.logo}
            />
            <div className="hidden md:block">
              <h1 className={componentStyles.header.title}>Sistema de Agendas Médicas</h1>
            </div>
          </div>

          {user && (
            <div className="flex items-center space-x-4">
              <div className={componentStyles.header.userInfo}>
                <User className="h-4 w-4" />
                <span>{user.name}</span>
                <span className={componentStyles.header.userRole}>
                  {user.role.toUpperCase()}
                </span>
              </div>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={onLogout} 
                className="text-gray-600 hover:text-[#8B1538]"
              >
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
