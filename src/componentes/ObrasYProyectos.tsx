import React, { useState } from 'react';
import { Obra, EstadoObra } from '../types';
import { formatearMoneda } from '../utils';
import './dashboard.css';
import './obras-proyectos.css';

type ObrasYProyectosProps = {
  obras: Obra[];
  guardarObras: (obras: Obra[]) => void;
};

export default function ObrasYProyectos({ obras, guardarObras }: ObrasYProyectosProps) {
  /**
   * Componente `Obras` — Gestión de obras y proyectos.
   * - Mantiene creación/edición/eliminación de obras
   * - Muestra estadísticas y listado filtrable en tiempo real
   * - Diseñado para ser claro y consistente con `Dashboard`/`Login`
   */
  
  const [obraEditando, setObraEditando] = useState<Obra | null>(null);
  const [formulario, setFormulario] = useState({ nombre: '', ubicacion: '', estado: 'en curso' as EstadoObra, presupuesto: '' });
  const [mensajeError, setMensajeError] = useState<string | null>(null);
  const [terminoBusqueda, setTerminoBusqueda] = useState('');

  const manejarEnvioObra = (e: React.FormEvent) => {
    e.preventDefault();
    setMensajeError(null);

    if (!formulario.nombre.trim()) return setMensajeError('El nombre de la obra es obligatorio.');
    if (!formulario.ubicacion.trim()) return setMensajeError('La ubicación de la obra es obligatoria.');

    const presupuesto = formulario.presupuesto ? parseFloat(formulario.presupuesto) : 0;
    if (presupuesto < 0) return setMensajeError('El presupuesto no puede ser negativo.');

    const obrasActualizadas = obraEditando
      ? obras.map(o => o.id === obraEditando.id ? { ...o, ...formulario, presupuesto } : o)
      : [...obras, { id: `obra-${Date.now()}`, ...formulario, presupuesto }];

    guardarObras(obrasActualizadas);

    setFormulario({ nombre: '', ubicacion: '', estado: 'en curso', presupuesto: '' });
    setMensajeError(null);
    // limpiamos estado de edición y formulario
    setObraEditando(null);
  };

  // limpia estado de edición
  const cerrarEdicion = () => setObraEditando(null);

  const manejarEliminar = (id: string) => {
    if (!confirm('¿Eliminar?')) return;
    const actualizado = obras.filter(o => o.id !== id);
    guardarObras(actualizado);
  };

  const manejarCambioEstado = (id: string, estado: EstadoObra) => {
    const actualizado = obras.map(o => o.id === id ? { ...o, estado } : o);
    guardarObras(actualizado);
  };

  const abrirEditar = (obra: Obra) => {
    setObraEditando(obra);
    setFormulario({ nombre: obra.nombre, ubicacion: obra.ubicacion || '', estado: obra.estado, presupuesto: obra.presupuesto?.toString() || '' });
    // foco no necesario en esta versión inline
  };

  const abrirCrear = () => {
    setObraEditando(null);
    setFormulario({ nombre: '', ubicacion: '', estado: 'en curso', presupuesto: '' });
    // foco no necesario en esta versión inline
  };

  const stats = [
    { label: 'Total', value: obras.length },
    { label: 'En Curso', value: obras.filter(o => o.estado === 'en curso').length, cls: 'stat-curso' },
    { label: 'Pausadas', value: obras.filter(o => o.estado === 'pausada').length, cls: 'stat-pausada' },
    { label: 'Finalizadas', value: obras.filter(o => o.estado === 'finalizada').length, cls: 'stat-finalizada' },
    { label: 'Presupuesto', value: formatearMoneda(obras.reduce((s, o) => s + (o.presupuesto || 0), 0)) },
  ];

  const obrasFiltradas = terminoBusqueda
    ? obras.filter(o => o.nombre.toLowerCase().includes(terminoBusqueda.toLowerCase()) || (o.ubicacion || '').toLowerCase().includes(terminoBusqueda.toLowerCase()))
    : obras;

  // teclado no requerido para formulario inline

  return (
    <main className="dashboard-page" aria-labelledby="obras-title">
      <header className="obras-header">
        <div>
          <h1 id="obras-title">Obras</h1>
          <p id="obras-summary">Control global de obras de desarrollo, estados y presupuestos.</p>
        </div>
      </header>

      <section className="obras-paneles">
        <div className="obras-creacion">
          <div className="obras-creacion-top">
            <h2>{obraEditando ? 'Editar obra' : 'Nuevo registro'}</h2>
          </div>

          <form onSubmit={manejarEnvioObra} className="obras-form">
            <label htmlFor="obra-nombre">Nombre</label>
            <input id="obra-nombre" value={formulario.nombre} onChange={e => setFormulario(prev => ({ ...prev, nombre: e.target.value }))} placeholder="Nombre de la obra" />

            <label htmlFor="obra-ubicacion">Ubicación</label>
            <input id="obra-ubicacion" value={formulario.ubicacion} onChange={e => setFormulario(prev => ({ ...prev, ubicacion: e.target.value }))} placeholder="Ciudad, barrio o dirección" />

            <label htmlFor="obra-estado">Estado</label>
            <select id="obra-estado" value={formulario.estado} onChange={e => setFormulario(prev => ({ ...prev, estado: e.target.value as EstadoObra }))}>
              <option value="en curso">En Curso</option>
              <option value="pausada">Pausada</option>
              <option value="finalizada">Finalizada</option>
            </select>

            <label htmlFor="obra-presupuesto">Presupuesto</label>
            <input id="obra-presupuesto" type="number" min="0" value={formulario.presupuesto} onChange={e => setFormulario(prev => ({ ...prev, presupuesto: e.target.value }))} placeholder="0" />

            {mensajeError && <div className="alert-box">{mensajeError}</div>}

            <div className="form-btns">
              <button type="submit" className="btn-crear" aria-label={obraEditando ? 'Actualizar obra' : 'Guardar obra'}>{obraEditando ? 'Guardar cambios' : 'Registrar obra'}</button>
              {obraEditando && <button type="button" className="btn-cancelar-edicion" onClick={() => { setObraEditando(null); setFormulario({ nombre: '', ubicacion: '', estado: 'en curso', presupuesto: '' }); }}>Cancelar edición</button>}
            </div>
          </form>
        </div>

        <div className="obras-listado">
          <div className="obras-listado-header">
            <div>
              <h2>Listado de Obras</h2>
              <span>{obras.length} {obras.length === 1 ? 'obra' : 'obras'}</span>
            </div>
            <div style={{ width: 320 }}>
              <input className="search-input" placeholder="Buscar obras por nombre o ubicación..." value={terminoBusqueda} onChange={e => setTerminoBusqueda(e.target.value)} aria-label="Buscar obras" />
            </div>
          </div>

          {obrasFiltradas.length === 0 ? (
            <p className="vacio">No se encontraron obras.</p>
          ) : (
            <div className="grid">
              {obrasFiltradas.map(o => (
                <article key={o.id} className="tarjeta" tabIndex={0} aria-labelledby={`obra-${o.id}-titulo`}>
                  <h3 id={`obra-${o.id}-titulo`}>{o.nombre}</h3>
                  <span className={`estado ${o.estado.replace(' ', '-')}`}>{o.estado}</span>
                  {o.ubicacion && <p className="ubicacion" title={o.ubicacion}>📍 {o.ubicacion}</p>}
                  {o.presupuesto && <p className="presupuesto">💰 {formatearMoneda(o.presupuesto)}</p>}
                  <div className="acciones">
                    <select value={o.estado} onChange={e => manejarCambioEstado(o.id, e.target.value as EstadoObra)} className="select" aria-label={`Cambiar estado de ${o.nombre}`}>
                      <option value="en curso">En Curso</option>
                      <option value="pausada">Pausada</option>
                      <option value="finalizada">Finalizada</option>
                    </select>
                    <button className="btn-edit" onClick={() => abrirEditar(o)} title="Editar obra" aria-label={`Editar obra ${o.nombre}`}>Editar</button>
                    <button className="btn-del" onClick={() => manejarEliminar(o.id)} title="Eliminar obra" aria-label={`Eliminar obra ${o.nombre}`}>Eliminar</button>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </section>
      
    </main>
  );
}
