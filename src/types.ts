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
