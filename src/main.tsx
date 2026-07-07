import React, { useState, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Routes, Route, Navigate, useNavigate, useParams } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './componentes/Login';
import Dashboard from './componentes/Dashboard';
import ObrasYProyectos from './componentes/ObrasYProyectos';
import Reportes from './componentes/Reportes';
import { Almacenamiento } from './utils';
import { Obra, Personal, Reporte } from './types';
import SideBar from './componentes/sidebar';
import Empleados from './componentes/Personal';
import * as FirestoreService from './services/firestore';

// Componente Guardián que intercepta los accesos no autorizados a la intranet
function ProtectedRoute({ children }: { children: JSX.Element }) {
  const { estaAutenticado, cargando } = useAuth();
  if (cargando) {
    return <div style={{ padding: '3rem', textAlign: 'center' }}>Verificando sesión…</div>;
  }
  if (!estaAutenticado) return <Navigate to="/" replace />;
  return children;
}

function App() {
  const { estaAutenticado, cargando: cargandoAuth } = useAuth();

  // Estados de los listados generales (obras, personal, reportes) cargados desde localStorage
  const [obras, setObras] = useState<Obra[]>(Almacenamiento.obtenerObras());
  const [personal, setPersonal] = useState<Personal[]>(Almacenamiento.obtenerPersonal());
  const [reportes, setReportes] = useState<Reporte[]>(Almacenamiento.obtenerReportes());
  const [cargandoInicial, setCargandoInicial] = useState(true);
  const [origenDatos, setOrigenDatos] = useState<'firestore' | 'local' | 'error'>('local');
  const [mensajeSync, setMensajeSync] = useState<string | null>(null);

  useEffect(() => {
    if (cargandoAuth) {
      return;
    }

    const cargarDesdeFirestore = async () => {
      if (!estaAutenticado) {
        setCargandoInicial(false);
        return;
      }

      try {
        const [obrasRemotas, personalRemoto, reportesRemotos] = await Promise.all([
          FirestoreService.obtenerObras(),
          FirestoreService.obtenerPersonal(),
          FirestoreService.obtenerReportes(),
        ]);

        setObras(obrasRemotas);
        setPersonal(personalRemoto);
        setReportes(reportesRemotos);
        Almacenamiento.guardarObras(obrasRemotas);
        Almacenamiento.guardarPersonal(personalRemoto);
        Almacenamiento.guardarReportes(reportesRemotos);
        setOrigenDatos('firestore');
      } catch (error) {
        console.warn('No se pudo conectar con Firestore, usando localStorage:', error);
        setOrigenDatos('local');
      } finally {
        setCargandoInicial(false);
      }
    };

    cargarDesdeFirestore();
  }, [estaAutenticado, cargandoAuth]);

  const guardarObras = async (items: Obra[]) => {
    Almacenamiento.guardarObras(items);
    setObras(items);
    try {
      await FirestoreService.guardarObras(items);
      setOrigenDatos('firestore');
    } catch (error) {
      console.error('No se pudo guardar obras en Firestore:', error);
      setOrigenDatos('error');
    }
  };

  // CRUD por documento - Obras
  const crearObra = async (obra: Obra) => {
    try {
      await FirestoreService.crearObra(obra);
      const obrasRemotas = await FirestoreService.obtenerObras();
      setObras(obrasRemotas);
      Almacenamiento.guardarObras(obrasRemotas);
      setOrigenDatos('firestore');
    } catch (err) {
      console.error('Crear obra falló, guardando localmente', err);
      const actual = [obra, ...obras];
      Almacenamiento.guardarObras(actual);
      setObras(actual);
      setOrigenDatos('error');
    }
  };

  const actualizarObra = async (id: string, cambios: Partial<Obra>) => {
    try {
      await FirestoreService.actualizarObra(id, cambios);
      const obrasRemotas = await FirestoreService.obtenerObras();
      setObras(obrasRemotas);
      Almacenamiento.guardarObras(obrasRemotas);
      setOrigenDatos('firestore');
    } catch (err) {
      console.error('Actualizar obra falló, actualizando localmente', err);
      const actual = obras.map(o => (o.id === id ? { ...o, ...cambios } : o));
      Almacenamiento.guardarObras(actual);
      setObras(actual);
      setOrigenDatos('error');
    }
  };

  const eliminarObra = async (id: string) => {
    try {
      await FirestoreService.eliminarObra(id);
      const obrasRemotas = await FirestoreService.obtenerObras();
      setObras(obrasRemotas);
      Almacenamiento.guardarObras(obrasRemotas);
      setOrigenDatos('firestore');
    } catch (err) {
      console.error('Eliminar obra falló, eliminando localmente', err);
      const actual = obras.filter(o => o.id !== id);
      Almacenamiento.guardarObras(actual);
      setObras(actual);
      setOrigenDatos('error');
    }
  };

  const guardarPersonal = async (items: Personal[]) => {
    Almacenamiento.guardarPersonal(items);
    setPersonal(items);
    try {
      await FirestoreService.guardarPersonal(items);
      setOrigenDatos('firestore');
    } catch (error) {
      console.error('No se pudo guardar personal en Firestore:', error);
      setOrigenDatos('error');
    }
  };

  // CRUD por documento - Personal
  const crearPersonal = async (p: Personal) => {
    try {
      await FirestoreService.crearPersonal(p);
      const personalRemoto = await FirestoreService.obtenerPersonal();
      setPersonal(personalRemoto);
      Almacenamiento.guardarPersonal(personalRemoto);
      setOrigenDatos('firestore');
    } catch (err) {
      console.error('Crear personal falló, guardando localmente', err);
      const actual = [p, ...personal];
      Almacenamiento.guardarPersonal(actual);
      setPersonal(actual);
      setOrigenDatos('error');
    }
  };

  const actualizarPersonal = async (id: string, cambios: Partial<Personal>) => {
    try {
      await FirestoreService.actualizarPersonal(id, cambios);
      const personalRemoto = await FirestoreService.obtenerPersonal();
      setPersonal(personalRemoto);
      Almacenamiento.guardarPersonal(personalRemoto);
      setOrigenDatos('firestore');
    } catch (err) {
      console.error('Actualizar personal falló, actualizando localmente', err);
      const actual = personal.map(p => (p.id === id ? { ...p, ...cambios } : p));
      Almacenamiento.guardarPersonal(actual);
      setPersonal(actual);
      setOrigenDatos('error');
    }
  };

  const eliminarPersonal = async (id: string) => {
    try {
      await FirestoreService.eliminarPersonal(id);
      const personalRemoto = await FirestoreService.obtenerPersonal();
      setPersonal(personalRemoto);
      Almacenamiento.guardarPersonal(personalRemoto);
      setOrigenDatos('firestore');
    } catch (err) {
      console.error('Eliminar personal falló, eliminando localmente', err);
      const actual = personal.filter(p => p.id !== id);
      Almacenamiento.guardarPersonal(actual);
      setPersonal(actual);
      setOrigenDatos('error');
    }
  };

  const guardarReportes = async (items: Reporte[]) => {
    Almacenamiento.guardarReportes(items);
    setReportes(items);
    try {
      await FirestoreService.guardarReportes(items);
      setOrigenDatos('firestore');
    } catch (error) {
      console.error('No se pudo guardar reportes en Firestore:', error);
      setOrigenDatos('error');
    }
  };

  // CRUD por documento - Reportes
  const crearReporte = async (r: Reporte) => {
    try {
      await FirestoreService.crearReporte(r);
      const reportesRemotos = await FirestoreService.obtenerReportes();
      setReportes(reportesRemotos);
      Almacenamiento.guardarReportes(reportesRemotos);
      setOrigenDatos('firestore');
    } catch (err) {
      console.error('Crear reporte falló, guardando localmente', err);
      const actual = [r, ...reportes];
      Almacenamiento.guardarReportes(actual);
      setReportes(actual);
      setOrigenDatos('error');
    }
  };

  const actualizarReporte = async (id: string, cambios: Partial<Reporte>) => {
    try {
      await FirestoreService.actualizarReporte(id, cambios);
      const reportesRemotos = await FirestoreService.obtenerReportes();
      setReportes(reportesRemotos);
      Almacenamiento.guardarReportes(reportesRemotos);
      setOrigenDatos('firestore');
    } catch (err) {
      console.error('Actualizar reporte falló, actualizando localmente', err);
      const actual = reportes.map(r => (r.id === id ? { ...r, ...cambios } : r));
      Almacenamiento.guardarReportes(actual);
      setReportes(actual);
      setOrigenDatos('error');
    }
  };

  const eliminarReporte = async (id: string) => {
    try {
      await FirestoreService.eliminarReporte(id);
      const reportesRemotos = await FirestoreService.obtenerReportes();
      setReportes(reportesRemotos);
      Almacenamiento.guardarReportes(reportesRemotos);
      setOrigenDatos('firestore');
    } catch (err) {
      console.error('Eliminar reporte falló, eliminando localmente', err);
      const actual = reportes.filter(r => r.id !== id);
      Almacenamiento.guardarReportes(actual);
      setReportes(actual);
      setOrigenDatos('error');
    }
  };

  const sincronizarConFirestore = async () => {
    try {
      await FirestoreService.migrarDatos({ obras, personal, reportes });
      setOrigenDatos('firestore');
      setMensajeSync('Migración a Firestore completada con éxito.');
      window.setTimeout(() => setMensajeSync(null), 4000);
    } catch (error) {
      console.error('Error al migrar datos a Firestore:', error);
      setOrigenDatos('error');
      setMensajeSync('No se pudo sincronizar con Firestore. Revisa la conexión.');
    }
  };

  if (cargandoInicial) {
    return <div style={{ padding: '3rem', textAlign: 'center' }}>Cargando datos…</div>;
  }

  const DashboardWrapper = () => {
    const navigate = useNavigate();
    const { logout, usuario } = useAuth();

    const alNavegarPestaña = (pestaña: string) => {
      if (pestaña === 'obras') return navigate('/obras');
      if (pestaña === 'reportes') return navigate('/reportes');
      if (pestaña === 'personal' || pestaña === 'empleados') return navigate('/empleados');
      return console.log('Navegar a pestaña', pestaña);
    };

    const cerrarSesion = () => {
      logout();
      navigate('/');
    };

    return (
      <div style={{ display: 'flex' }}>
        <SideBar />
        <div style={{ flex: 1 }}>
          <Dashboard
            obras={obras}
            personal={personal}
            reportes={reportes}
            alNavegarPestaña={alNavegarPestaña}
            logout={cerrarSesion}
            usuario={usuario}
            origenDatos={origenDatos}
            sincronizarDatos={sincronizarConFirestore}
            mensajeSync={mensajeSync}
          />
        </div>
      </div>
    );
  };

  const ObrasWrapper = () => {
    const { logout } = useAuth();
    const { id } = useParams();
    const cerrarSesion = () => {
      logout();
      window.location.href = '/';
    };

    return (
      <div style={{ display: 'flex' }}>
        <SideBar />
        <div style={{ flex: 1 }}>
          <ObrasYProyectos
            obras={obras}
            guardarObras={guardarObras}
            selectedId={id}
            crearObra={crearObra}
            actualizarObra={actualizarObra}
            eliminarObra={eliminarObra}
          />
        </div>
      </div>
    );
  };

  const ReportesWrapper = () => {
    const { logout } = useAuth();
    const cerrarSesion = () => {
      logout();
      window.location.href = '/';
    };

    return (
      <div style={{ display: 'flex' }}>
        <SideBar />
        <div style={{ flex: 1 }}>
          <Reportes
            obras={obras}
            reportes={reportes}
            guardarReportes={guardarReportes}
            crearReporte={crearReporte}
            actualizarReporte={actualizarReporte}
            eliminarReporte={eliminarReporte}
          />
        </div>
      </div>
    );
  };

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <DashboardWrapper />
            </ProtectedRoute>
          }
        />
        <Route
          path="/obras"
          element={
            <ProtectedRoute>
              <ObrasWrapper />
            </ProtectedRoute>
          }
        />
        <Route
          path="/obras/:id"
          element={
            <ProtectedRoute>
              <ObrasWrapper />
            </ProtectedRoute>
          }
        />
        <Route
          path="/empleados"
          element={
            <ProtectedRoute>
              <div style={{ display: 'flex' }}>
                <SideBar />
                <div style={{ flex: 1 }}>
                      <Empleados
                        obras={obras}
                        personal={personal}
                        guardarPersonal={guardarPersonal}
                        crearPersonal={crearPersonal}
                        actualizarPersonal={actualizarPersonal}
                        eliminarPersonal={eliminarPersonal}
                      />
                </div>
              </div>
            </ProtectedRoute>
          }
        />
        <Route
          path="/reportes"
          element={
            <ProtectedRoute>
              <ReportesWrapper />
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

const root = createRoot(document.getElementById('root') as HTMLElement);

root.render(
  <React.StrictMode>
    <AuthProvider>
      <App />
    </AuthProvider>
  </React.StrictMode>
);
