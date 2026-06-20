import React, { useMemo, useState, FormEvent } from 'react';
import { Almacenamiento } from '../utils';
import { Obra, Reporte } from '../types';
import './reportes.css';

const hoy = new Date().toISOString().slice(0, 10);

export default function Reportes() {
  const obras = useMemo(() => Almacenamiento.obtenerObras(), []);
  const [reportes, setReportes] = useState<Reporte[]>(Almacenamiento.obtenerReportes());
  const [editandoId, setEditandoId] = useState<string | null>(null);
  const [form, setForm] = useState({ obraId: obras[0]?.id || '', fecha: hoy, descripcion: '' });
  const [mensaje, setMensaje] = useState<{ tipo: 'error' | 'success'; texto: string } | null>(null);
  const obrasDisponibles = obras.length > 0;
  const esEdicion = Boolean(editandoId);

  const ordenar = (items: Reporte[]) => [...items].sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime());
  const guardar = (items: Reporte[]) => {
    Almacenamiento.guardarReportes(items);
    setReportes(items);
  };

  const limpiar = () => {
    setForm({ obraId: obras[0]?.id || '', fecha: hoy, descripcion: '' });
    setEditandoId(null);
    setMensaje(null);
  };

  const manejarEnvio = (e: FormEvent) => {
    e.preventDefault();
    setMensaje(null);

    if (!obrasDisponibles) return setMensaje({ tipo: 'error', texto: 'No hay obras disponibles para asociar el informe.' });
    if (!form.descripcion.trim()) return setMensaje({ tipo: 'error', texto: 'Descripción requerida para el informe.' });
    if (form.fecha > hoy) return setMensaje({ tipo: 'error', texto: 'La fecha no puede ser mayor que la de hoy.' });

    const datos: Reporte = { id: editandoId || `reporte-${Date.now()}`, obraId: form.obraId, fecha: form.fecha, descripcion: form.descripcion.trim() };
    const actualizados = editandoId ? reportes.map(r => (r.id === editandoId ? datos : r)) : [datos, ...reportes];

    try {
      guardar(actualizados);
      setMensaje({ tipo: 'success', texto: esEdicion ? 'Informe actualizado correctamente.' : 'Informe creado correctamente.' });
      limpiar();
      window.setTimeout(() => setMensaje(null), 3000);
    } catch (err) {
      console.error(err);
      setMensaje({ tipo: 'error', texto: 'Ocurrió un error inesperado al guardar el informe.' });
    }
  };

  const eliminarReporte = (id: string) => {
    if (!confirm('¿Eliminar este informe?')) return;
    try {
      guardar(reportes.filter(reporte => reporte.id !== id));
      setMensaje({ tipo: 'success', texto: 'Informe eliminado correctamente.' });
      if (editandoId === id) limpiar();
      window.setTimeout(() => setMensaje(null), 2500);
    } catch (err) {
      console.error(err);
      setMensaje({ tipo: 'error', texto: 'Ocurrió un error inesperado al eliminar el informe.' });
    }
  };

  const iniciarEdicion = (reporte: Reporte) => {
    setEditandoId(reporte.id);
    setForm({ obraId: reporte.obraId, fecha: reporte.fecha, descripcion: reporte.descripcion });
    setMensaje(null);
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
        <div className="reportes-creacion">
          <div className="reportes-creacion-top">
            <h2>{esEdicion ? 'Editar informe' : 'Nuevo informe'}</h2>
            {!obrasDisponibles && <div className="alert-box">No hay obras creadas. Crea una obra primero para generar un informe.</div>}
            {mensaje && (
              <div className="alert-box" style={mensaje.tipo === 'success' ? { background: '#ecfdf5', color: '#065f46', border: '1px solid #bbf7d0' } : undefined}>
                {mensaje.texto}
              </div>
            )}
          </div>

          <form onSubmit={manejarEnvio} className="reportes-form">
            <label htmlFor="reporte-obra">Obra</label>
            <select id="reporte-obra" value={form.obraId} onChange={e => setForm(prev => ({ ...prev, obraId: e.target.value }))} disabled={!obrasDisponibles}>
              {obras.map(obra => (
                <option key={obra.id} value={obra.id}>{obra.nombre}</option>
              ))}
            </select>

            <label htmlFor="reporte-fecha">Fecha</label>
            <input id="reporte-fecha" type="date" value={form.fecha} max={hoy} onChange={e => setForm(prev => ({ ...prev, fecha: e.target.value }))} disabled={!obrasDisponibles} />

            <label htmlFor="reporte-descripcion">Descripción</label>
            <textarea id="reporte-descripcion" rows={5} placeholder="Describe los avances, hallazgos o novedades del día..." value={form.descripcion} onChange={e => setForm(prev => ({ ...prev, descripcion: e.target.value }))} disabled={!obrasDisponibles} />

            <div className="reportes-form-actions">
              <button type="submit" className="btn-crear-reporte" disabled={!obrasDisponibles}>{esEdicion ? 'Guardar cambios' : 'Crear informe'}</button>
              {esEdicion && <button type="button" className="btn-cancelar-edicion" onClick={limpiar}>Cancelar edición</button>}
            </div>
          </form>
        </div>

        <div className="reportes-listado">
          <div className="reportes-listado-header">
            <h2>Informes creados</h2>
            <span>{reportes.length} {reportes.length === 1 ? 'informe' : 'informes'}</span>
          </div>
          {ordenar(reportes).length === 0 ? (
            <p className="reportes-vacio">No se han registrado informes aún.</p>
          ) : (
            <div className="reportes-bloques">
              {ordenar(reportes).map(reporte => {
                const obra = obras.find(o => o.id === reporte.obraId);
                return (
                  <article key={reporte.id} className="reporte-card">
                    <div className="reporte-meta">
                      <strong>{obra?.nombre || 'Obra eliminada'}</strong>
                      <span>{reporte.fecha}</span>
                    </div>
                    <p>{reporte.descripcion}</p>
                    <div className="reporte-acciones">
                      <button type="button" className="btn-editar-reporte" onClick={() => iniciarEdicion(reporte)}>Editar</button>
                      <button type="button" className="btn-eliminar-reporte" onClick={() => eliminarReporte(reporte.id)}>Eliminar</button>
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
