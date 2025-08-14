"use client"

import { useState } from "react"
import Image from "next/image"
import { Header } from "@/components/layout/header"
import { LoginForm } from "@/components/auth/login-form"
import { DoctorsList } from "@/components/doctors/doctors-list"
import { ScheduleForm } from "@/components/schedules/schedule-form"
import { PublicSchedule } from "@/components/public/public-schedule"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Calendar, Users, Clock, Eye } from "lucide-react"

import { useEffect } from "react"
import { getMedicosV2Active } from "@/lib/api"

export default function HVQMedicalScheduler() {
	const [currentView, setCurrentView] = useState<
		"home" | "login" | "doctors" | "schedules" | "public"
	>("home")
	const [user, setUser] = useState<any>(null)
	const [isLoading, setIsLoading] = useState(false)
	const [loginError, setLoginError] = useState("")
	const [doctors, setDoctors] = useState<any[]>([])
	const [doctorsError, setDoctorsError] = useState<string>("")

useEffect(() => {
  if (currentView === "doctors" || currentView === "schedules") {
    getMedicosV2Active("ACTIVE")
      .then((data) => {
        const list = Array.isArray(data) ? data : (Array.isArray(data?.items) ? data.items : [])
        setDoctors(
          list.map((d: any, idx: number) => ({
            id: String(d.codigo_prestador ?? d.id ?? idx),
            name: String(d.nombres ?? d.nombre_prestador ?? d.name ?? ""),
            specialty: String(
              d.descripcion_agendamiento ??
              d.descripcion_item ??
              d.ds_item_agendamiento ??
              d.especialidad ??
              d.specialty ??
              ""
            ),
            email: String(d.mnemonico ?? d.email ?? ""),
            phone: String(d.telefono ?? d.phone ?? ""),
            isActive: true,
          }))
        )
      })
      .catch((e) => setDoctorsError(e.message))
  }
}, [currentView])

	const handleLogin = async (email: string, password: string) => {
		setIsLoading(true)
		setLoginError("")

		// Simulate login
		setTimeout(() => {
			if (email === "admin@hvq.com" && password === "admin123") {
				setUser({
					id: "1",
					name: "Administrador HVQ",
					email: "admin@hvq.com",
					role: "admin",
				})
				setCurrentView("doctors")
			} else {
				setLoginError("Credenciales incorrectas")
			}
			setIsLoading(false)
		}, 1000)
	}

	const handleLogout = () => {
		setUser(null)
		setCurrentView("home")
	}

	const handleViewSchedule = (doctorId: string) => {
		console.log("Ver horarios del médico:", doctorId)
	}

	const handleScheduleSubmit = (scheduleData: any) => {
		console.log("Nueva agenda:", scheduleData)
	}

	if (currentView === "home") {
		return (
			<div className="min-h-screen bg-white">
				<div className="container mx-auto px-4 py-8">
					<div className="text-center mb-12">
						<Image
							src="/images/hvq-logo.png"
							alt="Hospital Vozandes Quito"
							width={300}
							height={100}
							className="mx-auto mb-6"
						/>
						<h1 className="text-4xl font-bold text-[#8B1538] mb-4">
							Sistema de Agendas Médicas
						</h1>
						<p className="text-xl text-gray-600 max-w-2xl mx-auto">
							Gestión integral de horarios médicos para el Hospital Vozandes Quito
						</p>
					</div>

					<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
						<Card
							className="border border-gray-200 cursor-pointer hover:border-gray-300"
							onClick={() => setCurrentView("login")}
						>
							<CardContent className="p-6 text-center">
								<Users className="h-6 w-6 text-[#8B1538] mx-auto mb-4" />
								<h3 className="text-lg font-semibold mb-2">Administración</h3>
								<p className="text-gray-600 text-sm mb-4">
									Acceso para administradores y personal TICS
								</p>
								<Button className="w-full bg-[#8B1538] hover:bg-[#6B1028] text-white">
									Ingresar
								</Button>
							</CardContent>
						</Card>

						<Card
							className="border border-gray-200 cursor-pointer hover:border-gray-300"
							onClick={() => setCurrentView("public")}
						>
							<CardContent className="p-6 text-center">
								<Eye className="h-6 w-6 text-[#8B1538] mx-auto mb-4" />
								<h3 className="text-lg font-semibold mb-2">Consulta Pública</h3>
								<p className="text-gray-600 text-sm mb-4">
									Ver horarios disponibles sin autenticación
								</p>
								<Button
									variant="outline"
									className="w-full border-[#8B1538] text-[#8B1538] hover:bg-[#8B1538] hover:text-white bg-transparent"
								>
									Ver Agendas
								</Button>
							</CardContent>
						</Card>

						<Card className="opacity-75">
							<CardContent className="p-6 text-center">
								<Calendar className="h-6 w-6 text-gray-400 mx-auto mb-4" />
								<h3 className="text-lg font-semibold mb-2 text-gray-600">
									Gestión de Agendas
								</h3>
								<p className="text-gray-500 text-sm mb-4">
									Criar y modificar horarios médicos
								</p>
								<Button disabled className="w-full">
									Requiere Acceso
								</Button>
							</CardContent>
						</Card>

						<Card className="opacity-75">
							<CardContent className="p-6 text-center">
								<Clock className="h-6 w-6 text-gray-400 mx-auto mb-4" />
								<h3 className="text-lg font-semibold mb-2 text-gray-600">
									Gestión de Médicos
								</h3>
								<p className="text-gray-500 text-sm mb-4">
									Administrar información de médicos
								</p>
								<Button disabled className="w-full">
									Requiere Acceso
								</Button>
							</CardContent>
						</Card>
					</div>

					<div className="text-center mt-12 text-gray-600">
						<p className="text-sm">
							© 2024 Hospital Vozandes Quito - "A la gloria de Dios y al Servicio
							del Ecuador"
						</p>
					</div>
				</div>
			</div>
		)
	}

	return (
		<div className="min-h-screen bg-gray-50">
			<Header user={user} onLogout={handleLogout} />

			<main className="container mx-auto px-4 py-8">
				{currentView === "login" && (
					<div className="max-w-md mx-auto mt-12">
						<LoginForm
							onLogin={handleLogin}
							isLoading={isLoading}
							error={loginError}
						/>
						<div className="text-center mt-4">
							<Button
								variant="ghost"
								onClick={() => setCurrentView("home")}
								className="text-[#8B1538]"
							>
								← Volver al inicio
							</Button>
						</div>
					</div>
				)}

				{currentView === "doctors" && user && (
					<div>
						<div className="flex justify-between items-center mb-6">
							<div></div>
							<div className="space-x-2">
								<Button
									variant="outline"
									onClick={() => setCurrentView("schedules")}
									className="border-[#8B1538] text-[#8B1538] hover:bg-[#8B1538] hover:text-white"
								>
									<Calendar className="h-4 w-4 mr-2" />
									Gestionar Agendas
								</Button>
							</div>
						</div>
						{doctorsError ? (
							<div className="text-red-500">{doctorsError}</div>
						) : (
							<DoctorsList
								doctors={doctors}
								onViewSchedule={handleViewSchedule}
							/>
						)}
					</div>
				)}

				{currentView === "schedules" && user && (
					<div>
						<div className="flex justify-between items-center mb-6">
							<div></div>
							<Button
								variant="outline"
								onClick={() => setCurrentView("doctors")}
								className="border-[#8B1538] text-[#8B1538] hover:bg-[#8B1538] hover:text-white"
							>
								<Users className="h-4 w-4 mr-2" />
								Gestionar Médicos
							</Button>
						</div>
						<ScheduleForm onSubmit={handleScheduleSubmit} doctors={doctors} />
					</div>
				)}

				{currentView === "public" && (
					<div>
						<div className="text-center mb-6">
							<Button
								variant="ghost"
								onClick={() => setCurrentView("home")}
								className="text-[#8B1538]"
							>
								← Volver al inicio
							</Button>
						</div>
						<PublicSchedule />
					</div>
				)}
			</main>
		</div>
	)
}
