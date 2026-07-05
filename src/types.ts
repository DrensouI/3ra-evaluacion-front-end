export type EstadoObra = 'en curso' | 'pausada' | 'finalizada';

export interface Obra {
  id: string;
  nombre: string;
  estado: EstadoObra;
  ubicacion?: string;
  presupuesto?: number;
}

export interface Personal {
  id: string;
  nombre: string;
  cargo: string;
  obraId: string;
}

export interface Reporte {
  id: string;
  obraId: string;
  fecha: string;
  descripcion: string;
}

export interface SesionUsuario {
  correo: string;
  nombre: string;
  rol: string;
}


export interface DashboardProps {
  obras: Obra[];
  personal: Personal[];
  reportes: Reporte[];
  alNavegarPestaña: (pestaña: string) => void;
  logout: () => void;
  usuario: SesionUsuario | null;
  origenDatos: 'api' | 'local' | 'error';
  sincronizarDatos: () => Promise<void>;
  mensajeSync: string | null;
}

export interface ReportesProps {
  obras: Obra[];
  reportes: Reporte[];
  guardarReportes: (reportes: Reporte[]) => void;
  crearReporte: (reporte: Reporte) => Promise<void>;
  actualizarReporte: (id: string, cambios: Partial<Reporte>) => Promise<void>;
  eliminarReporte: (id: string) => Promise<void>;
}

export interface ObrasYProyectosProps {
  obras: Obra[];
  guardarObras: (obras: Obra[]) => void;
  selectedId?: string;
  crearObra?: (obra: Obra) => Promise<void>;
  actualizarObra?: (id: string, cambios: Partial<Obra>) => Promise<void>;
  eliminarObra?: (id: string) => Promise<void>;
}

export interface EmpleadosProps {
  obras: Obra[];
  personal: Personal[];
  guardarPersonal: (nuevoPersonal: Personal[]) => void;
  crearPersonal?: (p: Personal) => Promise<void>;
  actualizarPersonal?: (id: string, cambios: Partial<Personal>) => Promise<void>;
  eliminarPersonal?: (id: string) => Promise<void>;
}

export interface ReportesSectionProps {
  obras: Obra[];
  reportes: Reporte[];
  alEnviarReporte: (reporte: Reporte) => void;
  alEliminarReporte: (id: string) => void;
}

// Props de tus compañeros: ObrasSection
export interface ObrasSectionProps {
  obras: Obra[];
  personal: Personal[];
  reportes: Reporte[];
  idObraSeleccionada: string | null;
  alSeleccionarObra: (id: string | null) => void;
  alGuardarObra: (obra: Obra) => void;
  alEliminarObra: (id: string) => void;
  alNavegarPestaña: (pestaña: string) => void;
  alGuardarReporte?: (reporte: Reporte) => void;
  alEliminarReporte?: (id: string) => void;
}

export interface PersonalSectionProps {
  personal: Personal[];
  obras: Obra[];
  alGuardarPersonal: (trabajador: Personal) => void;
  alEliminarPersonal: (id: string) => void;
}

export interface ObrasRouteParams {
  id: string;
}
