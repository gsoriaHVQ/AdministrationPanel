"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Search } from "lucide-react"
import { componentStyles } from "@/styles"
import { DoctorCard } from "./doctor-card"
import { getEspecialidadesV2, getMedicosPorEspecialidadV2 } from "@/lib/api"

import type { Doctor } from "@/lib/types"

interface DoctorsListProps {
  doctors: Doctor[];
  onViewSchedule: (doctorId: string) => void;
}

export function DoctorsList({ doctors, onViewSchedule }: DoctorsListProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedSpecialty, setSelectedSpecialty] = useState("")
  const [specialties, setSpecialties] = useState<string[]>([])
  const [filteredDoctors, setFilteredDoctors] = useState<Doctor[]>([])
  const [loadingDoctors, setLoadingDoctors] = useState(false)
  const [errorDoctors, setErrorDoctors] = useState("")

  // Cargar especialidades desde API v2, con fallback a props si falla
  useEffect(() => {
    getEspecialidadesV2()
      .then((data: any[]) => {
        const names = Array.from(
          new Set(
            (data || []).map((d: any) => {
              if (typeof d === "string") return d
              return (
                d.nombre_especialidad ||
                d.descripcion ||
                d.especialidad ||
                d.descripcion_item ||
                String(d?.codigo_especialidad || "")
              )
            })
          )
        )
          .filter((v) => typeof v === "string" && v.trim().length > 0)
          .map((v) => String(v))
          .sort()

        if (names.length === 0) {
          setSpecialties(Array.from(new Set(doctors.map((d: Doctor) => d.specialty))).sort())
        } else {
          setSpecialties(names)
        }
      })
      .catch(() => {
        setSpecialties(Array.from(new Set(doctors.map((d: Doctor) => d.specialty))).sort())
      })
  }, [doctors])

  // Consultar médicos por especialidad (v2)
  useEffect(() => {
    if (!selectedSpecialty) {
      setFilteredDoctors([])
      return
    }
    setLoadingDoctors(true)
    setErrorDoctors("")
    getMedicosPorEspecialidadV2(selectedSpecialty)
      .then((data: any[]) => {
        const mapped: Doctor[] = (data || []).map((d: any) => ({
          id: String(d.id ?? d.codigo_prestador ?? d.codigo ?? d.codigo_item ?? `${d.nombre_prestador || d.name}-${selectedSpecialty}`),
          name: String(d.name ?? d.nombre_prestador ?? d.nombre ?? ""),
          specialty: String(d.specialty ?? d.descripcion_item ?? d.especialidad ?? selectedSpecialty),
          email: String(d.email ?? d.mnemonico ?? d.correo ?? ""),
          phone: String(d.phone ?? d.telefono ?? ""),
          isActive: Boolean(d.isActive ?? true),
        }))
        setFilteredDoctors(mapped)
      })
      .catch(() => {
        setErrorDoctors("Error al cargar médicos")
        setFilteredDoctors([])
      })
      .finally(() => setLoadingDoctors(false))
  }, [selectedSpecialty])

  // Filtrar por búsqueda, sobre el resultado recibido por especialidad
  const doctorsToShow = filteredDoctors.filter((doctor: Doctor) =>
    doctor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    doctor.specialty.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div>
          <h2 className={componentStyles.doctorsList.title}>Gestión de Médicos</h2>
          <p className={componentStyles.doctorsList.subtitle}>Administre la información de los médicos y sus horarios</p>
        </div>
        <div className="flex gap-2 items-center">
          <select
            className="border rounded px-2 py-1 text-sm"
            value={selectedSpecialty}
            onChange={(e) => setSelectedSpecialty(e.target.value)}
          >
            <option value="">Todas las especialidades</option>
            {specialties.map((spec, i) => (
              <option key={`${spec}-${i}`} value={spec}>{spec}</option>
            ))}
          </select>
        </div>
      </div>

      <Card>
        <CardHeader>
          <div className={componentStyles.doctorsList.searchContainer}>
            <Search className="h-5 w-5 text-gray-400" />
            <Input
              placeholder="Buscar por nombre o especialidad..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-sm"
            />
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4">
            {doctorsToShow.map((doctor, idx) => (
              <DoctorCard
                key={`${doctor.id}-${idx}`}
                doctor={doctor}
                onViewSchedule={onViewSchedule}
              />
            ))}
          </div>

          {errorDoctors && (
            <div className="text-sm text-red-600 mt-4">{errorDoctors}</div>
          )}

          {doctorsToShow.length === 0 && !loadingDoctors && (
            <div className={componentStyles.doctorsList.emptyState}>
              <Search className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p>No se encontraron médicos que coincidan con la búsqueda</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

