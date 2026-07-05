import { Obra, Personal, Reporte } from '../types';

const API_BASE = import.meta.env.VITE_API_BASE ?? 'http://localhost:4000/api';
const TOKEN_KEY = 'hexacall_token';

function authFetch(input: RequestInfo | URL, init: RequestInit = {}) {
  const token = localStorage.getItem(TOKEN_KEY);
  const headers = new Headers(init.headers);
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }
  return fetch(input, { ...init, headers });
}

async function verificarRespuesta<T>(response: Response): Promise<T> {
  const texto = await response.text();
  if (!response.ok) {
    throw new Error(`API error ${response.status}: ${texto}`);
  }
  return texto ? JSON.parse(texto) as T : ({} as T);
}

export async function obtenerObras(): Promise<Obra[]> {
  const response = await authFetch(`${API_BASE}/obras`);
  return verificarRespuesta<Obra[]>(response);
}

export async function guardarObras(obras: Obra[]): Promise<void> {
  const response = await authFetch(`${API_BASE}/obras`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(obras),
  });
  await verificarRespuesta<void>(response);
}

export async function obtenerPersonal(): Promise<Personal[]> {
  const response = await authFetch(`${API_BASE}/personal`);
  return verificarRespuesta<Personal[]>(response);
}

export async function guardarPersonal(personal: Personal[]): Promise<void> {
  const response = await authFetch(`${API_BASE}/personal`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(personal),
  });
  await verificarRespuesta<void>(response);
}

export async function obtenerReportes(): Promise<Reporte[]> {
  const response = await authFetch(`${API_BASE}/reportes`);
  return verificarRespuesta<Reporte[]>(response);
}

export async function guardarReportes(reportes: Reporte[]): Promise<void> {
  const response = await authFetch(`${API_BASE}/reportes`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(reportes),
  });
  await verificarRespuesta<void>(response);
}

export async function migrarDatos(data: { obras: Obra[]; personal: Personal[]; reportes: Reporte[] }): Promise<void> {
  const response = await authFetch(`${API_BASE}/migrate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  await verificarRespuesta<void>(response);
}

// Operaciones CRUD por documento - Obras
export async function obtenerObraPorId(id: string): Promise<Obra> {
  const response = await authFetch(`${API_BASE}/obras/${encodeURIComponent(id)}`);
  return verificarRespuesta<Obra>(response);
}

export async function crearObra(obra: Obra): Promise<Obra> {
  const response = await authFetch(`${API_BASE}/obras`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(obra),
  });
  return verificarRespuesta<Obra>(response);
}

export async function actualizarObra(id: string, cambios: Partial<Obra>): Promise<Obra> {
  const response = await authFetch(`${API_BASE}/obras/${encodeURIComponent(id)}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(cambios),
  });
  return verificarRespuesta<Obra>(response);
}

export async function eliminarObra(id: string): Promise<void> {
  const response = await authFetch(`${API_BASE}/obras/${encodeURIComponent(id)}`, { method: 'DELETE' });
  await verificarRespuesta<void>(response);
}

// Personal
export async function crearPersonal(personal: Personal): Promise<Personal> {
  const response = await authFetch(`${API_BASE}/personal`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(personal),
  });
  return verificarRespuesta<Personal>(response);
}

export async function actualizarPersonal(id: string, cambios: Partial<Personal>): Promise<Personal> {
  const response = await authFetch(`${API_BASE}/personal/${encodeURIComponent(id)}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(cambios),
  });
  return verificarRespuesta<Personal>(response);
}

export async function eliminarPersonalById(id: string): Promise<void> {
  const response = await authFetch(`${API_BASE}/personal/${encodeURIComponent(id)}`, { method: 'DELETE' });
  await verificarRespuesta<void>(response);
}

// Reportes
export async function crearReporte(reporte: Reporte): Promise<Reporte> {
  const response = await authFetch(`${API_BASE}/reportes`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(reporte),
  });
  return verificarRespuesta<Reporte>(response);
}

export async function actualizarReporte(id: string, cambios: Partial<Reporte>): Promise<Reporte> {
  const response = await authFetch(`${API_BASE}/reportes/${encodeURIComponent(id)}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(cambios),
  });
  return verificarRespuesta<Reporte>(response);
}

export async function eliminarReporteById(id: string): Promise<void> {
  const response = await authFetch(`${API_BASE}/reportes/${encodeURIComponent(id)}`, { method: 'DELETE' });
  await verificarRespuesta<void>(response);
}
