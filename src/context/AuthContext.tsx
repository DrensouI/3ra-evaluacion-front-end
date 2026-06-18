import React, { createContext, useContext, useState, useEffect } from 'react';
import { SesionUsuario } from '../types';

interface AuthContextType {
  usuario: SesionUsuario | null;
  estaAutenticado: boolean;
  login: (correo: string, clave: string) => boolean;
  logout: () => void;
  errorLogin: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Credenciales registradas por defecto en el sistema
const USUARIOS_PREDEFINIDOS = [
  { correo: 'admin@admin.com', clave: '123456', nombre: 'Luis Alberto Rojas', rol: 'administrador' },
  { correo: 'soporte@obraspro.cl', clave: '654321', nombre: 'Alonso Ignacio Rojas', rol: 'soporte' }
];

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [usuario, setUsuario] = useState<SesionUsuario | null>(null);
  const [errorLogin, setErrorLogin] = useState<string | null>(null);

  // Carga inicial del estado desde localStorage
  useEffect(() => {
    try {
      const sesionGuardada = localStorage.getItem('obraspro_sesion');
      if (sesionGuardada) {
        setUsuario(JSON.parse(sesionGuardada));
      }
    } catch (e) {
      console.error('Error al cargar sesión desde localStorage', e);
      localStorage.removeItem('obraspro_sesion');
    }
  }, []);

  const login = (correoInput: string, claveInput: string): boolean => {
    setErrorLogin(null);
    const correoNorm = correoInput.trim().toLowerCase();

    // Buscar en usuarios guardados en localStorage o predefinidos
    let listaUsuarios = USUARIOS_PREDEFINIDOS;
    try {
      const usuariosGuardadosRaw = localStorage.getItem('obraspro_usuarios_registrados');
      if (usuariosGuardadosRaw) {
        const parsing = JSON.parse(usuariosGuardadosRaw);
        if (Array.isArray(parsing)) {
          listaUsuarios = [...USUARIOS_PREDEFINIDOS, ...parsing];
        }
      }
    } catch (e) {
      console.error(e);
    }

    const usuarioEncontrado = listaUsuarios.find(
      u => u.correo.toLowerCase() === correoNorm && u.clave === claveInput
    );

    if (usuarioEncontrado) {
      const datosSesion: SesionUsuario = {
        correo: usuarioEncontrado.correo,
        nombre: usuarioEncontrado.nombre,
        rol: usuarioEncontrado.rol
      };

      localStorage.setItem('obraspro_sesion', JSON.stringify(datosSesion));
      setUsuario(datosSesion);
      return true;
    } else {
      setErrorLogin('Credenciales inválidas. Correo o contraseña incorrectos.');
      return false;
    }
  };

  const logout = () => {
    localStorage.removeItem('obraspro_sesion');
    setUsuario(null);
    setErrorLogin(null);
  };

  const estaAutenticado = usuario !== null;

  return (
    <AuthContext.Provider value={{ usuario, estaAutenticado, login, logout, errorLogin }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth debe ser utilizado dentro de un AuthProvider');
  }
  return context;
}
