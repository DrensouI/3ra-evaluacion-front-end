import React, { useState, useEffect, FormEvent } from 'react';
import { ObrasYProyectosProps, EstadoObra, Obra } from '../types';
import { formatearMoneda } from '../utils';
import './obras-proyectos.css';

export default function ObrasYProyectos({ obras, guardarObras, selectedId, crearObra, actualizarObra, eliminarObra }: ObrasYProyectosProps) {
  const [obraEnEdicion, setObraEnEdicion] = useState<Obra | null>(null);
  const [formulario, setFormulario] = useState({ nombre: '', ubicacion: '', estado: 'en curso' as EstadoObra, presupuesto: '' });
  const [alertaError, setAlertaError] = useState<string | null>(null);
  const [terminoBusqueda, setTerminoBusqueda] = useState('');

  const estaEnEdicion = Boolean(obraEnEdicion);

  const limpiarFormulario = () => {
    setFormulario({ nombre: '', ubicacion: '', estado: 'en curso', presupuesto: '' });
    setObraEnEdicion(null);
    setAlertaError(null);
  };

  const manejarEnvioObra = async (e: FormEvent) => {
    e.preventDefault();
    setAlertaError(null);

    if (!formulario.nombre.trim()) return setAlertaError('El nombre de la obra es obligatorio.');
    if (!formulario.ubicacion.trim()) return setAlertaError('La ubicación es obligatoria.');

    const presupuestoNumerico = formulario.presupuesto ? parseFloat(formulario.presupuesto) : 0;
    if (presupuestoNumerico < 0) return setAlertaError('El presupuesto no puede ser negativo.');

    const datosObra: Obra = {
      id: obraEnEdicion ? obraEnEdicion.id : `obra-${Date.now()}`,
      ...formulario,
      presupuesto: presupuestoNumerico
    };

    const obrasActualizadas = obraEnEdicion
      ? obras.map(o => o.id === obraEnEdicion.id ? datosObra : o)
      : [datosObra, ...obras];

    if (obraEnEdicion && actualizarObra) {
      await actualizarObra(obraEnEdicion.id, datosObra);
    } else if (!obraEnEdicion && crearObra) {
      await crearObra(datosObra);
    } else {
      guardarObras(obrasActualizadas);
    }
    limpiarFormulario();
  };

  const handleEliminarObra = (id: string) => {
    if (!window.confirm('¿Estás seguro de eliminar esta obra?')) return;
    if (eliminarObra) {
      eliminarObra(id);
    } else {
      guardarObras(obras.filter(o => o.id !== id));
    }
    if (obraEnEdicion?.id === id) limpiarFormulario();
  };

  const actualizarEstado = (id: string, nuevoEstado: EstadoObra) => {
    const actualizado = obras.map(o => o.id === id ? { ...o, estado: nuevoEstado } : o);
    if (actualizarObra) {
      actualizarObra(id, { estado: nuevoEstado });
    } else {
      guardarObras(actualizado);
    }
  };

  const iniciarEdicion = (obra: Obra) => {
    setObraEnEdicion(obra);
    setFormulario({ nombre: obra.nombre, ubicacion: obra.ubicacion || '', estado: obra.estado, presupuesto: obra.presupuesto?.toString() || '' });
    setAlertaError(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  useEffect(() => {
    if (!selectedId) return;
    const encontrada = obras.find(o => o.id === selectedId);
    if (encontrada) iniciarEdicion(encontrada);
  }, [selectedId, obras]);

  const obrasFiltradas = terminoBusqueda
    ? obras.filter(o => o.nombre.toLowerCase().includes(terminoBusqueda.toLowerCase()) || (o.ubicacion || '').toLowerCase().includes(terminoBusqueda.toLowerCase()))
    : obras;

  return (
    <main className="op-contenedor-principal" aria-labelledby="op-titulo">
      <header className="op-header">
        <div>
          <h1 id="op-titulo">Obras</h1>
          <p>Control global de obras de desarrollo, estados y presupuestos.</p>
        </div>
      </header>

      <section className="op-paneles">
        {/* PANEL IZQUIERDO: Formulario de creación/edición */}
        <div className="op-creacion">
          <div className="op-creacion-top">
            <h2>{estaEnEdicion ? 'Editar obra' : 'Nuevo registro'}</h2>
            {alertaError && <div className="op-alerta">{alertaError}</div>}
          </div>

          <form onSubmit={manejarEnvioObra} className="op-form">
            <label htmlFor="op-obra-nombre">Nombre</label>
            <input id="op-obra-nombre" className="op-input" value={formulario.nombre} onChange={e => setFormulario(prev => ({ ...prev, nombre: e.target.value }))} placeholder="Ej: Edificio Central" />

            <label htmlFor="op-obra-ubicacion">Ubicación</label>
            <input id="op-obra-ubicacion" className="op-input" value={formulario.ubicacion} onChange={e => setFormulario(prev => ({ ...prev, ubicacion: e.target.value }))} placeholder="Ciudad o dirección" />

            <label htmlFor="op-obra-estado">Estado</label>
            <select id="op-obra-estado" className="op-select" value={formulario.estado} onChange={e => setFormulario(prev => ({ ...prev, estado: e.target.value as EstadoObra }))}>
              <option value="en curso">En Curso</option>
              <option value="pausada">Pausada</option>
              <option value="finalizada">Finalizada</option>
            </select>

            <label htmlFor="op-obra-presupuesto">Presupuesto</label>
            <input id="op-obra-presupuesto" className="op-input" type="number" min="0" value={formulario.presupuesto} onChange={e => setFormulario(prev => ({ ...prev, presupuesto: e.target.value }))} placeholder="0" />

            <div className="op-form-acciones">
              <button type="submit" className="op-btn-primario">{estaEnEdicion ? 'Guardar cambios' : 'Registrar obra'}</button>
              {estaEnEdicion && <button type="button" className="op-btn-secundario" onClick={limpiarFormulario}>Cancelar</button>}
            </div>
          </form>
        </div>

        {/* PANEL DERECHO: Buscador y Listado */}
        <div className="op-listado">
          <div className="op-listado-header">
            <h2>Listado de Obras</h2>
            <div className="op-buscador-contenedor">
              <input className="op-buscador" placeholder="Buscar por nombre o ubicación..." value={terminoBusqueda} onChange={e => setTerminoBusqueda(e.target.value)} />
              <span className="op-contador">{obrasFiltradas.length} {obrasFiltradas.length === 1 ? 'obra' : 'obras'}</span>
            </div>
          </div>

          {obrasFiltradas.length === 0 ? (
            <p className="op-mensaje-vacio">No se encontraron obras coincidentes.</p>
          ) : (
            <div className="op-grilla">
              {obrasFiltradas.map(obra => (
                <article key={obra.id} className="op-tarjeta">
                  <div className="op-tarjeta-header">
                    <h3 className="op-tarjeta-titulo">{obra.nombre}</h3>
                    <span className={`op-badge op-badge-${obra.estado.replace(' ', '')}`}>{obra.estado}</span>
                  </div>
                  
                  <div className="op-tarjeta-detalles">
                    {obra.ubicacion && <p>📍 {obra.ubicacion}</p>}
                    {obra.presupuesto && <p>💰 {formatearMoneda(obra.presupuesto)}</p>}
                  </div>

                  <div className="op-tarjeta-acciones">
                    <select value={obra.estado} onChange={e => actualizarEstado(obra.id, e.target.value as EstadoObra)} className="op-select-estado" aria-label="Actualizar estado">
                      <option value="en curso">En Curso</option>
                      <option value="pausada">Pausada</option>
                      <option value="finalizada">Finalizada</option>
                    </select>
                    <button type="button" className="op-btn-accion op-btn-editar" onClick={() => iniciarEdicion(obra)}>Editar</button>
                    <button type="button" className="op-btn-accion op-btn-eliminar" onClick={() => handleEliminarObra(obra.id)}>Eliminar</button>
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