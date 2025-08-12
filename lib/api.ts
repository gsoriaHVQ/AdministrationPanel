import type { Agenda, AgendaCreatePayload, AgendaUpdatePayload } from "./types";

const API_URL = "http://localhost:3001";

async function handleResponse(res: Response) {
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(text || `Error HTTP ${res.status}`);
  }
  const json = await res.json().catch(() => undefined);
  return json?.data ?? json;
}

function toArray(data: any): any[] {
  if (Array.isArray(data)) return data
  if (!data || typeof data !== "object") return []
  if (Array.isArray((data as any).items)) return (data as any).items
  // intenta encontrar la primera propiedad que sea array
  for (const v of Object.values(data)) {
    if (Array.isArray(v)) return v
  }
  return []
}

function mapCatalog(items: any[]): Array<{ codigo: string; descripcion: string }> {
  return (items || []).map((it: any) => {
    const codigo =
      it.codigo ??
      it.code ??
      it.id ??
      it.codigo_consultorio ??
      it.codigo_edificio ??
      it.codigo_piso ??
      it.codigo_dia ??
      it.codigo_especialidad ??
      it.value ?? ""

    const descripcion =
      it.descripcion ??
      it.nombre ??
      it.label ??
      it.nombre_consultorio ??
      it.nombre_edificio ??
      it.nombre_piso ??
      it.nombre_dia ??
      it.nombre_especialidad ?? ""

    return { codigo: String(codigo), descripcion: String(descripcion) }
  })
}

// -------------------------
// Catálogos
// -------------------------
export async function getCatalogoConsultorios() {
  const res = await fetch(`${API_URL}/api/catalogos/consultorios`);
  const data = await handleResponse(res);
  return mapCatalog(toArray(data));
}

export async function getCatalogoDias() {
  const res = await fetch(`${API_URL}/api/catalogos/dias`);
  const data = await handleResponse(res);
  return mapCatalog(toArray(data));
}

export async function getCatalogoEdificios() {
  const res = await fetch(`${API_URL}/api/catalogos/edificios`);
  const data = await handleResponse(res);
  return mapCatalog(toArray(data));
}

export async function getPisosPorEdificio(codigoEdificio: string) {
  const res = await fetch(`${API_URL}/api/catalogos/edificios/${encodeURIComponent(codigoEdificio)}/pisos`);
  const data = await handleResponse(res);
  return mapCatalog(toArray(data));
}

// -------------------------
// AGND_AGENDA
// -------------------------
export async function getAgendas(): Promise<Agenda[]> {
  const res = await fetch(`${API_URL}/api/agnd-agenda`);
  return handleResponse(res);
}

export async function getAgendaById(id: string): Promise<Agenda> {
  const res = await fetch(`${API_URL}/api/agnd-agenda/${encodeURIComponent(id)}`);
  return handleResponse(res);
}

export async function createAgenda(payload: AgendaCreatePayload): Promise<Agenda> {
  const res = await fetch(`${API_URL}/api/agnd-agenda`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  return handleResponse(res);
}

export async function updateAgenda(id: string, payload: AgendaUpdatePayload): Promise<Agenda> {
  const res = await fetch(`${API_URL}/api/agnd-agenda/${encodeURIComponent(id)}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  return handleResponse(res);
}

export async function deleteAgenda(id: string): Promise<{ success: boolean } | undefined> {
  const res = await fetch(`${API_URL}/api/agnd-agenda/${encodeURIComponent(id)}`, {
    method: "DELETE",
  });
  return handleResponse(res);
}

// -------------------------
// Médicos (v2)
// -------------------------
export async function getMedicosV2() {
  const res = await fetch(`${API_URL}/api/medicos`);
  return handleResponse(res);
}

export async function getEspecialidadesV2() {
  const res = await fetch(`${API_URL}/api/medicos/especialidades`);
  const data = await handleResponse(res);
  // normaliza a array de strings
  return toArray(data).map((it: any) => String(it?.nombre_especialidad ?? it?.descripcion ?? it?.especialidad ?? it))
}

export async function getMedicosPorEspecialidadV2(especialidad: string) {
  const res = await fetch(`${API_URL}/api/medicos/especialidad/${encodeURIComponent(especialidad)}`);
  return handleResponse(res);
}

export async function getMedicoPorItemV2(codigoItem: string) {
  const res = await fetch(`${API_URL}/api/medicos/item/${encodeURIComponent(codigoItem)}`);
  return handleResponse(res);
}

export async function getMedicosPorNombreV2(nombre: string) {
  const res = await fetch(`${API_URL}/api/medicos/nombre/${encodeURIComponent(nombre)}`);
  return handleResponse(res);
}

// -------------------------
// Compatibilidad (endpoints previos)
// -------------------------
export async function getMedicos() {
  const res = await fetch(`${API_URL}/medicos`);
  return handleResponse(res);
}

export async function getEspecialidades() {
  const res = await fetch(`${API_URL}/especialidades`);
  const data = await handleResponse(res);
  return toArray(data)
}

export async function getMedicosPorEspecialidad(especialidad: string) {
  const res = await fetch(`${API_URL}/medicos/especialidad/${encodeURIComponent(especialidad)}`);
  return handleResponse(res);
}

export async function getMedicoPorItem(item: string) {
  const res = await fetch(`${API_URL}/medicos/item/${encodeURIComponent(item)}`);
  return handleResponse(res);
}

export async function getMedicosPorNombre(nombre: string) {
  const res = await fetch(`${API_URL}/medicos/nombre/${encodeURIComponent(nombre)}`);
  return handleResponse(res);
}

// Verificar estado de la app
export async function getHealth() {
  const res = await fetch(`${API_URL}/health`);
  return handleResponse(res);
}