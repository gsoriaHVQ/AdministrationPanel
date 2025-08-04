"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar, Clock } from "lucide-react"

interface ScheduleFormProps {
  onSubmit: (scheduleData: any) => void
  doctors: Array<{ id: string; name: string; specialty: string }>
}

export function ScheduleForm({ onSubmit, doctors }: ScheduleFormProps) {
  const [formData, setFormData] = useState({
    doctorId: "",
    specialty: "",
    location: "",
    office: "",
    weekDays: [],
    startTime: "",
    endTime: "",
  })

  const specialties = [
    "Cardiología",
    "Dermatología",
    "Endocrinología",
    "Gastroenterología",
    "Ginecología",
    "Neurología",
    "Oftalmología",
    "Ortopedia",
    "Pediatría",
    "Psiquiatría",
    "Radiología",
    "Urología",
  ]

  const locations = [
    "Hospital Principal",
    "Consulta Externa",
    "Centro Médico Norte",
    "Centro Médico Sur",
    "Unidad de Emergencias",
  ]

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit(formData)
  }

  const handleDoctorChange = (doctorId: string) => {
    const doctor = doctors.find((d) => d.id === doctorId)
    setFormData((prev) => ({
      ...prev,
      doctorId,
      specialty: doctor?.specialty || "",
    }))
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-[#8B1538]">Gestión de Agendas</h2>
        <p className="text-gray-600">Configure los horarios de atención médica</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Calendar className="h-5 w-5 text-[#8B1538]" />
            <span>Nueva Agenda</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="doctor">Médico</Label>
                <Select onValueChange={handleDoctorChange} required>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar médico" />
                  </SelectTrigger>
                  <SelectContent>
                    {doctors.map((doctor) => (
                      <SelectItem key={doctor.id} value={doctor.id}>
                        {doctor.name} - {doctor.specialty}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="specialty">Especialidad</Label>
                <Select
                  value={formData.specialty}
                  onValueChange={(value) => setFormData((prev) => ({ ...prev, specialty: value }))}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar especialidad" />
                  </SelectTrigger>
                  <SelectContent>
                    {specialties.map((specialty) => (
                      <SelectItem key={specialty} value={specialty}>
                        {specialty}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="location">Localidad</Label>
                <Select onValueChange={(value) => setFormData((prev) => ({ ...prev, location: value }))} required>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar localidad" />
                  </SelectTrigger>
                  <SelectContent>
                    {locations.map((location) => (
                      <SelectItem key={location} value={location}>
                        {location}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="office">Consultorio</Label>
                <Input
                  id="office"
                  placeholder="Ej: Consultorio 201"
                  value={formData.office}
                  onChange={(e) => setFormData((prev) => ({ ...prev, office: e.target.value }))}
                  required
                />
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label>Días de la Semana</Label>
                <div className="grid grid-cols-7 gap-2">
                  {["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"].map((day, index) => (
                    <label key={day} className="cursor-pointer">
                      <input
                        type="checkbox"
                        className="sr-only"
                        onChange={(e) => {
                          const days = formData.weekDays || []
                          if (e.target.checked) {
                            setFormData((prev) => ({ ...prev, weekDays: [...days, index] }))
                          } else {
                            setFormData((prev) => ({ ...prev, weekDays: days.filter((d) => d !== index) }))
                          }
                        }}
                      />
                      <div
                        className={`
          border-2 rounded-lg p-3 text-center transition-all duration-200
          ${
            (formData.weekDays || []).includes(index)
              ? "border-[#8B1538] bg-[#8B1538] text-white"
              : "border-gray-200 bg-white text-gray-700 hover:border-gray-300"
          }
        `}
                      >
                        <span className="text-sm font-medium">{day}</span>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Label>Horario</Label>
                <div className="flex space-x-2">
                  <div className="flex-1">
                    <Input
                      type="time"
                      placeholder="Hora inicio"
                      value={formData.startTime}
                      onChange={(e) => setFormData((prev) => ({ ...prev, startTime: e.target.value }))}
                      required
                    />
                  </div>
                  <div className="flex-1">
                    <Input
                      type="time"
                      placeholder="Hora fin"
                      value={formData.endTime}
                      onChange={(e) => setFormData((prev) => ({ ...prev, endTime: e.target.value }))}
                      required
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end space-x-4">
              <Button type="button" variant="outline">
                Cancelar
              </Button>
              <Button type="submit" className="bg-[#8B1538] hover:bg-[#6B1028] text-white">
                <Clock className="h-4 w-4 mr-2" />
                Crear Agenda
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
