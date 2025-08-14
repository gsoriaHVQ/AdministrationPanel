"use client"

import { useState, useEffect, type ReactNode } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover"
import { Command, CommandInput, CommandList, CommandEmpty, CommandGroup, CommandItem } from "@/components/ui/command"
import { Badge } from "@/components/ui/badge"
import { Calendar, Clock, Edit, Plus, Save, X, MapPin, Building, User, ChevronsUpDown, Check } from "lucide-react"
import { getCatalogoDias, getCatalogoEdificios, getPisosPorEdificio, getCatalogoConsultorios, getEspecialidadesV2, getMedicosPorEspecialidadV2 } from "@/lib/api"
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
  const [selectedSpecialty, setSelectedSpecialty] = useState("")
  const [isSpecialtyOpen, setIsSpecialtyOpen] = useState(false)
  const [isDoctorOpen, setIsDoctorOpen] = useState(false)
  const [doctorSchedules, setDoctorSchedules] = useState<any[]>([])
  const [editingField, setEditingField] = useState<{
    scheduleId: string
    field: string
    value: any
  } | null>(null)

  // Catálogo de especialidades (desde API)
  const [specialties, setSpecialties] = useState<string[]>([])
  const [specialtyDoctors, setSpecialtyDoctors] = useState<Array<{ id: string; name: string; specialty: string }>>([])

  const dayNames = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"]

  const normalize = (s?: string) => String(s ?? "").trim().toLowerCase()
  const allSpecialties: string[] = Array.from(
    new Set([
      ...specialties,
      ...doctors.map((d) => String(d.specialty || "")).filter((s) => s),
    ])
  )
  const filteredDoctors = selectedSpecialty
    ? doctors.filter((d) => normalize(d.specialty) === normalize(selectedSpecialty))
    : doctors

  // Si no encontramos médicos locales para la especialidad, intentamos traerlos desde la API
  useEffect(() => {
    let active = true
    async function fetchDoctors() {
      if (!selectedSpecialty) {
        if (active) setSpecialtyDoctors([])
        return
      }
      // Si ya hay resultados locales, limpiamos extra para no duplicar
      if (filteredDoctors.length > 0) {
        if (active) setSpecialtyDoctors([])
        return
      }
      try {
        const data = await getMedicosPorEspecialidadV2(selectedSpecialty)
        const list = Array.isArray(data) ? data : (Array.isArray((data as any)?.items) ? (data as any).items : [])
        const mapped = list.map((d: any, idx: number) => ({
          id: String(d.codigo_prestador ?? d.id ?? idx),
          name: String(d.nombres ?? d.nombre_prestador ?? d.name ?? ""),
          specialty: String(
            d.descripcion_agendamiento ??
            d.descripcion_item ??
            d.ds_item_agendamiento ??
            d.especialidad ??
            d.specialty ??
            selectedSpecialty
          ),
        }))
        if (active) setSpecialtyDoctors(mapped)
      } catch {
        if (active) setSpecialtyDoctors([])
      }
    }
    void fetchDoctors()
    return () => {
      active = false
    }
  }, [selectedSpecialty, doctors])

  // Mezcla final (props + API por especialidad) sin duplicados por id
  const finalDoctors = (() => {
    const byId: Record<string, { id: string; name: string; specialty: string }> = {}
    const addAll = (arr: Array<{ id: string; name: string; specialty: string }>) => {
      for (const d of arr) byId[String(d.id)] = d
    }
    addAll(filteredDoctors)
    addAll(specialtyDoctors)
    return Object.values(byId)
  })()

  // Cargar especialidades al montar
  useEffect(() => {
    getEspecialidadesV2()
      .then((items) => setSpecialties(Array.from(new Set((items || []).filter(Boolean)))))
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
        const doctorForSelected = doctors.find((d) => String(d.id) === String(selectedDoctorId))
        const onlySelected = (rows || []).filter((r: any) => {
          const prestador = String(r.codigo_prestador ?? r.doctorId ?? r.prestador ?? "")
          return prestador === String(selectedDoctorId)
        })
         const mapped = onlySelected.map((r: any, idx: number) => ({
          id: String(r.id ?? r.codigo_agenda ?? `${selectedDoctorId}-${idx}`),
          doctorId: String(r.codigo_prestador ?? selectedDoctorId),
           specialty: String(
             r.descripcion_item ??
             r.ds_item_agendamiento ??
             r.ds_especialidad ??
             r.especialidad ??
             doctorForSelected?.specialty ??
             (doctors.find(d => String(d.id) === String(selectedDoctorId))?.specialty || "")
           ),
          location: String(r.codigo_edificio ?? r.cd_edificio ?? r.edificio ?? "") || "2", // por defecto CD_EDIFICIO = 2
          office: String(r.codigo_consultorio ?? r.cd_consultorio ?? r.consultorio ?? ""), // código
          weekDays: Array.isArray(r.codigo_dia)
            ? r.codigo_dia.map((d: any) => Number(d))
            : r.codigo_dia != null
            ? [Number(r.codigo_dia)]
            : [],
          startTime: String(r.hora_inicio ?? ""),
          endTime: String(r.hora_fin ?? ""),
          isAvailable: Boolean(r.activo ?? r.isAvailable ?? true),
          floor: String(r.codigo_piso ?? r.cd_piso ?? r.piso ?? ""),
          itemCode: String(r.codigo_item_agendamiento ?? r.codigo_item ?? ""),
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
    let date: Date
    if (/\d{4}-\d{2}-\d{2}[ T]\d{2}:\d{2}/.test(time)) {
      // viene con fecha
      const iso = time.replace(" ", "T")
      date = new Date(iso)
    } else {
      date = new Date(`2000-01-01T${time}`)
    }
    if (Number.isNaN(date.getTime())) return "—"
    return date.toLocaleTimeString("es-ES", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    })
  }

  const extractTimeHHMM = (value?: string): string => {
    if (!value) return ""
    const m = value.match(/(\d{2}:\d{2})/)
    return m ? m[1] : value
  }

  const handleFieldEdit = (scheduleId: string, field: string, currentValue: any) => {
    setEditingField({
      scheduleId,
      field,
      value: currentValue,
    })
  }

  const handleFieldSave = async () => {
    if (!editingField) return

    let normalizedValue: any
    if (editingField.field === "weekDays") {
      normalizedValue = Number(Array.isArray(editingField.value) ? editingField.value[0] : editingField.value)
    } else if (editingField.field === "startTime" || editingField.field === "endTime") {
      const schedule = doctorSchedules.find((s) => s.id === editingField.scheduleId)
      const inputTime = String(editingField.value)
      const existing = String(schedule?.[editingField.field] || "")
      const dateMatch = existing.match(/(\d{4}-\d{2}-\d{2})/)
      const datePart = dateMatch ? dateMatch[1] : new Date().toISOString().slice(0, 10)
      normalizedValue = `${datePart} ${inputTime}`
    } else {
      normalizedValue = editingField.value
    }

    const scheduleBefore = doctorSchedules.find((s) => s.id === editingField.scheduleId)

    const updatedSchedule = {
      scheduleId: editingField.scheduleId,
      field: editingField.field,
      value: normalizedValue,
      action: "updateField",
    }

    try {
      // 1) Actualiza el campo editado
      await updateAgendaField(updatedSchedule.scheduleId, updatedSchedule.field, updatedSchedule.value)
      // feedback inmediato local
      setDoctorSchedules((prev) => prev.map((s) => {
        if (s.id !== updatedSchedule.scheduleId) return s
        return { ...s, [updatedSchedule.field]: updatedSchedule.value }
      }))

      // 2) Lógica de consistencia entre ubicación → piso → consultorio
      if (updatedSchedule.field === 'location') {
        const newLocation = String(updatedSchedule.value || '')
        if (newLocation) await loadPisos(newLocation)

        const pisos = pisosByEdificio[newLocation] || []
        const currentFloor = String((scheduleBefore as any)?.floor || '')
        const validFloor = pisos.find((p) => String(p.codigo) === currentFloor)
        let floorToSet = currentFloor
        if (!validFloor) {
          floorToSet = String(pisos[0]?.codigo || '')
        }

        if (floorToSet && floorToSet !== currentFloor) {
          await updateAgendaField(updatedSchedule.scheduleId, 'floor', floorToSet)
          setDoctorSchedules((prev) => prev.map((s) => s.id === updatedSchedule.scheduleId ? { ...s, floor: floorToSet } : s))
        }

        const consultoriosValidos = consultoriosCatalog.filter((c) => String(c.codigo_edificio || '') === newLocation && String(c.codigo_piso || '') === String(floorToSet))
        const currentOffice = String(scheduleBefore?.office || '')
        const officeValid = consultoriosValidos.find((c) => String(c.codigo) === currentOffice)
        if (!officeValid) {
          const officeToSet = String(consultoriosValidos[0]?.codigo || '')
          if (officeToSet) {
            await updateAgendaField(updatedSchedule.scheduleId, 'office', officeToSet)
            setDoctorSchedules((prev) => prev.map((s) => s.id === updatedSchedule.scheduleId ? { ...s, office: officeToSet } : s))
          }
        }
      }

      if (updatedSchedule.field === 'floor') {
        const currentLocation = String(scheduleBefore?.location || '')
        const consultoriosValidos = consultoriosCatalog.filter((c) => String(c.codigo_edificio || '') === currentLocation && String(c.codigo_piso || '') === String(updatedSchedule.value))
        const currentOffice = String(scheduleBefore?.office || '')
        const officeValid = consultoriosValidos.find((c) => String(c.codigo) === currentOffice)
        if (!officeValid) {
          const officeToSet = String(consultoriosValidos[0]?.codigo || '')
          if (officeToSet) {
            await updateAgendaField(updatedSchedule.scheduleId, 'office', officeToSet)
            setDoctorSchedules((prev) => prev.map((s) => s.id === updatedSchedule.scheduleId ? { ...s, office: officeToSet } : s))
          }
        }
      }

      if (updatedSchedule.field === 'office') {
        // Sincroniza edificio y piso desde el consultorio elegido
        const officeInfo = consultoriosCatalog.find((c) => String(c.codigo) === String(updatedSchedule.value))
        if (officeInfo) {
          const newLocation = String(officeInfo.codigo_edificio || '')
          const newFloor = String(officeInfo.codigo_piso || '')
          if (newLocation && newLocation !== String(scheduleBefore?.location || '')) {
            await updateAgendaField(updatedSchedule.scheduleId, 'location', newLocation)
            setDoctorSchedules((prev) => prev.map((s) => s.id === updatedSchedule.scheduleId ? { ...s, location: newLocation } : s))
            await loadPisos(newLocation)
          }
          if (newFloor && newFloor !== String((scheduleBefore as any)?.floor || '')) {
            await updateAgendaField(updatedSchedule.scheduleId, 'floor', newFloor)
            setDoctorSchedules((prev) => prev.map((s) => s.id === updatedSchedule.scheduleId ? { ...s, floor: newFloor } : s))
          }
        }
      }
    } finally {
      setEditingField(null)
    }
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
      location: "2", // codigo_edificio default
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

    const normalizeOptions = (opts: OptionLike[]): { value: string; label: string }[] => {
      const pairs = opts.map((option) => ({
        value: typeof option === 'string' ? option : option.value,
        label: typeof option === 'string' ? option : option.label,
      }))
      const seen = new Set<string>()
      const unique: { value: string; label: string }[] = []
      for (const it of pairs) {
        if (seen.has(it.value)) continue
        seen.add(it.value)
        unique.push(it)
      }
      return unique
    }

    if (isEditing) {
      return (
        <div className="flex items-center space-x-2">
          {type === "select" && options ? (
            <Select
              value={(editingField.value ?? undefined) as string | undefined}
              onValueChange={(newValue) => {
                if (field === 'location') {
                  void loadPisos(String(newValue))
                }
                setEditingField((prev) => (prev ? { ...prev, value: newValue } : null))
              }}
            >
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {normalizeOptions(options).map(({ value: val, label }) => (
                  <SelectItem key={`${scheduleId}-${field}-${val}`} value={val}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          ) : type === "multiselect" ? (
            <div className="flex flex-wrap gap-1 max-w-xs">
              {(diasCatalog.length ? diasCatalog : dayNames.map((d, i) => ({ codigo: String(i), descripcion: d }))).map((d) => {
                const codeNum = Number(d.codigo)
                const current = editingField.value
                const isChecked = Array.isArray(current) ? current.includes(codeNum) : Number(current) === codeNum
                return (
                <label key={`${d.codigo}-${d.descripcion}`} className="cursor-pointer">
                  <input
                    type="radio"
                    name={`weekday-${scheduleId}`}
                    className="sr-only"
                    checked={isChecked}
                    onChange={(e) => {
                      setEditingField((prev) => (prev ? { ...prev, value: codeNum } : null))
                    }}
                  />
                  <div
                    className={`
                    px-2 py-1 text-xs rounded border transition-colors
                    ${isChecked ? componentStyles.scheduleManager.dayPillSelected : componentStyles.scheduleManager.dayPillUnselected}
                  `}
                  >
                    {d.descripcion}
                  </div>
                </label>
              )})}
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className={componentStyles.scheduleManager.fieldLabel}>Especialidad</Label>
              <Popover open={isSpecialtyOpen} onOpenChange={setIsSpecialtyOpen}>
                <PopoverTrigger asChild>
                  <Button variant="outline" role="combobox" className="w-full justify-between">
                    {selectedSpecialty ? selectedSpecialty : "Seleccionar especialidad"}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="p-0 w-[320px]">
                  <Command>
                    <CommandInput placeholder="Buscar especialidad..." />
                    <CommandList>
                      <CommandEmpty>No se encontraron especialidades.</CommandEmpty>
                      <CommandGroup>
                        {allSpecialties.map((sp) => (
                          <CommandItem
                            key={`sp-${sp}`}
                            value={sp}
                            onSelect={(value) => {
                              setSelectedSpecialty(value)
                              setSelectedDoctorId("")
                              setIsSpecialtyOpen(false)
                            }}
                          >
                            {sp}
                            {normalize(selectedSpecialty) === normalize(sp) ? (
                              <Check className="ml-auto h-4 w-4 opacity-100" />
                            ) : null}
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
            </div>
            <div className="space-y-2">
              <Label className={componentStyles.scheduleManager.fieldLabel}>Médico</Label>
              <Popover open={isDoctorOpen} onOpenChange={setIsDoctorOpen}>
                <PopoverTrigger asChild>
                  <Button variant="outline" role="combobox" className="w-full justify-between" disabled={!selectedSpecialty}>
                    {selectedDoctorId
                      ? `${filteredDoctors.find((d) => String(d.id) === String(selectedDoctorId))?.name ?? ""}`
                      : selectedSpecialty
                      ? "Seleccionar médico"
                      : "Seleccione primero una especialidad"}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="p-0 w-[360px]">
                  <Command>
                    <CommandInput placeholder={selectedSpecialty ? "Buscar médico..." : "Seleccione una especialidad"} disabled={!selectedSpecialty} />
                    <CommandList>
                      <CommandEmpty>{selectedSpecialty ? "No se encontraron médicos." : "Primero elija una especialidad."}</CommandEmpty>
                      <CommandGroup>
                        {finalDoctors.map((doctor) => (
                          <CommandItem
                            key={`dr-${doctor.id}`}
                            value={`${doctor.name} - ${doctor.specialty}`}
                            onSelect={() => {
                              handleDoctorChange(doctor.id)
                              setIsDoctorOpen(false)
                            }}
                          >
                            {doctor.name}
                            <span className="ml-2 text-xs text-muted-foreground">{doctor.specialty || ""}</span>
                            {String(doctor.id) === String(selectedDoctorId) ? (
                              <Check className="ml-auto h-4 w-4 opacity-100" />
                            ) : null}
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
            </div>
          </div>
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
                        {(() => {
                          const doctorForThis = doctors.find((d) => String(d.id) === String(schedule.doctorId))
                          const specialtyFallback = schedule.specialty || doctorForThis?.specialty || selectedSpecialty || ""
                          return (
                            <EditableField
                              scheduleId={schedule.id}
                              field="specialty"
                              value={specialtyFallback}
                              displayValue={specialtyFallback}
                              type="select"
                              options={allSpecialties}
                            />
                          )
                        })()}
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
                           displayValue={edificiosCatalog.find((e) => e.codigo === String(schedule.location))?.descripcion || String(schedule.location || '')}
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
                          displayValue={(
                            (pisosByEdificio[String(schedule.location)] || []).find((p) => p.codigo === String((schedule as any).floor))?.descripcion
                          ) || String((schedule as any).floor || '')}
                          type="select"
                          options={[
                            ...((pisosByEdificio[String(schedule.location)] || []).map((p) => ({ value: p.codigo, label: p.descripcion })) as OptionLike[]),
                            ...(((schedule as any).floor ? [{ value: String((schedule as any).floor), label: String((schedule as any).floor) }] : []) as OptionLike[]),
                          ]}
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
                          displayValue={consultoriosCatalog.find((c) => String(c.codigo) === String(schedule.office))?.descripcion || String(schedule.office || '')}
                          type="select"
                          options={[
                            ...(
                              consultoriosCatalog
                            .filter((c) => String(c.codigo_edificio || '') === String(schedule.location) && String(c.codigo_piso || '') === String((schedule as any).floor))
                                .map((c) => ({ value: c.codigo, label: c.descripcion })) as OptionLike[]
                            ),
                            ...((schedule.office ? [{ value: String(schedule.office), label: String(schedule.office) }] : []) as OptionLike[]),
                          ]}
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
                          value={Array.isArray(schedule.weekDays) ? schedule.weekDays[0] ?? "" : schedule.weekDays}
                          displayValue={
                            <div className={componentStyles.scheduleManager.weekDaysBadges}>
                              {(() => {
                                const code = Array.isArray(schedule.weekDays) ? schedule.weekDays[0] : schedule.weekDays
                                const label = diasCatalog.find((d) => String(d.codigo) === String(code))?.descripcion || dayNames[Number(code)] || String(code)
                                return <Badge key={String(code)} variant="secondary" className="text-xs">{label}</Badge>
                              })()}
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

