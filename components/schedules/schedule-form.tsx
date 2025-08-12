"use client"

import React, { useState, useEffect } from "react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar, Clock } from "lucide-react"
import { componentStyles } from "@/styles"
import { WeekDaySelector } from "@/components/ui/week-day-selector"
import { TimeRangeSelector } from "@/components/ui/time-range-selector"
import { getCatalogoDias, getCatalogoEdificios, getCatalogoConsultorios, getPisosPorEdificio, getMedicosPorEspecialidadV2, getMedicosPorNombreV2, getEspecialidadesV2 } from "@/lib/api"

interface ScheduleFormProps {
  onSubmit: (scheduleData: any) => void;
  doctors: Array<{ id: string; name: string; specialty: string }>;
}

export function ScheduleForm({ onSubmit, doctors }: ScheduleFormProps) {
  const [formData, setFormData] = useState<{
    doctorId: string;
    specialty: string;
    location: string; // edificio
    office: string; // consultorio o piso + consultorio
    weekDays: number[];
    startTime: string;
    endTime: string;
  }>({
    doctorId: "",
    specialty: "",
    location: "",
    office: "",
    weekDays: [],
    startTime: "",
    endTime: "",
  })
  const [searchDoctor, setSearchDoctor] = useState("")
  const [specialties, setSpecialties] = useState<string[]>([])
  const [medicosEspecialidad, setMedicosEspecialidad] = useState<Array<{ id: string; name: string; specialty: string }>>([])
  const [loadingDoctors, setLoadingDoctors] = useState(false)
  const [errorDoctors, setErrorDoctors] = useState("")

  // Catálogos
  const [dias, setDias] = useState<Array<{ codigo: string; descripcion: string }>>([])
  const [edificios, setEdificios] = useState<Array<{ codigo: string; descripcion: string }>>([])
  const [pisos, setPisos] = useState<Array<{ codigo: string; descripcion: string }>>([])
  const [consultorios, setConsultorios] = useState<Array<{ codigo: string; descripcion: string }>>([])
  const [edificioSeleccionado, setEdificioSeleccionado] = useState<string>("")
  const [pisoSeleccionado, setPisoSeleccionado] = useState<string>("")
  const [consultorioSeleccionado, setConsultorioSeleccionado] = useState<string>("")

  // Cargar especialidades desde API v2
  useEffect(() => {
    getEspecialidadesV2()
      .then((list) => setSpecialties((list || []).filter(Boolean)))
      .catch(() => setSpecialties(Array.from(new Set(doctors.map((d) => d.specialty))).sort()))
  }, [doctors])

  // Cargar catálogos
  useEffect(() => {
    getCatalogoDias().then(setDias).catch(() => setDias([]))
    getCatalogoEdificios().then(setEdificios).catch(() => setEdificios([]))
    getCatalogoConsultorios().then(setConsultorios).catch(() => setConsultorios([]))
  }, [])

  // Cargar pisos por edificio
  useEffect(() => {
    if (!edificioSeleccionado) { setPisos([]); return }
    getPisosPorEdificio(edificioSeleccionado).then(setPisos).catch(() => setPisos([]))
  }, [edificioSeleccionado])

  // Limpiar doctorId solo cuando cambia la especialidad (no en cada búsqueda)
  const prevSpecialty = React.useRef<string>("")
  useEffect(() => {
    if (formData.specialty !== prevSpecialty.current) {
      setFormData(prev => ({ ...prev, doctorId: "" }))
      prevSpecialty.current = formData.specialty
    }
  }, [formData.specialty])

  // Consultar médicos por especialidad o búsqueda (v2)
  useEffect(() => {
    if (!formData.specialty) {
      setMedicosEspecialidad([])
      return
    }
    setLoadingDoctors(true)
    setErrorDoctors("")

    const run = async () => {
      try {
        if (searchDoctor.length >= 2) {
          const data = await getMedicosPorNombreV2(searchDoctor)
          const filtered = (data || []).filter((d: any) => (d.descripcion_item || d.specialty || d.especialidad) === formData.specialty)
          setMedicosEspecialidad(
            filtered.map((d: any) => ({
              id: String(d.codigo_prestador || d.id),
              name: d.nombre_prestador || d.name,
              specialty: d.descripcion_item || d.specialty || d.especialidad
            }))
          )
        } else {
          const data = await getMedicosPorEspecialidadV2(formData.specialty)
          setMedicosEspecialidad(
            (data || []).map((d: any) => ({
              id: String(d.codigo_prestador || d.id),
              name: d.nombre_prestador || d.name,
              specialty: d.descripcion_item || d.specialty || d.especialidad
            }))
          )
        }
      } catch (e) {
        setErrorDoctors("Error al cargar médicos")
        setMedicosEspecialidad([])
      } finally {
        setLoadingDoctors(false)
      }
    }

    run()
  }, [formData.specialty, searchDoctor])

  const filteredDoctors = medicosEspecialidad

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit(formData)
  }

  const handleDoctorChange = (doctorId: string) => {
    const doctor = medicosEspecialidad.find((d: { id: string; specialty: string }) => String(d.id) === String(doctorId))
    setFormData((prev) => ({
      ...prev,
      doctorId: String(doctorId),
      specialty: doctor?.specialty || prev.specialty,
    }))
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className={componentStyles.scheduleForm.title}>Gestión de Agendas</h2>
        <p className={componentStyles.scheduleForm.subtitle}>Configure los horarios de atención médica</p>
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
                    {specialties.map((specialty, i) => (
                      <SelectItem key={`${specialty}-${i}`} value={specialty}>
                        {specialty}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="doctor">Médico</Label>
                <Input
                  placeholder="Buscar por nombre (opcional)"
                  value={searchDoctor}
                  onChange={(e) => setSearchDoctor(e.target.value)}
                />
                <Select onValueChange={handleDoctorChange} value={formData.doctorId} required disabled={!formData.specialty || loadingDoctors}>
                  <SelectTrigger>
                    <SelectValue placeholder={formData.specialty ? (loadingDoctors ? "Cargando médicos..." : "Seleccionar médico") : "Seleccione una especialidad primero"} />
                  </SelectTrigger>
                  <SelectContent>
                    {errorDoctors && <div className="text-red-500 px-2 py-1">{errorDoctors}</div>}
                    {(filteredDoctors || []).map((doctor, i) => (
                      <SelectItem key={`${doctor.id}-${doctor.name}-${i}`} value={String(doctor.id)}>
                        {doctor.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="location">Edificio</Label>
                <Select onValueChange={(value) => { setEdificioSeleccionado(value); setFormData((prev) => ({ ...prev, location: value })) }} required>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar edificio" />
                  </SelectTrigger>
                  <SelectContent>
                    {edificios.map((e: any, i) => {
                      const code = String(e.codigo ?? e.codigo_edificio ?? e.code ?? e.id ?? i)
                      const label = String(e.descripcion ?? e.nombre ?? e.nombre_edificio ?? e.label ?? code)
                      return (
                        <SelectItem key={`${code}-${label}-${i}`} value={code}>
                          {label}
                        </SelectItem>
                      )
                    })}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="office">Piso</Label>
                <Select onValueChange={(value) => { setPisoSeleccionado(value); }} disabled={!edificioSeleccionado}>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar piso" />
                  </SelectTrigger>
                  <SelectContent>
                    {pisos.map((p: any, i) => {
                      const code = String(p.codigo ?? p.codigo_piso ?? p.code ?? p.id ?? i)
                      const label = String(p.descripcion ?? p.nombre ?? p.nombre_piso ?? p.label ?? code)
                      return (
                        <SelectItem key={`${code}-${label}-${i}`} value={code}>
                          {label}
                        </SelectItem>
                      )
                    })}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="office">Consultorio</Label>
                <Select onValueChange={(value) => { setConsultorioSeleccionado(value); setFormData((prev) => ({ ...prev, office: value })) }}>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar consultorio" />
                  </SelectTrigger>
                  <SelectContent>
                    {consultorios.map((c: any, i) => {
                      const code = String(c.codigo ?? c.codigo_consultorio ?? c.code ?? c.id ?? i)
                      const label = String(c.descripcion ?? c.nombre ?? c.nombre_consultorio ?? c.label ?? code)
                      return (
                        <SelectItem key={`${code}-${label}-${i}`} value={code}>
                          {label}
                        </SelectItem>
                      )
                    })}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label>Días de la Semana</Label>
                <WeekDaySelector
                  items={dias.map((d: any, i) => {
                    const codeRaw = Number(d.codigo ?? d.codigo_dia ?? d.id ?? i)
                    const idx = Number.isFinite(codeRaw) && codeRaw >= 1 && codeRaw <= 7 ? codeRaw - 1 : codeRaw
                    const label = String(d.descripcion ?? d.nombre ?? d.nombre_dia ?? d.label ?? idx)
                    return { label, index: idx }
                  })}
                  selectedDays={formData.weekDays || []}
                  onDayToggle={(dayIndex) => {
                    const days = formData.weekDays || []
                    setFormData((prev) => ({
                      ...prev,
                      weekDays: days.includes(dayIndex)
                        ? days.filter((d) => d !== dayIndex)
                        : [...days, dayIndex]
                    }))
                  }}
                />
              </div>

              <div className="space-y-2">
                <Label>Horario</Label>
                <TimeRangeSelector
                  startTime={formData.startTime}
                  endTime={formData.endTime}
                  onStartTimeChange={(time) => setFormData((prev) => ({ ...prev, startTime: time }))}
                  onEndTimeChange={(time) => setFormData((prev) => ({ ...prev, endTime: time }))}
                  required
                />
              </div>
            </div>

            <div className="flex justify-end space-x-4">
              <Button type="button" variant="outline">
                Cancelar
              </Button>
              <Button type="submit" className={componentStyles.scheduleForm.submitButton}>
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
