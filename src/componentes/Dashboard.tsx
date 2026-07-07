import React from 'react';
import { DashboardProps } from '../types';
import { formatearMoneda } from '../utils';
import './dashboard.css';

/*
 * Componente Icon: Renderiza SVGs reutilizables con tamaño dinámico.*/
interface IconProps {
  children: React.ReactNode;
  width?: string;
}

const Icon = ({ children, width = '16' }: IconProps) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" width={width} height={width} aria-hidden>
    {children}
  </svg>
);



export default function Dashboard({ obras, personal, reportes, alNavegarPestaña, logout, usuario, origenDatos, sincronizarDatos, mensajeSync }: DashboardProps) {
  // Total de proyectos cargados (usado para porcentajes y tablas)
  const totalDeObras = obras.length;

  // Presupuesto total acumulado de todas las obras
  const presupuestoTotal = obras.reduce((sumaPresupuestos, obraItem) => sumaPresupuestos + (obraItem.presupuesto || 0), 0);

  // Últimos 3 reportes ordenados por fecha 
  const reportesRecientes = reportes.length
    ? [...reportes].sort((reporteA, reporteB) => new Date(reporteB.fecha).getTime() - new Date(reporteA.fecha).getTime()).slice(0, 3)
    : [];

  // Construye un resumen por estado con etiqueta, color y cantidad de obras
  const estadosReferencia = ['en curso', 'pausada', 'finalizada'];
  const coloresPorEstado = ['red', 'yellow', 'green'];
  const resumenEstados = estadosReferencia.map((estadoEtiqueta, indice) => {
    const colorAsignado = coloresPorEstado[indice];
    const cantidadPorEstado = obras.filter(obraItem => obraItem.estado === estadoEtiqueta).length;
    return { etiqueta: estadoEtiqueta, color: colorAsignado, cantidad: cantidadPorEstado };
  });

  // Configuración de las 4 tarjetas 

  const tarjetasInfo = [
    {
      id: 'obras',
      titulo: 'Obras Civiles',
      valor: totalDeObras,
      nota: 'Proyectos registrados',
      icono: <><rect x="2" y="10" width="20" height="12" rx="2" /><path d="m12 2 10 8H2Z" /></>
    },
    {
      id: 'personal',
      titulo: 'Personal',
      valor: personal.length,
      nota: 'Operarios activos',
      icono: <><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M22 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></>
    },
    {
      id: 'reportes',
      titulo: 'Bitácora Diario',
      valor: reportes.length,
      nota: 'Informes de avance',
      icono: <><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><path d="M14 2v6h6" /><path d="M16 13H8" /><path d="M16 17H8" /><path d="M10 9H8" /></>
    },
    {
      id: 'presupuesto',
      titulo: 'Presupuesto Ejecutado',
      valor: formatearMoneda(presupuestoTotal),
      nota: 'Inversión acumulada',
      icono: <><line x1="12" y1="1" x2="12" y2="23" /><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" /></>
    }
  ];

  const abrirFirestore = () => {
    window.open('https://console.firebase.google.com/', '_blank');
  };

  return (
    <div className="dashboard-page">
      {/* 1. CABECERA: Muestra información del usuario autenticado (desde AuthContext via props) */}
      <header className="dashboard-header">
        <div>
          <h1>Dashboard General</h1>
          <p className="dashboard-subtitle">Indicadores clave de rendimiento, estados de obras y reportes.</p>
        </div>
        <div className="dashboard-header-actions">
          <div className="dashboard-user-status">
            {usuario && (
              <>
                <span className="user-chip-name">{usuario.nombre}</span>
                <span className="user-chip-role">{usuario.rol}</span>
              </>
            )}
            <span className={`dashboard-status-pill dashboard-status-pill--${origenDatos}`}>{origenDatos === 'firestore' ? 'Firestore activo' : origenDatos === 'local' ? 'LocalStorage activo' : 'Sincronización fallida'}</span>
          </div>
          <button type="button" className="link-button" onClick={abrirFirestore}>Abrir Firebase</button>
          <button type="button" className="logout-button" onClick={logout}>Cerrar sesión</button>
        </div>
        {mensajeSync && <div className="dashboard-sync-message">{mensajeSync}</div>}
      </header>

      {/*TARJETAS*/}
      {/* Las tarjetas de obras, personal y reportes son navegables */}
      <section className="dashboard-cards">
        {tarjetasInfo.map(tarjetaInfo => (
          <article 
            key={tarjetaInfo.id} 
            className={`dashboard-card ${tarjetaInfo.id === 'obras' ? 'dashboard-card-primary' : ''}`}
            onClick={() => tarjetaInfo.id !== 'presupuesto' && alNavegarPestaña(tarjetaInfo.id)}
            role={tarjetaInfo.id !== 'presupuesto' ? "button" : undefined}
          >
            <div className="card-top-row">
              <h2 className="card-title">{tarjetaInfo.titulo}</h2>
              <span className="dashboard-card-icon"><Icon>{tarjetaInfo.icono}</Icon></span>
            </div>
            <div>
              <p className={`card-value ${tarjetaInfo.id === 'presupuesto' ? 'card-value-large' : ''}`}>{tarjetaInfo.valor}</p>
              <p className="card-note">{tarjetaInfo.nota}</p>
            </div>
          </article>
        ))}
      </section>

      {/*Gráfico de distribución de estados y lista de reportes recientes */}
      <section className="dashboard-panels">
        {/* Gráfico horizontal de estados con porcentajes */}
        <div className="panel">
          <div className="panel-header">
            <div><p className="panel-label">Distribución de Estados</p><h2>Clasificación operacional de obras</h2></div>
          </div>
          {totalDeObras > 0 ? (
            <>
              {/* Barra de distribución: cada segmento representa el porcentaje de obras por estado */}
              <div className="distribution-bar">
                {resumenEstados.map(estadoResumen => {
                  // Calcula porcentaje para la barra; si es 0 devuelve 5% para visibilidad mínima
                  const porcentaje = Math.round((estadoResumen.cantidad / totalDeObras) * 100) || 5;
                  return (
                    <div key={estadoResumen.color} className={`bar-segment bar-segment--${estadoResumen.color}`} style={{ width: `${porcentaje}%` }} title={`${estadoResumen.etiqueta}: ${estadoResumen.cantidad} (${porcentaje}%)`}>
                      {porcentaje > 15 && `${porcentaje}%`}
                    </div>
                  );
                })}
              </div>
              {/* Leyenda de conteos por estado */}
              <div className="distribution-legend">
                {resumenEstados.map(estadoResumen => (
                  <div key={estadoResumen.color} className={`legend-card legend-card--${estadoResumen.color}`}>
                    <div className="legend-value">{estadoResumen.cantidad}</div>
                    <div style={{ textTransform: 'capitalize' }}>{estadoResumen.etiqueta}</div>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <p className="dashboard-empty">No hay obras para graficar.</p>
          )}
        </div>

        {/* Últimos 3 reportes cargados */}
        <div className="panel">
          <div className="panel-header panel-header--compact">
            <div><p className="panel-label">Informes Recientes</p><h2>Últimos ingresos de terreno cargados</h2></div>
            <button type="button" className="link-button" onClick={() => alNavegarPestaña('reportes')}>Ver Todos</button>
          </div>
          {reportesRecientes.length ? (
            <div className="report-list">
              {reportesRecientes.map(reporte => (
                <div key={reporte.id} className="report-item" onClick={() => alNavegarPestaña('obras')}>
                  <div className="report-item-header">
                    <strong>{obras.find(obraItem => obraItem.id === reporte.obraId)?.nombre || 'Obra Desvinculada'}</strong>
                    <span className="report-date">
                      <Icon width="14">
                        <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                        <line x1="16" y1="2" x2="16" y2="6" />
                        <line x1="8" y1="2" x2="8" y2="6" />
                        <line x1="3" y1="10" x2="21" y2="10" />
                      </Icon>
                      {reporte.fecha}
                    </span>
                  </div>
                  <p>{reporte.descripcion}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="dashboard-empty">No hay reportes cargados recientemente.</p>
          )}
        </div>
      </section>

      {/*Listado de todas las obras para revisión rápida y acciones */}
      <section className="dashboard-table-section">
        <div className="section-header">
          <div><p className="panel-label">Obras y Proyectos Activos</p><h2>Bandeja general de revisión directa</h2></div>
          <button type="button" className="link-button" onClick={() => alNavegarPestaña('obras')}>Gestionar Proyectos</button>
        </div>
        <div className="table-card">
          {totalDeObras === 0 ? (
            <p className="dashboard-empty">No se encuentran obras ingresadas.</p>
          ) : (
            <table>
              <thead><tr><th>Proyecto</th><th>Estado</th><th>Ubicación</th><th>Presupuesto</th><th>Acciones</th></tr></thead>
              <tbody>
                {obras.map(obraItem => (
                  <tr key={obraItem.id}>
                    <td><strong>{obraItem.nombre}</strong></td>
                    {/* Estado se formatea removiendo espacios para generar clase CSS correcta (ej: "en curso" → "encurso") */}
                    <td><span className={`badge badge--${obraItem.estado.replace(/\s+/g, '')}`}>{obraItem.estado}</span></td>
                    <td>{obraItem.ubicacion || 'No informada'}</td>
                    <td>{obraItem.presupuesto ? formatearMoneda(obraItem.presupuesto) : 'S/P'}</td>
                    <td><button type="button" className="small-button" onClick={() => alNavegarPestaña('obras')}>Ver obra</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </section>
    </div>
  );
}