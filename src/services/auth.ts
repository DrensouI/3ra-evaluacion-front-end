export interface SesionRespuesta {
  correo: string;
  nombre: string;
  rol: string;
  ultimoAcceso: string;
}

const API_BASE = import.meta.env.VITE_API_BASE ?? 'http://localhost:4000/api';

async function verificarRespuesta<T>(response: Response): Promise<T> {
  const texto = await response.text();
  if (!response.ok) {
    throw new Error(`API error ${response.status}: ${texto}`);
  }
  return texto ? JSON.parse(texto) as T : ({} as T);
}

export async function loginAdmin(correo: string, clave: string): Promise<SesionRespuesta> {
  const response = await fetch(`${API_BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ correo, clave }),
  });
  return verificarRespuesta<SesionRespuesta>(response);
}
