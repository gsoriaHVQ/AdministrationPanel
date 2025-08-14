"use client"

import { useEffect, useMemo, useState } from "react"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { componentStyles } from "@/styles"
import { getCatalogoDias, getCatalogoEdificios, getPisosPorEdificio, getCatalogoConsultorios, getEspecialidadesV2 } from "@/lib/api"

interface CreateScheduleFormProps {
	onCreate: (payload: any) => void
	onCancel: () => void
	doctors: Array<{ id: string; name: string; specialty: string }>
	defaultDoctorId?: string
}

export function CreateScheduleForm({ onCreate, onCancel, doctors, defaultDoctorId }: CreateScheduleFormProps) {
	const [doctorId, setDoctorId] = useState<string>(defaultDoctorId || "")
	const [specialty, setSpecialty] = useState<string>("")
	const [location, setLocation] = useState<string>("2")
	const [floor, setFloor] = useState<string>("")
	const [office, setOffice] = useState<string>("")
	const [day, setDay] = useState<string>("")
	const [startTime, setStartTime] = useState<string>("")
	const [endTime, setEndTime] = useState<string>("")

	const [diasCatalog, setDiasCatalog] = useState<Array<{ codigo: string; descripcion: string }>>([])
	const [edificiosCatalog, setEdificiosCatalog] = useState<Array<{ codigo: string; descripcion: string }>>([])
	const [pisosByEdificio, setPisosByEdificio] = useState<Record<string, Array<{ codigo: string; descripcion: string }>>>({})
	const [consultoriosCatalog, setConsultoriosCatalog] = useState<Array<{ codigo: string; descripcion: string; codigo_edificio?: string; codigo_piso?: string }>>([])
	const [specialties, setSpecialties] = useState<string[]>([])

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
		getEspecialidadesV2().then((items) => setSpecialties(Array.from(new Set((items || []).filter(Boolean))))).catch(() => setSpecialties([]))
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

	useEffect(() => {
		if (location) void loadPisos(location)
	}, [location])

	useEffect(() => {
		// defaults derivados
		const doc = doctors.find((d) => String(d.id) === String(doctorId))
		if (!specialty && doc?.specialty) setSpecialty(doc.specialty)
	}, [doctorId, doctors, specialty])

	const pisosForLocation = useMemo(() => pisosByEdificio[location] || [], [pisosByEdificio, location])

	// Pisos derivados desde consultorios por si el catálogo de pisos viene incompleto
	const pisosFromConsultorios = useMemo(() => {
		const seen = new Set<string>()
		const list = consultoriosCatalog
			.filter((c) => String(c.codigo_edificio || "") === String(location))
			.map((c) => String(c.codigo_piso || ""))
			.filter(Boolean)
		const merged: Array<{ codigo: string; descripcion: string }> = []
		for (const code of list) {
			if (seen.has(code)) continue
			seen.add(code)
			const inCatalog = (pisosByEdificio[location] || []).find((p) => String(p.codigo) === String(code))
			merged.push({ codigo: String(code), descripcion: inCatalog?.descripcion || `PISO ${code}` })
		}
		return merged
	}, [consultoriosCatalog, pisosByEdificio, location])

	// Opciones de pisos finales (catálogo oficial + derivados por consultorios)
	const uniquePisosForLocation = useMemo(() => {
		const seen = new Set<string>()
		const combined = [...(pisosForLocation || []), ...pisosFromConsultorios]
		const uniq: Array<{ codigo: string; descripcion: string }> = []
		for (const p of combined) {
			const key = String(p.codigo)
			if (seen.has(key)) continue
			seen.add(key)
			uniq.push({ codigo: String(p.codigo), descripcion: p.descripcion })
		}
		return uniq
	}, [pisosForLocation, pisosFromConsultorios])

	const consultoriosFiltered = useMemo(
		() => {
			// Primero por edificio
			let base = consultoriosCatalog.filter((c) => String(c.codigo_edificio || "") === String(location))
			// Si hay piso seleccionado, filtra por piso
			if (floor) base = base.filter((c) => String(c.codigo_piso || "") === String(floor))
			// Si aun así no hay resultados, mostramos todos los consultorios del edificio como fallback
			if (base.length === 0) base = consultoriosCatalog.filter((c) => String(c.codigo_edificio || "") === String(location))
			return base
		},
		[consultoriosCatalog, location, floor]
	)
	const uniqueConsultoriosFiltered = useMemo(() => {
		const seen = new Set<string>()
		return (consultoriosFiltered || []).filter((c) => {
			const key = String(c.codigo)
			if (seen.has(key)) return false
			seen.add(key)
			return true
		})
	}, [consultoriosFiltered])

	useEffect(() => {
		// si cambia edificio, intenta autoseleccionar primer piso válido
		if (!floor && uniquePisosForLocation.length > 0) setFloor(String(uniquePisosForLocation[0].codigo))
	}, [uniquePisosForLocation, floor])

	useEffect(() => {
		// si cambia piso, ajusta consultorio si ya no coincide
		if (office && !consultoriosFiltered.find((c) => String(c.codigo) === String(office))) {
			setOffice(consultoriosFiltered[0] ? String(consultoriosFiltered[0].codigo) : "")
		}
	}, [consultoriosFiltered, office])

	const canSave = doctorId && specialty && location && floor && office && day && startTime && endTime

	return (
		<div className="space-y-4">
			<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
				<div className="space-y-2">
					<Label className={componentStyles.scheduleManager.fieldLabel}>Médico</Label>
					<Select value={doctorId || undefined} onValueChange={setDoctorId}>
						<SelectTrigger>
							<SelectValue placeholder="Seleccione médico" />
						</SelectTrigger>
						<SelectContent>
							{doctors.map((d) => (
								<SelectItem key={`doc-${d.id}`} value={d.id}>{d.name}</SelectItem>
							))}
						</SelectContent>
					</Select>
				</div>
				<div className="space-y-2">
					<Label className={componentStyles.scheduleManager.fieldLabel}>Especialidad</Label>
					<Select value={specialty || undefined} onValueChange={setSpecialty}>
						<SelectTrigger>
							<SelectValue placeholder="Seleccione especialidad" />
						</SelectTrigger>
						<SelectContent>
							{[...new Set([specialty, ...specialties].filter(Boolean))].map((sp) => (
								<SelectItem key={`sp-${sp}`} value={sp}>{sp}</SelectItem>
							))}
						</SelectContent>
					</Select>
				</div>
				<div className="space-y-2">
					<Label className={componentStyles.scheduleManager.fieldLabel}>Edificio</Label>
					<Select value={location || undefined} onValueChange={(v) => { setLocation(v); setFloor(""); setOffice("") }}>
						<SelectTrigger>
							<SelectValue placeholder="Seleccione edificio" />
						</SelectTrigger>
						<SelectContent>
							{edificiosCatalog.map((e) => (
								<SelectItem key={`ed-${e.codigo}`} value={e.codigo}>{e.descripcion}</SelectItem>
							))}
						</SelectContent>
					</Select>
				</div>
				<div className="space-y-2">
					<Label className={componentStyles.scheduleManager.fieldLabel}>Piso</Label>
					<Select value={floor || undefined} onValueChange={(v) => { setFloor(v); setOffice("") }}>
						<SelectTrigger>
							<SelectValue placeholder="Seleccione piso" />
						</SelectTrigger>
						<SelectContent>
						{uniquePisosForLocation.map((p, idx) => (
							<SelectItem key={`p-${String(p.codigo)}-${idx}`} value={String(p.codigo)}>{p.descripcion}</SelectItem>
						))}
						</SelectContent>
					</Select>
				</div>
				<div className="space-y-2">
					<Label className={componentStyles.scheduleManager.fieldLabel}>Consultorio</Label>
					<Select value={office || undefined} onValueChange={setOffice}>
						<SelectTrigger>
							<SelectValue placeholder="Seleccione consultorio" />
						</SelectTrigger>
						<SelectContent>
						{uniqueConsultoriosFiltered.map((c, idx) => (
							<SelectItem key={`c-${String(c.codigo)}-${idx}`} value={String(c.codigo)}>{c.descripcion}</SelectItem>
						))}
						</SelectContent>
					</Select>
				</div>
				<div className="space-y-2">
					<Label className={componentStyles.scheduleManager.fieldLabel}>Día</Label>
					<Select value={day || undefined} onValueChange={setDay}>
						<SelectTrigger>
							<SelectValue placeholder="Seleccione día" />
						</SelectTrigger>
						<SelectContent>
							{diasCatalog.map((d) => (
								<SelectItem key={`d-${d.codigo}`} value={d.codigo}>{d.descripcion}</SelectItem>
							))}
						</SelectContent>
					</Select>
				</div>
				<div className="space-y-2">
					<Label className={componentStyles.scheduleManager.fieldLabel}>Hora inicio</Label>
					<Input type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)} />
				</div>
				<div className="space-y-2">
					<Label className={componentStyles.scheduleManager.fieldLabel}>Hora fin</Label>
					<Input type="time" value={endTime} onChange={(e) => setEndTime(e.target.value)} />
				</div>
			</div>

			<div className="flex justify-end gap-2 pt-2">
				<Button variant="outline" onClick={onCancel}>Cancelar</Button>
				<Button
					disabled={!canSave}
					onClick={() => onCreate({
						doctorId,
						specialty,
						location,
						floor,
						office,
						weekDays: [Number(day)],
						startTime,
						endTime,
						action: "create",
					})}
				>
					Crear agenda
				</Button>
			</div>
		</div>
	)
}


