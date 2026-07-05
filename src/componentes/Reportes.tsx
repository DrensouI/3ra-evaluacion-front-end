import React, { useState, FormEvent } from 'react';
import { Obra, Reporte, ReportesProps } from '../types';
import { crearReporte, actualizarReporte, eliminarReporteById } from '../services/api';
import './reportes.css';

// Fecha actual en formato YYYY-MM-DD (usada para validación de fecha)
const fechaHoy = new Date().toISOString().slice(0, 10);

/* Persistencia: Los datos se guardan en MongoDB a través de los endpoints de la API */
export default function Reportes({ obras, reportes, guardarReportes, crearReporte: crearReporteCtx, actualizarReporte: actualizarReporteCtx, eliminarReporte: eliminarReporteCtx }: ReportesProps) {
  // id del reporte que se está editando (null => creando uno nuevo)
  const [reporteEditandoId, setReporteEditandoId] = useState<string | null>(null);

  // Formulario controlado: obra asociada, fecha y descripción
  const [formulario, setFormulario] = useState({ obraId: obras[0]?.id || '', fecha: fechaHoy, descripcion: '' });

  // Mensajes de UI para mostrar errores o notificaciones de éxito
  const [alerta, setAlerta] = useState<{ tipo: 'error' | 'success'; texto: string } | null>(null);

  // Estado de carga para las operaciones de API
  const [cargando, setCargando] = useState(false);

  // Variables derivadas para la UI
  const obrasDisponibles = obras.length > 0;
  const estaEnEdicion = Boolean(reporteEditandoId);

  // Ordena reportes por fecha descendente (más recientes primero)
  const ordenarPorFechaDescendente = (items: Reporte[]) => [...items].sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime());

  // Función auxiliar: limpia el formulario y el estado de edición
  const limpiarFormulario = () => {
    setFormulario({ obraId: obras[0]?.id || '', fecha: fechaHoy, descripcion: '' });  
    setReporteEditandoId(null);
    setAlerta(null);
  };

  // Maneja la sumisión del formulario: valida y guarda o actualiza el reporte
  const manejarEnvio = async (e: FormEvent) => {
    e.preventDefault();
    setAlerta(null);
    setCargando(true);

    if (!obrasDisponibles) return setAlerta({ tipo: 'error', texto: 'No hay obras disponibles para asociar el informe.' });

    if (!formulario.descripcion.trim()) return setAlerta({ tipo: 'error', texto: 'Descripción requerida para el informe.' });

    if (formulario.fecha > fechaHoy) return setAlerta({ tipo: 'error', texto: 'La fecha no puede ser mayor que la de hoy.' });

    const datosReporte: Reporte = {
      id: reporteEditandoId || `reporte-${Date.now()}`,
      obraId: formulario.obraId,
      fecha: formulario.fecha,
      descripcion: formulario.descripcion.trim(),
    };

    try {
      if (reporteEditandoId) {
        // Actualizar reporte existente
        await actualizarReporte(datosReporte.id, {
          obraId: datosReporte.obraId,
          fecha: datosReporte.fecha,
          descripcion: datosReporte.descripcion,
        });
        actualizarReporteCtx && await actualizarReporteCtx(datosReporte.id, datosReporte);
      } else {
        // Crear nuevo reporte
        await crearReporte(datosReporte);
        crearReporteCtx && await crearReporteCtx(datosReporte);
      }
      setAlerta({ tipo: 'success', texto: reporteEditandoId ? 'Informe actualizado correctamente.' : 'Informe creado correctamente.' });
      limpiarFormulario();
      window.setTimeout(() => setAlerta(null), 3000);
    } catch (err) {
      console.error(err);
      setAlerta({ tipo: 'error', texto: 'Ocurrió un error inesperado al guardar el informe.' });
    } finally {
      setCargando(false);
    }
  };

  // Elimina un reporte con confirmación del usuario
  const eliminarReporte = async (id: string) => {
    if (!confirm('¿Eliminar este informe?')) return;
    setCargando(true);
    try {
      await eliminarReporteById(id);
      eliminarReporteCtx && await eliminarReporteCtx(id);
      setAlerta({ tipo: 'success', texto: 'Informe eliminado correctamente.' });
      if (reporteEditandoId === id) limpiarFormulario();
      window.setTimeout(() => setAlerta(null), 2500);
    } catch (err) {
      console.error(err);
      setAlerta({ tipo: 'error', texto: 'Ocurrió un error inesperado al eliminar el informe.' });
    } finally {
      setCargando(false);
    }
  };

  // Inicia modo edición: carga el reporte en el formulario y scroll al top
  const iniciarEdicion = (reporte: Reporte) => {
    setReporteEditandoId(reporte.id);
    setFormulario({ obraId: reporte.obraId, fecha: reporte.fecha, descripcion: reporte.descripcion });
    setAlerta(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <main className="reportes-page" aria-labelledby="titulo-reportes">
      <header className="reportes-header">
        <div>
          <h1 id="titulo-reportes">Reportes de Obra</h1>
          <p>Registra avances diarios y consulta bitácoras asociadas a obras existentes.</p>
        </div>
      </header>

      <section className="reportes-paneles">
        {/*Formulario de creación/edición de reportes */}
        <div className="reportes-creacion">
          <div className="reportes-creacion-top">
            <h2>{estaEnEdicion ? 'Editar informe' : 'Nuevo informe'}</h2>
            {/* Alerta si no hay obras: el usuario debe crear obras primero */}
            {!obrasDisponibles && <div className="alert-box">No hay obras creadas. Crea una obra primero para generar un informe.</div>}
            {alerta && <div className={`alert-box ${alerta.tipo === 'success' ? 'alert-success' : ''}`}>{alerta.texto}</div>}
          </div>

          {/*Formulario controlado con useState: todos los campos actualizan el estado en tiempo real */}
          <form onSubmit={manejarEnvio} className="reportes-form">
            <label htmlFor="reporte-obra">Obra</label>
            <select id="reporte-obra" value={formulario.obraId} onChange={e => setFormulario(prev => ({ ...prev, obraId: e.target.value }))} disabled={!obrasDisponibles}>
              {obras.map(obra => (<option key={obra.id} value={obra.id}>{obra.nombre}</option>))}
            </select>

            <label htmlFor="reporte-fecha">Fecha</label>
            <input id="reporte-fecha" type="date" value={formulario.fecha} max={fechaHoy} onChange={e => setFormulario(prev => ({ ...prev, fecha: e.target.value }))} disabled={!obrasDisponibles} />

            <label htmlFor="reporte-descripcion">Descripción</label>
            <textarea id="reporte-descripcion" rows={5} placeholder="Describe los avances, hallazgos o novedades del día..." value={formulario.descripcion} onChange={e => setFormulario(prev => ({ ...prev, descripcion: e.target.value }))} disabled={!obrasDisponibles} />

            <div className="reportes-form-actions">
              <button type="submit" className="btn-crear-reporte" disabled={!obrasDisponibles || cargando}>{estaEnEdicion ? 'Guardar cambios' : 'Crear informe'}</button>
              {estaEnEdicion && <button type="button" className="btn-cancelar-edicion" onClick={limpiarFormulario} disabled={cargando}>Cancelar edición</button>}
            </div>
          </form>
        </div>

        {/* Listado de reportes con acciones CRUD */}
        <div className="reportes-listado">
          <div className="reportes-listado-header">
            <h2>Informes creados</h2>
            <span>{reportes.length} {reportes.length === 1 ? 'informe' : 'informes'}</span>
          </div>
          {ordenarPorFechaDescendente(reportes).length === 0 ? (
            <p className="reportes-vacio">No se han registrado informes aún.</p>
          ) : (
            <div className="reportes-bloques">
              {/* Mapea reportes ordenados por fecha (más recientes primero) */}
              {ordenarPorFechaDescendente(reportes).map(reporte => {
                // Busca la obra asociada al reporte (puede estar eliminada)
                const obra = obras.find(o => o.id === reporte.obraId);
                return (
                  <article key={reporte.id} className="reporte-card">
                    <div className="reporte-meta">
                      <strong>{obra?.nombre || 'Obra eliminada'}</strong>
                      <span>{reporte.fecha}</span>
                    </div>
                    <p>{reporte.descripcion}</p>
                    {/* Botones de CRUD: editar abre el formulario, eliminar pide confirmación */}
                    <div className="reporte-acciones">
                      <button type="button" className="btn-editar-reporte" onClick={() => iniciarEdicion(reporte)} disabled={cargando}>Editar</button>
                      <button type="button" className="btn-eliminar-reporte" onClick={() => eliminarReporte(reporte.id)} disabled={cargando}>Eliminar</button>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
