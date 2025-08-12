"use client"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Calendar } from "lucide-react"
import { componentStyles } from "@/styles"
import type { Doctor } from "@/lib/types"

interface DoctorCardProps {
  doctor: Doctor
  onViewSchedule: (doctorId: string) => void
  className?: string
}

export function DoctorCard({ doctor, onViewSchedule, className }: DoctorCardProps) {
  return (
    <div className={`${componentStyles.doctorsList.doctorCard} ${className || ''}`}>
      <div className="flex-1">
        <div className="flex items-center space-x-3">
          <div>
            <h3 className={componentStyles.doctorsList.doctorName}>{doctor.name}</h3>
            <p className={componentStyles.doctorsList.doctorSpecialty}>{doctor.specialty}</p>
          </div>
          <Badge variant={doctor.isActive ? "default" : "secondary"} className="ml-2">
            {doctor.isActive ? "Activo" : "Inactivo"}
          </Badge>
        </div>
        <div className={componentStyles.doctorsList.doctorInfo}>
          <span>{doctor.email}</span>
          <span>{doctor.phone}</span>
        </div>
      </div>
      <Button
        variant="outline"
        size="sm"
        onClick={() => onViewSchedule(doctor.id)}
        className={componentStyles.doctorsList.viewButton}
      >
        <Calendar className="h-4 w-4 mr-2" />
        Ver Horarios
      </Button>
    </div>
  )
} 