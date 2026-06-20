import { Obra, Personal, Reporte } from './types';

const CLAVE_OBRAS = 'hexacall_obras';
const CLAVE_PERSONAL = 'hexacall_personal';
const CLAVE_REPORTES = 'hexacall_reportes';
const CLAVE_SESION = 'hexacall_sesion';

const OBRAS_DEFECTO: Obra[] = [
  { id: 'obra-1', nombre: 'Residencial Torre Alameda', estado: 'en curso', ubicacion: 'Av. de las Ciencias 450, Santiago', presupuesto: 12400000 },
  { id: 'obra-2', nombre: 'Centro Infantil Las Flores', estado: 'pausada', ubicacion: 'Calle Pensamiento 12, Valparaíso', presupuesto: 4200000 },
  { id: 'obra-3', nombre: 'Pavimentación Autovía Norte', estado: 'finalizada', ubicacion: 'Km 45 Ruta 5 Norte', presupuesto: 8900000 },
  { id: 'obra-4', nombre: 'Edificio Corporativo Andes', estado: 'finalizada', ubicacion: 'Av. Apoquindo 3000, Las Condes', presupuesto: 99445 },
];

const PERSONAL_DEFECTO: Personal[] = [
  { id: 'pers-1', nombre: 'Carlos Mendoza', cargo: 'Supervisor de Obra', obraId: 'obra-1' },
  { id: 'pers-2', nombre: 'Héctor Silva', cargo: 'Ingeniero Calculista', obraId: 'obra-1' },
  { id: 'pers-3', nombre: 'Sofía Valenzuela', cargo: 'Prevencionista de Riesgos', obraId: 'obra-1' },
  { id: 'pers-4', nombre: 'Luis Ortega', cargo: 'Maestro Albañil', obraId: 'obra-2' },
  { id: 'pers-5', nombre: 'Andrés Castro', cargo: 'Electricista Autorizado', obraId: 'obra-3' },
];

const REPORTES_DEFECTO: Reporte[] = [
  { id: 'rep-1', obraId: 'obra-1', fecha: '2026-06-11', descripcion: 'Vaciado de hormigón en losas del tercer piso completado con éxito.' },
  { id: 'rep-2', obraId: 'obra-1', fecha: '2026-06-12', descripcion: 'Instalación de tuberías sanitarias principales.' },
  { id: 'rep-3', obraId: 'obra-2', fecha: '2026-05-15', descripcion: 'Faenas suspendidas temporalmente. Se realizó aseo y acopio.' },
  { id: 'rep-4', obraId: 'obra-3', fecha: '2026-06-05', descripcion: 'Pintado de señalética vial completado conforme.' },
  { id: 'rep-5', obraId: 'obra-4', fecha: '2026-06-10', descripcion: 'Revisión de instalaciones eléctricas en planta baja.' },
  { id: 'rep-6', obraId: 'obra-1', fecha: '2026-06-14', descripcion: 'Montaje de enfierradura en muros perimetrales del cuarto piso.' },
];

export const Almacenamiento = {
  inicializar() {
    if (!localStorage.getItem(CLAVE_OBRAS)) localStorage.setItem(CLAVE_OBRAS, JSON.stringify(OBRAS_DEFECTO));
    if (!localStorage.getItem(CLAVE_PERSONAL)) localStorage.setItem(CLAVE_PERSONAL, JSON.stringify(PERSONAL_DEFECTO));
    if (!localStorage.getItem(CLAVE_REPORTES)) localStorage.setItem(CLAVE_REPORTES, JSON.stringify(REPORTES_DEFECTO));
  },
  obtenerObras(): Obra[] {
    this.inicializar();
    try {
      return JSON.parse(localStorage.getItem(CLAVE_OBRAS) || '[]');
    } catch {
      return OBRAS_DEFECTO;
    }
  },
  guardarObras(obras: Obra[]) {
    localStorage.setItem(CLAVE_OBRAS, JSON.stringify(obras));
  },
  obtenerPersonal(): Personal[] {
    this.inicializar();
    try {
      return JSON.parse(localStorage.getItem(CLAVE_PERSONAL) || '[]');
    } catch {
      return PERSONAL_DEFECTO;
    }
  },
  guardarPersonal(personal: Personal[]) {
    localStorage.setItem(CLAVE_PERSONAL, JSON.stringify(personal));
  },
  obtenerReportes(): Reporte[] {
    this.inicializar();
    try {
      return JSON.parse(localStorage.getItem(CLAVE_REPORTES) || '[]');
    } catch {
      return REPORTES_DEFECTO;
    }
  },
  guardarReportes(reportes: Reporte[]) {
    localStorage.setItem(CLAVE_REPORTES, JSON.stringify(reportes));
  },
  obtenerSesionActiva(): string | null {
    return localStorage.getItem(CLAVE_SESION);
  },
  guardarSesionActiva(correo: string | null) {
    if (correo) {
      localStorage.setItem(CLAVE_SESION, correo);
    } else {
      localStorage.removeItem(CLAVE_SESION);
    }
  },
};

export function formatearMoneda(monto?: number): string {
  if (monto === undefined || monto === null) return '$0';
  return new Intl.NumberFormat('es-CL', {
    style: 'currency',
    currency: 'CLP',
    maximumFractionDigits: 0,
  }).format(monto);
}

// Sanitizar campo de texto para prevenir inyecciones HTML/Scripting
export function sanitizarTexto(entrada: string): string {
  if (!entrada) return '';
  return entrada
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
}
