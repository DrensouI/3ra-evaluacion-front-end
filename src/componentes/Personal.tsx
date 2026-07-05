import React, { useState, FormEvent } from 'react';
import { EmpleadosProps, Personal } from '../types';
import './personal.css';

import { sanitizarTexto } from '../utils';

export default function Empleados({ obras, personal, guardarPersonal }: EmpleadosProps) {
  /*Si el ID de un operador se esta editando, se remplaza solamente los datos viejos manteniendo el ID
  y asi evitar que se duplique (En el caso que sea un nuevo operador se crea uno nuevo)
  */
  const [personalEditandoId, setPersonalEditandoId] = useState<string | null>(null);

  const [formulario, setFormulario] = useState({
    nombre: '',
    cargo: 'Supervisor de Obra',
    obraId: obras[0]?.id || ''
  });



  // Procede a limpiar el formulario en cuanto ya se registro con exito el operador
  const limpiarFormulario = () => {
    setFormulario({ nombre: '', cargo: 'Supervisor de Obra', obraId: obras[0]?.id || '' });  
    setPersonalEditandoId(null);
  };

  // Valida y Guarda o lo actualiza en el LocalStorage
  const manejarEnvio = (e: FormEvent) => {
    e.preventDefault();

    if (!formulario.nombre.trim()) {
      alert('El nombre completo es requerido.');
      return;
    }
      

  const datosTrabajador: Personal = {
      id: personalEditandoId || `personal-${Date.now()}`,
      /* Cualquier intento de inyeccion que intente hacer el usuario, el sistema lo 'neutraliza' al revisarlo
      si hay algún tipo de caracter peligroso que pueda llegar a ser afectado*/
      nombre: sanitizarTexto(formulario.nombre.trim()), 
      cargo: formulario.cargo,
      obraId: formulario.obraId,
    };

    const actualizados = personalEditandoId
      ? personal.map(p => p.id === personalEditandoId ? datosTrabajador : p)
      : [datosTrabajador, ...personal];

    try {
      guardarPersonal(actualizados);
      limpiarFormulario();
    } catch (err) {
      console.error(err);
      alert('Ocurrió un error inesperado al guardar los datos.' );
    }
  };

  // Eliminar un Operador
  const eliminarTrabajador = (id: string) => {
    if (!confirm('¿Está seguro de eliminar a este trabajador de los registros de Hexacall?')) 
      return;
    try {
      guardarPersonal(personal.filter(p => p.id !== id));
      if (personalEditandoId === id) limpiarFormulario();
    } catch (err) {
      console.error(err);
      alert('Ocurrió un error inesperado al eliminar el registro.');
    }
  };

  // Simplemente un modo edición de los Operadores
  const iniciarEdicion = (trabajador: Personal) => {
    setPersonalEditandoId(trabajador.id);
    setFormulario({ nombre: trabajador.nombre, cargo: trabajador.cargo, obraId: trabajador.obraId });
  };

  return (
    <main className="empleados-page" aria-labelledby="titulo-empleados">
      <header className="empleados-header">
        <div>
          <h1 id="titulo-empleados">Control de Personal</h1>
          <p>Gestiona la nómina interna, asignación de cargos operativos y proyectos de Hexacall.</p>
        </div>
      </header>

      <section className="empleados-paneles">
{/*--------------------------------------------- 
  PANEL IZQUIERDO
  -----------------------------------------------*/}
        <div className="empleados-creacion">
          <div className="empleados-creacion-top">
            <h2>{personalEditandoId ? 'Editar personal' : 'Nuevo registro'}</h2>
            {!obras.length && <div className="caja-alerta">No hay obras creadas. Crea una obra primero para asignar personal.</div>}
          </div>

          <form onSubmit={manejarEnvio} className="empleados-form">
            <label htmlFor="personal-nombre">Nombre Completo</label>
          <input 
            id="personal-nombre" 
            type="text" 
            placeholder="Ej: Carlos Mendoza Silva" 
            value={formulario.nombre} 
            onChange={e => {
              /* Si el usuario quiere ìntentar ingresar caracteres peligrosos (numeros o simbolos) se borra instantaneamente.
              Lo unico permitido es letras, espacios y acentos. */
              const valorLimpio = e.target.value.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑüÜ ]/g, '');
              
              setFormulario(prev => ({ ...prev, nombre: valorLimpio }));
            }}
            disabled={obras.length === 0}
          />

            <label htmlFor="personal-cargo">Cargo Operacional</label>
          <select 
            id="personal-cargo" 
            value={formulario.cargo} 
            onChange={e => setFormulario(prev => ({ ...prev, cargo: e.target.value }))}
            disabled={obras.length === 0}
          >
            <option value="Supervisor de Obra">Supervisor de Obra</option>
            <option value="Ingeniero Calculista">Ingeniero Calculista</option>
            <option value="Prevencionista de Riesgos">Prevencionista de Riesgos</option>
            <option value="Maestro Albañil">Maestro Albañil</option>
            <option value="Electricista Autorizado">Electricista Autorizado</option>
          </select>

            <label htmlFor="personal-obra">Obra / Proyecto Asignado</label>
            <select 
              id="personal-obra" 
              value={formulario.obraId} 
              onChange={e => setFormulario(prev => ({ ...prev, obraId: e.target.value }))} 
              disabled={obras.length === 0}
            >
              {obras.map(obra => (<option key={obra.id} value={obra.id}>{obra.nombre}</option>))}
            </select>

            <div className="empleados-formulario-acciones">
              <button type="submit" className="btn-crear-empleado" disabled={obras.length === 0}>
                {personalEditandoId ? 'Guardar cambios' : 'Registrar personal'}
              </button>
              {personalEditandoId && (
                <button type="button" className="btn-cancelar-edicion" onClick={limpiarFormulario}>
                  Cancelar edición
                </button>
              )}
            </div>
          </form>
        </div>

{/*--------------------------------------------- 
  PANEL DERECHO
  -----------------------------------------------*/}
        <div className="empleados-listado">
          <div className="empleados-listado-header">
            <h2>Nómina de Operarios</h2>
            <span>{personal.length} {personal.length === 1 ? 'operario' : 'operarios'}</span>
          </div>
          
          {personal.length === 0 ? (
            <p className="empleados-vacio">No se han registrado trabajadores en el sistema aún.</p>
            ) : (
              <div className="empleados-bloques">
                {personal.map(trabajador => {
                // Busca el nombre de la obra asociada al operador para mostrarlo en la tarjeta
                const obraAsociada = obras.find(o => o.id === trabajador.obraId);
                return (
                  <article key={trabajador.id} className="empleado-card">
                    <div className="empleado-info">
                      <strong>{trabajador.nombre}</strong>
                      <span>📍 {obraAsociada?.nombre || 'Sin obra / Eliminada'}</span>
                    </div>
                    <p className="empleado-cargo-tag">💼 {trabajador.cargo}</p>
                    
                    <div className="empleado-acciones">
                      <button type="button" className="btn-editar-empleado" onClick={() => iniciarEdicion(trabajador)}>
                        Editar
                      </button>
                      <button type="button" className="btn-eliminar-empleado" onClick={() => eliminarTrabajador(trabajador.id)}>
                        Eliminar
                      </button>
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