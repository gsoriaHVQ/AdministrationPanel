"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Calendar, Search } from "lucide-react"

import type { Doctor } from "@/lib/types"

interface DoctorsListProps {
  doctors: Doctor[];
  onViewSchedule: (doctorId: string) => void;
}

export function DoctorsList({ doctors, onViewSchedule }: DoctorsListProps) {

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSpecialty, setSelectedSpecialty] = useState("");
  const [specialties, setSpecialties] = useState<string[]>([]);
  const [filteredDoctors, setFilteredDoctors] = useState<Doctor[]>([]);
  const [loadingDoctors, setLoadingDoctors] = useState(false);
  const [errorDoctors, setErrorDoctors] = useState("");

  // Inicializar especialidades desde la prop doctors (solo para el select)
  useEffect(() => {
    setSpecialties(Array.from(new Set(doctors.map((d: Doctor) => d.specialty))).sort());
  }, [doctors]);

  // Consultar médicos por especialidad
  useEffect(() => {
    if (selectedSpecialty) {
      setLoadingDoctors(true);
      setErrorDoctors("");
      import("@/lib/api").then(api => {
        api.getMedicosPorEspecialidad(selectedSpecialty)
          .then((data: any[]) => {
            const mapped = data.map((d: any) => ({
              id: d.codigo_prestador,
              name: d.nombre_prestador,
              specialty: d.descripcion_item,
              email: d.mnemonico || "",
              phone: d.telefono || "",
              isActive: true // o el campo correcto si lo tienes
            }));
            setFilteredDoctors(mapped);
            setLoadingDoctors(false);
          })
          .catch(() => {
            setErrorDoctors("Error al cargar médicos");
            setFilteredDoctors([]);
            setLoadingDoctors(false);
          });
      });
    } else {
      setFilteredDoctors([]);
    }
  }, [selectedSpecialty]);

  // Filtrar por búsqueda, solo mostrar los médicos de la especialidad seleccionada
  const doctorsToShow = filteredDoctors.filter(
    (doctor: Doctor) =>
      doctor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doctor.specialty.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-[#8B1538]">Gestión de Médicos</h2>
          <p className="text-gray-600">Administre la información de los médicos y sus horarios</p>
        </div>
        <div className="flex gap-2 items-center">
          <select
            className="border rounded px-2 py-1 text-sm"
            value={selectedSpecialty}
            onChange={(e) => setSelectedSpecialty(e.target.value)}
          >
            <option value="">Todas las especialidades</option>
            {specialties.map((spec) => (
              <option key={spec} value={spec}>{spec}</option>
            ))}
          </select>
        </div>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center space-x-2">
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
            {doctorsToShow.map((doctor) => (
              <div key={String(doctor.id) + '-' + (doctor.email || '') + '-' + (doctor.specialty || '')} className="flex items-center justify-between p-4 border-b border-gray-100">
                <div className="flex-1">
                  <div className="flex items-center space-x-3">
                    <div>
                      <h3 className="font-semibold text-gray-900">{doctor.name}</h3>
                      <p className="text-sm text-[#8B1538] font-medium">{doctor.specialty}</p>
                    </div>
                    <Badge variant={doctor.isActive ? "default" : "secondary"} className="ml-2">
                      {doctor.isActive ? "Activo" : "Inactivo"}
                    </Badge>
                  </div>
                  <div className="flex items-center space-x-4 mt-2 text-sm text-gray-600">
                    <span>{doctor.email}</span>
                    <span>{doctor.phone}</span>
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onViewSchedule(doctor.id)}
                  className="border-[#8B1538] text-[#8B1538] hover:bg-[#8B1538] hover:text-white"
                >
                  <Calendar className="h-4 w-4 mr-2" />
                  Ver Horarios
                </Button>
              </div>
            ))}
          </div>

          {doctorsToShow.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <Search className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p>No se encontraron médicos que coincidan con la búsqueda</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

