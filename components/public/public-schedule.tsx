"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Calendar, Clock, MapPin, Building, Filter, Search } from "lucide-react"
import type { Schedule } from "@/lib/types"

interface PublicScheduleProps {
  schedules: Schedule[]
}

export function PublicSchedule({ schedules }: PublicScheduleProps) {
  const [selectedSpecialty, setSelectedSpecialty] = useState<string>("all")
  const [selectedWeekDay, setSelectedWeekDay] = useState<string>("all")

  const specialties = [...new Set(schedules.map((s) => s.specialty))].sort()

  const filteredSchedules = schedules.filter((schedule) => {
    const matchesSpecialty = selectedSpecialty === "all" || schedule.specialty === selectedSpecialty
    const matchesWeekDay = selectedWeekDay === "all" || new Date(schedule.date).getDay().toString() === selectedWeekDay
    return matchesSpecialty && matchesWeekDay && schedule.isAvailable
  })

  const formatTime = (time: string) => {
    return new Date(`2000-01-01T${time}`).toLocaleTimeString("es-ES", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    })
  }

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString("es-ES", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-[#8B1538] mb-2">Consulta de Agendas Médicas</h1>
        <p className="text-gray-600">Hospital Vozandes Quito - Consulte los horarios disponibles</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Filter className="h-5 w-5 text-[#8B1538]" />
            <span>Filtros de Búsqueda</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Especialidad</label>
              <Select value={selectedSpecialty} onValueChange={setSelectedSpecialty}>
                <SelectTrigger>
                  <SelectValue placeholder="Todas las especialidades" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas las especialidades</SelectItem>
                  {specialties.map((specialty) => (
                    <SelectItem key={specialty} value={specialty}>
                      {specialty}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Día de la Semana</label>
              <Select value={selectedWeekDay} onValueChange={setSelectedWeekDay}>
                <SelectTrigger>
                  <SelectValue placeholder="Todos los días" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los días</SelectItem>
                  <SelectItem value="0">Lunes</SelectItem>
                  <SelectItem value="1">Martes</SelectItem>
                  <SelectItem value="2">Miércoles</SelectItem>
                  <SelectItem value="3">Jueves</SelectItem>
                  <SelectItem value="4">Viernes</SelectItem>
                  <SelectItem value="5">Sábado</SelectItem>
                  <SelectItem value="6">Domingo</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4">
        {filteredSchedules.length === 0 ? (
          <Card>
            <CardContent className="text-center py-8">
              <Search className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p className="text-gray-500">No se encontraron horarios disponibles con los filtros seleccionados</p>
            </CardContent>
          </Card>
        ) : (
          filteredSchedules.map((schedule) => (
            <Card key={schedule.id} className="border border-gray-100">
              <CardContent className="p-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between space-y-4 md:space-y-0">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900">Dr. {schedule.doctorName}</h3>
                      <Badge className="bg-[#8B1538] text-white">{schedule.specialty}</Badge>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
                      <div className="flex items-center space-x-2">
                        <Calendar className="h-4 w-4 text-[#8B1538]" />
                        <span>{formatDate(schedule.date)}</span>
                      </div>

                      <div className="flex items-center space-x-2">
                        <Clock className="h-4 w-4 text-[#8B1538]" />
                        <span>
                          {formatTime(schedule.startTime)} - {formatTime(schedule.endTime)}
                        </span>
                      </div>

                      <div className="flex items-center space-x-2">
                        <MapPin className="h-4 w-4 text-[#8B1538]" />
                        <span>{schedule.location}</span>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2 mt-2 text-sm text-gray-600">
                      <Building className="h-4 w-4 text-[#8B1538]" />
                      <span>{schedule.office}</span>
                    </div>
                  </div>

                  <div className="flex items-center">
                    <Badge variant="outline" className="border-green-500 text-green-700">
                      Disponible
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      <div className="text-center text-sm text-gray-500 mt-8">
        <p>Para agendar citas, comuníquese al teléfono del hospital</p>
        <p className="font-medium">Hospital Vozandes Quito - Sistema de Consulta Pública</p>
      </div>
    </div>
  )
}
