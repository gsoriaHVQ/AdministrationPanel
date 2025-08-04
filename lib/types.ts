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
  weekDays: number[] // Array de números 0-6 (Lun-Dom)
  startTime: string
  endTime: string
  isAvailable: boolean
}

export interface User {
  id: string
  email: string
  role: "admin" | "tics"
  name: string
}
