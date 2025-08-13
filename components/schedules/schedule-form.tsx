"use client"

import { useState, useEffect, type ReactNode } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Calendar, Clock, Edit, Plus, Save, X, MapPin, Building, User } from "lucide-react"
import { getCatalogoDias, getCatalogoEdificios, getPisosPorEdificio, getCatalogoConsultorios, getEspecialidadesV2 } from "@/lib/api"
import { componentStyles } from "@/styles"
import { getAgendasByPrestador, updateAgendaField } from "@/lib/api"

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

  // Catálogo de especialidades (desde API)
  const [specialties, setSpecialties] = useState<string[]>([])

  const dayNames = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"]

  // Cargar especialidades al montar
  useEffect(() => {
    getEspecialidadesV2()
      .then((items) => setSpecialties((items || []).filter(Boolean)))
      .catch(() => setSpecialties([]))
  }, [])

  // Catálogos (endpoint real)
  const [diasCatalog, setDiasCatalog] = useState<Array<{ codigo: string; descripcion: string }>>([])
  const [edificiosCatalog, setEdificiosCatalog] = useState<Array<{ codigo: string; descripcion: string }>>([])
  const [pisosByEdificio, setPisosByEdificio] = useState<Record<string, Array<{ codigo: string; descripcion: string }>>>({})
  const [consultoriosCatalog, setConsultoriosCatalog] = useState<Array<{ codigo: string; descripcion: string; codigo_edificio?: string; codigo_piso?: string }>>([])

  useEffect(() => {
    getCatalogoDias().then(setDiasCatalog).catch(() => setDiasCatalog([]))
    getCatalogoEdificios().then(setEdificiosCatalog).catch(() => setEdificiosCatalog([]))
    getCatalogoConsultorios().then((items: any[]) => {
      const mapped = (items || []).map((it) => ({
        codigo: String(it.codigo_consultorio ?? it.codigo),
        descripcion: String(it.descripcion_consultorio ?? it.descripcion),
        codigo_edificio: String(it.codigo_edificio ?? it.edificio ?? ""),
        codigo_piso: String(it.codigo_piso ?? it.piso ?? ""),
      }))
      setConsultoriosCatalog(mapped)
    }).catch(() => setConsultoriosCatalog([]))
  }, [])

  const loadPisos = async (codigoEdificio: string) => {
    if (!codigoEdificio) return
    if (pisosByEdificio[codigoEdificio]) return
    try {
      const pisos = await getPisosPorEdificio(codigoEdificio)
      setPisosByEdificio((prev) => ({ ...prev, [codigoEdificio]: pisos }))
    } catch {
      // noop
    }
  }

  // Pre-cargar pisos para las agendas visibles
  useEffect(() => {
    const edificiosUnicos = Array.from(new Set((doctorSchedules || []).map((s) => String(s.location || ""))).values())
    edificiosUnicos.forEach((ed) => {
      if (ed) void loadPisos(ed)
    })
  }, [doctorSchedules])

  const areSchedulesEqual = (a: any[], b: any[]) => {
    if (a === b) return true
    if (a.length !== b.length) return false
    for (let i = 0; i < a.length; i++) {
      if (a[i]?.id !== b[i]?.id) return false
    }
    return true
  }

  // Cargar agendas del médico seleccionado desde backend y resetear edición
  useEffect(() => {
    if (!selectedDoctorId) {
      setDoctorSchedules((prev) => (prev.length === 0 ? prev : []))
      if (editingField !== null) setEditingField(null)
      return
    }

    // limpiar mientras carga para evitar ver agendas de otro médico
    setDoctorSchedules([])

    getAgendasByPrestador(selectedDoctorId)
      .then((rows) => {
        const onlySelected = (rows || []).filter((r: any) => {
          const prestador = String(r.codigo_prestador ?? r.doctorId ?? r.prestador ?? "")
          return prestador === String(selectedDoctorId)
        })
        const mapped = onlySelected.map((r: any, idx: number) => ({
          id: String(r.id ?? r.codigo_agenda ?? `${selectedDoctorId}-${idx}`),
          doctorId: String(r.codigo_prestador ?? selectedDoctorId),
          specialty: String(r.descripcion_item ?? r.especialidad ?? ""),
          location: String(r.codigo_edificio ?? r.edificio ?? ""), // código
          office: String(r.codigo_consultorio ?? r.consultorio ?? ""), // código
          weekDays: Array.isArray(r.codigo_dia)
            ? r.codigo_dia.map((d: any) => Number(d))
            : r.codigo_dia != null
            ? [Number(r.codigo_dia)]
            : [],
          startTime: String(r.hora_inicio ?? ""),
          endTime: String(r.hora_fin ?? ""),
          isAvailable: Boolean(r.activo ?? r.isAvailable ?? true),
          floor: String(r.codigo_piso ?? r.piso ?? ""),
        }))
        setDoctorSchedules(mapped)
      })
      .catch(() => setDoctorSchedules([]))
      .finally(() => {
        if (editingField !== null) setEditingField(null)
      })
  }, [selectedDoctorId])

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

    // Actualizar en backend (PUT campo a campo)
    void updateAgendaField(updatedSchedule.scheduleId, updatedSchedule.field, updatedSchedule.value)
      .then(() => {
        // Refrescar localmente el valor editado para feedback inmediato
        setDoctorSchedules((prev) => prev.map((s) => {
          if (s.id !== updatedSchedule.scheduleId) return s
          return { ...s, [updatedSchedule.field]: updatedSchedule.value }
        }))
      })
      .finally(() => setEditingField(null))
  }

  const handleFieldCancel = () => {
    setEditingField(null)
  }

  const handleAddNewSchedule = () => {
    const doctor = doctors.find((d) => d.id === selectedDoctorId)
    const newSchedule = {
      doctorId: selectedDoctorId,
      doctorName: doctor?.name || "",
      specialty: doctor?.specialty || "",
      location: "", // codigo_edificio
      floor: "", // codigo_piso
      office: "", // codigo_consultorio
      weekDays: [], // codigo_dia
      startTime: "",
      endTime: "",
      action: "create",
    }
    onSubmit(newSchedule)
  }

  type OptionLike = string | { value: string; label: string }

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
    options?: OptionLike[] | null
  }) => {
    const isEditing = editingField?.scheduleId === scheduleId && editingField?.field === field
    const currentSchedule = doctorSchedules.find((s) => s.id === scheduleId)

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
                {options.map((option) => {
                  const val = typeof option === 'string' ? option : option.value
                  const label = typeof option === 'string' ? option : option.label
                  return (
                    <SelectItem key={val} value={val}>
                      {label}
                    </SelectItem>
                  )
                })}
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
        <h2 className={componentStyles.scheduleForm.title}>Gestión de Agendas</h2>
        <p className={componentStyles.scheduleForm.subtitle}>Seleccione un médico y edite campos específicos de sus horarios</p>
      </div>

      {/* Selección de Médico */}
      <Card>
        <CardHeader>
          <CardTitle className={componentStyles.scheduleManager.headerWithIcon}>
            <User className={componentStyles.scheduleManager.headerIcon} />
            <span>Selección de Médico</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
            <Select onValueChange={handleDoctorChange} value={selectedDoctorId || undefined}>
            <SelectTrigger>
              <SelectValue placeholder="Seleccionar médico para gestionar sus agendas" />
            </SelectTrigger>
            <SelectContent>
              {doctors.map((doctor, idx) => (
                <SelectItem key={`${doctor.id}-${idx}`} value={doctor.id}>
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
            <div className={componentStyles.scheduleManager.sectionHeaderRow}>
              <CardTitle className={componentStyles.scheduleManager.headerWithIcon}>
                <Calendar className={componentStyles.scheduleManager.headerIcon} />
                <span>Agendas del Médico</span>
              </CardTitle>
              <Button onClick={handleAddNewSchedule} className={componentStyles.scheduleManager.addButton}>
                <Plus className="h-4 w-4 mr-2" />
                Agregar Nueva Agenda
              </Button>
            </div>
            <p className={componentStyles.scheduleForm.subtitle}>Haga clic en el ícono de edición junto a cualquier campo para modificarlo individualmente</p>
          </CardHeader>
          <CardContent>
            {doctorSchedules.length === 0 ? (
              <div className={componentStyles.scheduleManager.emptyState}>
                <Calendar className={componentStyles.scheduleManager.emptyIcon} />
                <h3 className="text-lg font-medium mb-2">No hay agendas configuradas</h3>
                <p className="text-sm mb-4">Este médico no tiene horarios asignados aún</p>
                <Button onClick={handleAddNewSchedule} className={componentStyles.scheduleManager.addButton}>
                  <Plus className="h-4 w-4 mr-2" />
                  Crear Primera Agenda
                </Button>
              </div>
            ) : (
              <div className="space-y-6">
                {doctorSchedules.map((schedule, index) => (
                  <div key={`${schedule.id}-${index}`} className={componentStyles.scheduleManager.scheduleCard}>
                    <div className="flex items-center justify-between mb-4">
                      <Badge className="bg-primary-main text-white">Agenda #{index + 1}</Badge>
                      <Badge
                        variant="outline"
                        className={schedule.isAvailable ? componentStyles.scheduleManager.statusBadgeActive : componentStyles.scheduleManager.statusBadgeInactive}
                      >
                        {schedule.isAvailable ? "Activa" : "Inactiva"}
                      </Badge>
                    </div>

                    <div className={componentStyles.scheduleManager.grid}>
                      {/* Especialidad */}
                      <div className="space-y-2">
                        <Label className={componentStyles.scheduleManager.fieldLabel}>Especialidad</Label>
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
                        <Label className={componentStyles.scheduleManager.fieldLabel + ' flex items-center'}>
                          <MapPin className={componentStyles.scheduleManager.fieldLabelIcon} />
                          Ubicación
                        </Label>
                        <EditableField
                          scheduleId={schedule.id}
                          field="location"
                          value={schedule.location}
                          displayValue={edificiosCatalog.find((e) => e.codigo === String(schedule.location))?.descripcion || ''}
                          type="select"
                          options={edificiosCatalog.map((e) => ({ value: e.codigo, label: e.descripcion })) as OptionLike[]}
                        />
                      </div>

                      {/* Piso */}
                      <div className="space-y-2">
                        <Label className={componentStyles.scheduleManager.fieldLabel + ' flex items-center'}>
                          <Building className={componentStyles.scheduleManager.fieldLabelIcon} />
                          Piso
                        </Label>
                        <EditableField
                          scheduleId={schedule.id}
                          field="floor"
                          value={(schedule as any).floor}
                          displayValue={(pisosByEdificio[String(schedule.location)] || []).find((p) => p.codigo === String((schedule as any).floor))?.descripcion || ''}
                          type="select"
                          options={(pisosByEdificio[String(schedule.location)] || []).map((p) => ({ value: p.codigo, label: p.descripcion })) as OptionLike[]}
                        />
                      </div>

                      {/* Consultorio */}
                      <div className="space-y-2">
                        <Label className={componentStyles.scheduleManager.fieldLabel + ' flex items-center'}>
                          <Building className={componentStyles.scheduleManager.fieldLabelIcon} />
                          Consultorio
                        </Label>
                        <EditableField
                          scheduleId={schedule.id}
                          field="office"
                          value={schedule.office}
                          displayValue={consultoriosCatalog.find((c) => String(c.codigo) === String(schedule.office))?.descripcion || ''}
                          type="select"
                          options={consultoriosCatalog
                            .filter((c) => String(c.codigo_edificio || '') === String(schedule.location) && String(c.codigo_piso || '') === String((schedule as any).floor))
                            .map((c) => ({ value: c.codigo, label: c.descripcion })) as OptionLike[]}
                        />
                      </div>

                      {/* Hora Inicio */}
                      <div className="space-y-2">
                        <Label className={componentStyles.scheduleManager.fieldLabel + ' flex items-center'}>
                          <Clock className={componentStyles.scheduleManager.fieldLabelIcon} />
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
                        <Label className={componentStyles.scheduleManager.fieldLabel + ' flex items-center'}>
                          <Clock className={componentStyles.scheduleManager.fieldLabelIcon} />
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
                        <Label className={componentStyles.scheduleManager.fieldLabel}>Días de Atención</Label>
                        <EditableField
                          scheduleId={schedule.id}
                          field="weekDays"
                          value={schedule.weekDays}
                          displayValue={
                            <div className={componentStyles.scheduleManager.weekDaysBadges}>
                              {[...new Set<string | number>(schedule.weekDays)].map((code) => (
                                <Badge key={String(code)} variant="secondary" className="text-xs">
                                  {diasCatalog.find((d) => String(d.codigo) === String(code))?.descripcion || dayNames[Number(code)] || String(code)}
                                </Badge>
                              ))}
                            </div>
                          }
                          type="multiselect"
                        />
                      </div>
                    </div>

                    {/* Acciones rápidas */}
                    <div className={componentStyles.scheduleManager.quickActions.container}>
                      <div className={componentStyles.scheduleManager.quickActions.lastUpdate}>Última modificación: Hace 2 horas</div>
                      <div className="flex space-x-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => onSubmit({ scheduleId: schedule.id, action: "toggleStatus" })}
                          className={schedule.isAvailable ? componentStyles.scheduleManager.quickActions.toggleActive : componentStyles.scheduleManager.quickActions.toggleInactive}
                        >
                          {schedule.isAvailable ? "Desactivar" : "Activar"}
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => onSubmit({ scheduleId: schedule.id, action: "duplicate" })}
                          className={componentStyles.scheduleManager.quickActions.duplicate}
                        >
                          Duplicar
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => onSubmit({ scheduleId: schedule.id, action: "delete" })}
                          className={componentStyles.scheduleManager.quickActions.delete}
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

