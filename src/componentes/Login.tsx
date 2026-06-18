import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import './login.css';

export default function Login() {
  const { login, errorLogin } = useAuth();
  const [correo, setCorreo] = useState('admin@admin.com');
  const [clave, setClave] = useState('123456');
  const [mostrarClave, setMostrarClave] = useState(false);
  const [errorLocal, setErrorLocal] = useState<string | null>(null);
  const navigate = useNavigate();

  const manejarEnvio = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorLocal('');
    
    const correoProcesado = correo.trim();
    if (!correoProcesado.includes('@') || !correoProcesado.includes('.')) {
      setErrorLocal('Por favor ingrese un formato de correo electrónico válido.');
      return;
    }
    if (clave.length < 4) {
      setErrorLocal('La contraseña debe contener al menos 4 caracteres.');
      return;
    }

    try {
      const exito = login(correoProcesado, clave);
      if (exito) {
        navigate('/dashboard');
      } else {
        setErrorLocal('Credenciales incorrectas. Verifique los datos de ingreso.');
      }
    } catch (err: unknown) {
      console.error('Error en proceso de login', err);
      setErrorLocal('Ocurrió un error al intentar iniciar sesión. Intente nuevamente.');
    }
  };

  return (
    <div id="pagina-login">
      <div className="hexacall-card">
        <div style={{display:'flex',flexDirection:'column',alignItems:'center',marginBottom:18}}>
          <div className="hexacall-logo">
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="2.5" 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              className="w-7 h-7 text-white"
            >
              <path d="M2 18a1 1 0 0 0 1 1h18a1 1 0 0 0 1-1v-4a1 1 0 0 0-1-1H3a1 1 0 0 0-1 1v4z" />
              <path d="M10 10V5a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v5" />
              <path d="M4 11V9a4 4 0 0 1 4-4h8a4 4 0 0 1 4 4v2" />
            </svg>
          </div>
          <h1 className="hexacall-title">HEXACALL</h1>
          <p className="hexacall-subtitle">Portal de Acceso Interno</p>
        </div>

        <form onSubmit={manejarEnvio} id="formulario-login">
          <div style={{marginBottom:12}}>
            <label className="field-label">Correo Electrónico</label>
            <div style={{position:'relative'}}>
              <div className="input-icon">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="16" height="16"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>
              </div>
              <input id="correo-login" type="email" required placeholder="admin@admin.com" value={correo} onChange={(e) => setCorreo(e.target.value)} className="hexacall-input" />
            </div>
          </div>

          <div style={{marginBottom:6}}>
            <label className="field-label">Contraseña</label>
            <div style={{position:'relative'}}>
              <div className="input-icon">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="16" height="16"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
              </div>
              <input id="clave-login" type={mostrarClave ? 'text' : 'password'} required placeholder="••••••••" value={clave} onChange={(e) => setClave(e.target.value)} className="hexacall-input" />
              <button type="button" onClick={() => setMostrarClave(!mostrarClave)} style={{position:'absolute',right:10,top:'50%',transform:'translateY(-50%)',background:'transparent',border:'none',cursor:'pointer'}}>
                {mostrarClave ? '🙈' : '👁️'}
              </button>
            </div>
          </div>

          {(errorLocal || errorLogin) && (
            <div id="error-login" style={{color:'#b91c1c',background:'#fff1f2',padding:10,borderRadius:10,border:'1px solid #fecaca',fontWeight:700,marginBottom:8}}>
              {errorLocal || errorLogin}
            </div>
          )}

          <button id="boton-instancia-login" type="submit" className="hexacall-btn">Iniciar Sesión</button>
        </form>

        <div className="hexacall-footer">
          Credenciales válidas de prueba:<br/>
          <div className="cred-badge">admin@admin.com</div> / 123456<br/>
          <div className="cred-badge" style={{marginTop:6}}>soporte@hexacall.cl</div> / 654321
        </div>
      </div>
    </div>
  );
}
