const API_URL = "http://localhost:3001";

// Obtener todos los médicos
export async function getMedicos() {
  const res = await fetch(`${API_URL}/medicos`);
  if (!res.ok) throw new Error("Error al obtener médicos");
  const json = await res.json();
  return json.data;
}

// Obtener médicos por especialidad
export async function getMedicosPorEspecialidad(especialidad: string) {
  const res = await fetch(`${API_URL}/medicos/especialidad/${especialidad}`);
  if (!res.ok) throw new Error("Error al obtener médicos por especialidad");
  const json = await res.json();
  return json.data;
}

// Obtener médico por código de item
export async function getMedicoPorItem(item: string) {
  const res = await fetch(`${API_URL}/medicos/item/${item}`);
  if (!res.ok) throw new Error("Error al obtener médico por item");
  const json = await res.json();
  return json.data;
}

// Obtener médicos por nombre
export async function getMedicosPorNombre(nombre: string) {
  const res = await fetch(`${API_URL}/medicos/nombre/${nombre}`);
  if (!res.ok) throw new Error("Error al obtener médicos por nombre");
  const json = await res.json();
  return json.data;
}

// Verificar estado de la app
export async function getHealth() {
  const res = await fetch(`${API_URL}/health`);
  if (!res.ok) throw new Error("Error al verificar estado");
  return res.json();
}