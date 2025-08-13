"use client"

import { useState, useEffect, type ReactNode } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Calendar, Clock, Edit, Plus, Save, X, MapPin, Building, User } from "lucide-react"

interface ScheduleFormProps {
  onSubmit: (scheduleData: any) => void
  doctors: Array<{ id: string; name: string; specialty: string }>
  existingSchedules?: Array<{
    id: string
    doctorId: string
    specialty: string
    location: string
    office: string
    weekDays: number[]
    startTime: string
    endTime: string
    isAvailable: boolean
  }>
}

export function ScheduleForm({ onSubmit, doctors, existingSchedules }: ScheduleFormProps) {
  const [selectedDoctorId, setSelectedDoctorId] = useState("")
  const [doctorSchedules, setDoctorSchedules] = useState<any[]>([])
  const [editingField, setEditingField] = useState<{
    scheduleId: string
    field: string
    value: any
  } | null>(null)

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

  const dayNames = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"]

  // Datos quemados (mock) para fase inicial
  const mockDoctors: Array<{ id: string; name: string; specialty: string }> = [
    { id: "d1", name: "María González", specialty: "Cardiología" },
    { id: "d2", name: "Carlos Mendoza", specialty: "Neurología" },
    { id: "d3", name: "Ana Torres", specialty: "Dermatología" },
  ]

  const mockSchedules: Array<{
    id: string
    doctorId: string
    specialty: string
    location: string
    office: string
    weekDays: number[]
    startTime: string
    endTime: string
    isAvailable: boolean
  }> = [
    {
      id: "s1",
      doctorId: "d1",
      specialty: "Cardiología",
      location: "Hospital Principal",
      office: "Consultorio 201",
      weekDays: [0, 2, 4],
      startTime: "08:00",
      endTime: "12:00",
      isAvailable: true,
    },
    {
      id: "s2",
      doctorId: "d2",
      specialty: "Neurología",
      location: "Consulta Externa",
      office: "Consultorio 305",
      weekDays: [1, 3],
      startTime: "14:00",
      endTime: "18:00",
      isAvailable: false,
    },
  ]

  // En modo mock forzamos usar doctores quemados
  const doctorsToUse = mockDoctors

  // Pre-seleccionar el primer médico mock para mostrar una agenda por defecto
  useEffect(() => {
    if (!selectedDoctorId && doctorsToUse.length > 0) {
      setSelectedDoctorId(doctorsToUse[0].id)
    }
  }, [selectedDoctorId, doctorsToUse])

  const areSchedulesEqual = (a: any[], b: any[]) => {
    if (a === b) return true
    if (a.length !== b.length) return false
    for (let i = 0; i < a.length; i++) {
      if (a[i]?.id !== b[i]?.id) return false
    }
    return true
  }

  // Cargar agendas del médico seleccionado y resetear edición
  useEffect(() => {
    if (selectedDoctorId) {
      const source = mockSchedules
      const schedules = source.filter((s) => s.doctorId === selectedDoctorId)
      setDoctorSchedules((prev) => (areSchedulesEqual(prev, schedules) ? prev : schedules))
    } else {
      setDoctorSchedules((prev) => (prev.length === 0 ? prev : []))
    }
    if (editingField !== null) setEditingField(null)
  }, [selectedDoctorId, existingSchedules])

  const handleDoctorChange = (doctorId: string) => {
    if (doctorId !== selectedDoctorId) {
      setSelectedDoctorId(doctorId)
      if (editingField !== null) setEditingField(null)
    }
  }

  const formatTime = (time?: string) => {
    if (!time || typeof time !== "string" || time.trim().length === 0) return "—"
    const date = new Date(`2000-01-01T${time}`)
    if (Number.isNaN(date.getTime())) return "—"
    return date.toLocaleTimeString("es-ES", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    })
  }

  const handleFieldEdit = (scheduleId: string, field: string, currentValue: any) => {
    setEditingField({
      scheduleId,
      field,
      value: currentValue,
    })
  }

  const handleFieldSave = () => {
    if (!editingField) return

    const normalizedValue =
      editingField.field === "weekDays"
        ? Array.from(new Set<number>(editingField.value || []))
        : editingField.value

    const updatedSchedule = {
      scheduleId: editingField.scheduleId,
      field: editingField.field,
      value: normalizedValue,
      action: "updateField",
    }

    onSubmit(updatedSchedule)
    setEditingField(null)
  }

  const handleFieldCancel = () => {
    setEditingField(null)
  }

  const handleAddNewSchedule = () => {
    const doctor = doctorsToUse.find((d) => d.id === selectedDoctorId)
    const newSchedule = {
      doctorId: selectedDoctorId,
      doctorName: doctor?.name || "",
      specialty: doctor?.specialty || "",
      location: "",
      office: "",
      weekDays: [],
      startTime: "",
      endTime: "",
      action: "create",
    }
    onSubmit(newSchedule)
  }

  const EditableField = ({
    scheduleId,
    field,
    value,
    displayValue,
    type = "text",
    options = null,
  }: {
    scheduleId: string
    field: string
    value: any
    displayValue: ReactNode
    type?: "text" | "time" | "select" | "multiselect"
    options?: string[] | null
  }) => {
    const isEditing = editingField?.scheduleId === scheduleId && editingField?.field === field

    if (isEditing) {
      return (
        <div className="flex items-center space-x-2">
          {type === "select" && options ? (
            <Select
              value={(editingField.value ?? undefined) as string | undefined}
              onValueChange={(newValue) => setEditingField((prev) => (prev ? { ...prev, value: newValue } : null))}
            >
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {options.map((option) => (
                  <SelectItem key={option} value={option}>
                    {option}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          ) : type === "multiselect" ? (
            <div className="flex flex-wrap gap-1 max-w-xs">
              {dayNames.map((day, index) => (
                <label key={day} className="cursor-pointer">
                  <input
                    type="checkbox"
                    className="sr-only"
                    checked={(editingField.value || []).includes(index)}
                    onChange={(e) => {
                      const days = editingField.value || []
                      const newDays = e.target.checked ? [...days, index] : days.filter((d: number) => d !== index)
                      setEditingField((prev) => (prev ? { ...prev, value: newDays } : null))
                    }}
                  />
                  <div
                    className={`
                    px-2 py-1 text-xs rounded border transition-colors
                    ${
                      (editingField.value || []).includes(index)
                        ? "bg-[#8B1538] text-white border-[#8B1538]"
                        : "bg-white text-gray-700 border-gray-300 hover:border-gray-400"
                    }
                  `}
                  >
                    {day}
                  </div>
                </label>
              ))}
            </div>
          ) : (
            <Input
              type={type}
              value={editingField.value ?? ""}
              onChange={(e) => setEditingField((prev) => (prev ? { ...prev, value: e.target.value } : null))}
              className="w-40"
            />
          )}
          <Button size="sm" onClick={handleFieldSave} className="bg-green-600 hover:bg-green-700 text-white">
            <Save className="h-3 w-3" />
          </Button>
          <Button size="sm" variant="outline" onClick={handleFieldCancel}>
            <X className="h-3 w-3" />
          </Button>
        </div>
      )
    }

    return (
      <div className="flex items-center space-x-2 group">
        <div className="text-sm">{displayValue}</div>
        <Button
          size="sm"
          variant="ghost"
          onClick={() => handleFieldEdit(scheduleId, field, value)}
          className="opacity-0 group-hover:opacity-100 transition-opacity h-6 w-6 p-0"
        >
          <Edit className="h-3 w-3" />
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-[#8B1538]">Gestión de Agendas</h2>
        <p className="text-gray-600">Seleccione un médico y edite campos específicos de sus horarios</p>
      </div>

      {/* Selección de Médico */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <User className="h-5 w-5 text-[#8B1538]" />
            <span>Selección de Médico</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
            <Select onValueChange={handleDoctorChange} value={selectedDoctorId || undefined}>
            <SelectTrigger>
              <SelectValue placeholder="Seleccionar médico para gestionar sus agendas" />
            </SelectTrigger>
            <SelectContent>
              {doctorsToUse.map((doctor) => (
                <SelectItem key={doctor.id} value={doctor.id}>
                  {doctor.name} - {doctor.specialty}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {/* Agendas del Médico */}
      {selectedDoctorId && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center space-x-2">
                <Calendar className="h-5 w-5 text-[#8B1538]" />
                <span>Agendas del Médico</span>
              </CardTitle>
              <Button onClick={handleAddNewSchedule} className="bg-[#8B1538] hover:bg-[#6B1028] text-white">
                <Plus className="h-4 w-4 mr-2" />
                Agregar Nueva Agenda
              </Button>
            </div>
            <p className="text-sm text-gray-600">Haga clic en el ícono de edición junto a cualquier campo para modificarlo individualmente</p>
          </CardHeader>
          <CardContent>
            {doctorSchedules.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <Calendar className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                <h3 className="text-lg font-medium mb-2">No hay agendas configuradas</h3>
                <p className="text-sm mb-4">Este médico no tiene horarios asignados aún</p>
                <Button onClick={handleAddNewSchedule} className="bg-[#8B1538] hover:bg-[#6B1028] text-white">
                  <Plus className="h-4 w-4 mr-2" />
                  Crear Primera Agenda
                </Button>
              </div>
            ) : (
              <div className="space-y-6">
                {doctorSchedules.map((schedule, index) => (
                  <div key={`${schedule.id}-${index}`} className="border rounded-lg p-6 bg-white shadow-sm">
                    <div className="flex items-center justify-between mb-4">
                      <Badge className="bg-[#8B1538] text-white">Agenda #{index + 1}</Badge>
                      <Badge
                        variant="outline"
                        className={schedule.isAvailable ? "border-green-500 text-green-700" : "border-red-500 text-red-700"}
                      >
                        {schedule.isAvailable ? "Activa" : "Inactiva"}
                      </Badge>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {/* Especialidad */}
                      <div className="space-y-2">
                        <Label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Especialidad</Label>
                        <EditableField
                          scheduleId={schedule.id}
                          field="specialty"
                          value={schedule.specialty}
                          displayValue={schedule.specialty}
                          type="select"
                          options={specialties}
                        />
                      </div>

                      {/* Ubicación */}
                      <div className="space-y-2">
                        <Label className="text-xs font-medium text-gray-500 uppercase tracking-wide flex items-center">
                          <MapPin className="h-3 w-3 mr-1" />
                          Ubicación
                        </Label>
                        <EditableField
                          scheduleId={schedule.id}
                          field="location"
                          value={schedule.location}
                          displayValue={schedule.location}
                          type="select"
                          options={locations}
                        />
                      </div>

                      {/* Consultorio */}
                      <div className="space-y-2">
                        <Label className="text-xs font-medium text-gray-500 uppercase tracking-wide flex items-center">
                          <Building className="h-3 w-3 mr-1" />
                          Consultorio
                        </Label>
                        <EditableField
                          scheduleId={schedule.id}
                          field="office"
                          value={schedule.office}
                          displayValue={schedule.office}
                        />
                      </div>

                      {/* Hora Inicio */}
                      <div className="space-y-2">
                        <Label className="text-xs font-medium text-gray-500 uppercase tracking-wide flex items-center">
                          <Clock className="h-3 w-3 mr-1" />
                          Hora Inicio
                        </Label>
                        <EditableField
                          scheduleId={schedule.id}
                          field="startTime"
                          value={schedule.startTime}
                          displayValue={formatTime(schedule.startTime)}
                          type="time"
                        />
                      </div>

                      {/* Hora Fin */}
                      <div className="space-y-2">
                        <Label className="text-xs font-medium text-gray-500 uppercase tracking-wide flex items-center">
                          <Clock className="h-3 w-3 mr-1" />
                          Hora Fin
                        </Label>
                        <EditableField
                          scheduleId={schedule.id}
                          field="endTime"
                          value={schedule.endTime}
                          displayValue={formatTime(schedule.endTime)}
                          type="time"
                        />
                      </div>

                      {/* Días de Atención */}
                      <div className="space-y-2">
                        <Label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Días de Atención</Label>
                        <EditableField
                          scheduleId={schedule.id}
                          field="weekDays"
                          value={schedule.weekDays}
                          displayValue={
                            <div className="flex flex-wrap gap-1">
                              {[...new Set<number>(schedule.weekDays)].map((dayIndex) => (
                                <Badge key={dayIndex} variant="secondary" className="text-xs">
                                  {dayNames[dayIndex]}
                                </Badge>
                              ))}
                            </div>
                          }
                          type="multiselect"
                        />
                      </div>
                    </div>

                    {/* Acciones rápidas */}
                    <div className="mt-6 pt-4 border-t flex justify-between items-center">
                      <div className="text-xs text-gray-500">Última modificación: Hace 2 horas</div>
                      <div className="flex space-x-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => onSubmit({ scheduleId: schedule.id, action: "toggleStatus" })}
                          className={schedule.isAvailable ? "border-red-500 text-red-500 hover:bg-red-50" : "border-green-500 text-green-500 hover:bg-green-50"}
                        >
                          {schedule.isAvailable ? "Desactivar" : "Activar"}
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => onSubmit({ scheduleId: schedule.id, action: "duplicate" })}
                          className="border-blue-500 text-blue-500 hover:bg-blue-50"
                        >
                          Duplicar
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => onSubmit({ scheduleId: schedule.id, action: "delete" })}
                          className="border-red-500 text-red-500 hover:bg-red-50"
                        >
                          Eliminar
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}

