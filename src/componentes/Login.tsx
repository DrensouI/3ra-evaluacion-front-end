import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import iconoEmpresa from '../assets/icono-empresa.png';
import './login.css';

// Componente reutilizable para dibujar los íconos sin repetir código SVG
const Icon = ({ children }: { children: React.ReactNode }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="16" height="16">
    {children}
  </svg>
);

export default function Login() {
  // --- ESTADOS DEL COMPONENTE ---
  // Guarda lo que el usuario escribe en los inputs
  const [credenciales, setCredenciales] = useState({ correo: 'admin@admin.com', clave: '123456' });
  const [mostrarContrasena, setMostrarContrasena] = useState(false);
  const [mensajeError, setMensajeError] = useState<string | null>(null);
  const { login, errorLogin, estaAutenticado } = useAuth();
  const navigate = useNavigate();
  const errorTexto = mensajeError || errorLogin;

  // Efecto: Si el sistema detecta que el usuario ya está logueado, lo patea directo al dashboard
  useEffect(() => { 
    if (estaAutenticado) navigate('/dashboard'); 
  }, [estaAutenticado, navigate]);

  // Función: Actualiza el estado 'credenciales' en tiempo real mientras el usuario escribe
  const manejarCambioInput = ({ target: { name, value } }: React.ChangeEvent<HTMLInputElement>) =>
    setCredenciales(prev => ({ ...prev, [name]: value }));

  const manejarEnvio = (e: React.FormEvent) => {
    e.preventDefault();
    const correoLimpio = credenciales.correo.trim();

    if (!correoLimpio.includes('@') || !correoLimpio.includes('.'))
      return setMensajeError('Formato de correo electrónico inválido.');

    if (credenciales.clave.length < 4)
      return setMensajeError('La contraseña debe contener al menos 4 caracteres.');

    if (login(correoLimpio, credenciales.clave)) {
      navigate('/dashboard');
    } else {
      setMensajeError('Credenciales incorrectas. Verifique los datos.');
    }
  };

  return (
    <div id="pagina-login">
      <div className="hexacall-card">
        
        {/* ENCABEZADO LOGO */}
        <div className="auth-brand">
          <div className="hexacall-logo">
            <img src={iconoEmpresa} alt="Hexacall Logo" />
          </div>
          <h1 className="hexacall-title">HEXACALL</h1>
          <p className="hexacall-subtitle">Portal de Acceso Interno</p>
        </div>

        {/* FORMULARIO */}
        <form onSubmit={manejarEnvio}>
          
          <div className="form-group">
            <label className="field-label">Correo Electrónico</label>
            <div className="input-wrapper">
              <span className="input-icon">
                <Icon><rect x="2" y="4" width="20" height="16" rx="2" /><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" /></Icon>
              </span>
              <input name="correo" type="email" required placeholder="admin@admin.com" value={credenciales.correo} onChange={manejarCambioInput} className="hexacall-input" />
            </div>
          </div>

          <div className="form-group">
            <label className="field-label">Contraseña</label>
            <div className="input-wrapper">
              <span className="input-icon">
                <Icon><rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></Icon>
              </span>
              <input
                name="clave"
                type={mostrarContrasena ? 'text' : 'password'}
                required
                placeholder="••••••••"
                value={credenciales.clave}
                onChange={manejarCambioInput}
                className="hexacall-input"
              />
              <button type="button" className="toggle-password" onClick={() => setMostrarContrasena(prev => !prev)} title="Mostrar/ocultar contraseña">
                {mostrarContrasena ? (
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                    <circle cx="12" cy="12" r="3" />
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                  </svg>
                )}
              </button>
            </div>
          </div>

          {/* CAJA DE ERROR: Solo aparece si hay un error guardado en el estado */}
          {errorTexto && <div className="alert-box">{errorTexto}</div>}

          <button type="submit" className="hexacall-btn">Iniciar Sesión</button>
        </form>

      </div>
    </div>
  );
}