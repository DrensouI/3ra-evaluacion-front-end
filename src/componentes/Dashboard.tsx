import React from 'react';
import { DashboardProps } from '../types';
import { formatearMoneda } from '../utils';
import './dashboard.css';

// Componente genérico para íconos
const Icon = ({ children, w = "16" }: { children: React.ReactNode; w?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" width={w} height={w} aria-hidden>
    {children}
  </svg>
);

export default function Dashboard({ obras, personal, reportes, alNavegarPestaña, logout, usuario }: DashboardProps) {
  
  // --- CÁLCULOS PRINCIPALES DEL DASHBOARD ---
  
  const totalDeObras = obras.length;
  const tieneObras = totalDeObras > 0;
  const presupuestoTotal = obras.reduce((acumulador, obraActual) => acumulador + (obraActual.presupuesto || 0), 0);
  const reportesRecientes = reportes.length
    ? [...reportes].sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime()).slice(0, 3)
    : [];

  const resumenEstados = [
    { etiqueta: 'en curso', color: 'red' },
    { etiqueta: 'pausada', color: 'yellow' },
    { etiqueta: 'finalizada', color: 'green' }
  ].map(estado => ({
    ...estado,
    cantidad: obras.filter(o => o.estado === estado.etiqueta).length
  }));

  // Configuración de las 4 tarjetas principales superiores
  const tarjetasInfo = [
    { id: 'obras', titulo: 'Obras Civiles', valor: totalDeObras, nota: 'Proyectos registrados', icono: <><rect x="2" y="10" width="20" height="12" rx="2" /><path d="m12 2 10 8H2Z" /></> },
    { id: 'personal', titulo: 'Personal', valor: personal.length, nota: 'Operarios activos', icono: <><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M22 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></> },
    { id: 'reportes', titulo: 'Bitácora Diario', valor: reportes.length, nota: 'Informes de avance', icono: <><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><path d="M14 2v6h6" /><path d="M16 13H8" /><path d="M16 17H8" /><path d="M10 9H8" /></> },
    { id: 'presupuesto', titulo: 'Presupuesto Ejecutado', valor: formatearMoneda(presupuestoTotal), nota: 'Inversión acumulada', icono: <><line x1="12" y1="1" x2="12" y2="23" /><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" /></> }
  ];

  return (
    <div className="dashboard-page">
      
      {/* 1. CABECERA (HEADER) */}
      <header className="dashboard-header">
        <div>
          <h1>Dashboard General</h1>
          <p className="dashboard-subtitle">Indicadores clave de rendimiento, estados de obras y reportes.</p>
        </div>
        <div className="dashboard-header-actions">
          {usuario ? (
            <div>
              <span className="user-chip-name">{usuario.nombre}</span>
              <span className="user-chip-role">{usuario.rol}</span>
            </div>
          ) : null}
          <span className="dashboard-status-pill">Terminal Activa</span>
          <button type="button" className="logout-button" onClick={logout}>Cerrar sesión</button>
        </div>
      </header>

      {/* 2. FILA DE TARJETAS SUPERIORES */}
      <section className="dashboard-cards">
        {/* Mapea el arreglo tarjetasInfo y dibuja un <article> por cada una */}
        {tarjetasInfo.map(tarjeta => (
          <article 
            key={tarjeta.id} 
            className={`dashboard-card ${tarjeta.id === 'obras' ? 'dashboard-card-primary' : ''}`}
            onClick={() => tarjeta.id !== 'presupuesto' && alNavegarPestaña(tarjeta.id)}
            role={tarjeta.id !== 'presupuesto' ? "button" : undefined}
          >
            <div className="card-top-row">
              <h2 className="card-title">{tarjeta.titulo}</h2>
              <span className="dashboard-card-icon"><Icon>{tarjeta.icono}</Icon></span>
            </div>
            <div>
              <p className="card-value" style={tarjeta.id === 'presupuesto' ? { fontSize: '1.75rem' } : {}}>{tarjeta.valor}</p>
              <p className="card-note">{tarjeta.nota}</p>
            </div>
          </article>
        ))}
      </section>

      {/* 3. PANELES CENTRALES (Gráfico de Estados y Reportes) */}
      <section className="dashboard-panels">
        
        {/* PANEL A: Gráfico de barra horizontal */}
        <div className="panel">
          <div className="panel-header">
            <div><p className="panel-label">Distribución de Estados</p><h2>Clasificación operacional de obras</h2></div>
          </div>
          
          {tieneObras ? (
            <>
              <div className="distribution-bar">
                {resumenEstados.map(estado => {
                  const porcentaje = Math.round((estado.cantidad / totalDeObras) * 100) || 5;
                  return (
                    <div
                      key={estado.color}
                      className={`bar-segment bar-segment--${estado.color}`}
                      style={{ width: `${porcentaje}%` }}
                      title={`${estado.etiqueta}: ${estado.cantidad} (${porcentaje}%)`}
                    >
                      {porcentaje > 15 ? `${porcentaje}%` : ''}
                    </div>
                  );
                })}
              </div>
              <div className="distribution-legend">
                {resumenEstados.map(estado => (
                  <div key={estado.color} className={`legend-card legend-card--${estado.color}`}>
                    <div className="legend-value">{estado.cantidad}</div>
                    <div style={{ textTransform: 'capitalize' }}>{estado.etiqueta}</div>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <p style={{ color: '#94a3b8', textAlign: 'center', padding: '32px 0' }}>No hay obras para graficar.</p>
          )}
        </div>

        {/* PANEL B: Lista de Reportes Recientes */}
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
                    <strong>{obras.find(obra => obra.id === reporte.obraId)?.nombre || 'Obra Desvinculada'}</strong>
                    <span className="report-date">
                      <Icon w="14">
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
            <p style={{ color: '#94a3b8', textAlign: 'center', padding: '24px 0' }}>No hay reportes cargados recientemente.</p>
          )}
        </div>
      </section>

      {/* 4. SECCIÓN INFERIOR: TABLA GENERAL */}
      <section className="dashboard-table-section">
        <div className="section-header">
          <div><p className="panel-label">Obras y Proyectos Activos</p><h2 style={{ fontSize: '1.05rem', margin: 0 }}>Bandeja general de revisión directa</h2></div>
          <button type="button" className="link-button" onClick={() => alNavegarPestaña('obras')}>Gestionar Proyectos</button>
        </div>
        <div className="table-card">
          {!totalDeObras ? <p style={{ color: '#94a3b8', textAlign: 'center', padding: '24px 0' }}>No se encuentran obras ingresadas.</p> : (
            <table>
              <thead><tr><th>Proyecto</th><th>Estado</th><th>Ubicación</th><th>Presupuesto</th><th>Acciones</th></tr></thead>
              <tbody>
                {obras.map(obra => (
                  <tr key={obra.id}>
                    <td><strong>{obra.nombre}</strong></td>
                    {/* Quita los espacios del string de estado para generar la clase CSS correcta. Ej: "en curso" se vuelve "badge--encurso" */}
                    <td><span className={`badge badge--${obra.estado.replace(' ', '')}`}>{obra.estado}</span></td>
                    <td>{obra.ubicacion || 'No informada'}</td>
                    <td>{obra.presupuesto ? formatearMoneda(obra.presupuesto) : 'S/P'}</td>
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