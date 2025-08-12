export interface Doctor {
  id: string
  name: string
  specialty: string
  email: string
  phone: string
  isActive: boolean
}

export interface Schedule {
  id: string
  doctorId: string
  doctorName: string
  specialty: string
  location: string
  office: string
  weekDays: number[]
  startTime: string
  endTime: string
  isAvailable: boolean
}

// Tipos genéricos para catálogos
export interface CatalogoItem {
  codigo: string
  descripcion: string
}

export type Consultorio = CatalogoItem
export type Dia = CatalogoItem
export type Edificio = CatalogoItem
export type Piso = CatalogoItem

// AGND_AGENDA (persistencia de agendas)
export interface Agenda {
  id: string
  doctorId: string
  specialty: string
  location: string
  office: string
  weekDays: number[]
  startTime: string
  endTime: string
  isAvailable: boolean
}

export type AgendaCreatePayload = Omit<Agenda, "id">
export type AgendaUpdatePayload = Partial<AgendaCreatePayload>

export interface User {
  id: string
  email: string
  role: "admin" | "tics"
  name: string
}
