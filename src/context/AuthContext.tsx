import React, { createContext, useContext, useState } from 'react';
import { SesionUsuario } from '../types';

const CLAVE_SESION = 'hexacall_sesion';
const USUARIOS_PREDEFINIDOS = [
  { correo: 'admin@admin.com', clave: '123456', nombre: 'Luis Alberto Rojas', rol: 'administrador' },
];

interface AuthContextType {
  usuario: SesionUsuario | null;
  estaAutenticado: boolean;
  login: (correo: string, clave: string) => boolean;
  logout: () => void;
  errorLogin: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const cargarSesion = () => {
  try {
    return JSON.parse(localStorage.getItem(CLAVE_SESION) ?? 'null');
  } catch {
    localStorage.removeItem(CLAVE_SESION);
    return null;
  }
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [usuario, setUsuario] = useState<SesionUsuario | null>(cargarSesion);
  const [errorLogin, setErrorLogin] = useState<string | null>(null);

  const login = (correoInput: string, claveInput: string): boolean => {
    setErrorLogin(null);
    const correoNorm = correoInput.trim().toLowerCase();
    const usuarioEncontrado = USUARIOS_PREDEFINIDOS.find(
      u => u.correo.toLowerCase() === correoNorm && u.clave === claveInput
    );
    if (!usuarioEncontrado) return setErrorLogin('Credenciales inválidas. Correo o contraseña incorrectos.'), false;
    const datosSesion = { correo: usuarioEncontrado.correo, nombre: usuarioEncontrado.nombre, rol: usuarioEncontrado.rol };
    localStorage.setItem(CLAVE_SESION, JSON.stringify(datosSesion));
    setUsuario(datosSesion);  
    return true;
  };

  const logout = () => (localStorage.removeItem(CLAVE_SESION), setUsuario(null), setErrorLogin(null));

  return (
    <AuthContext.Provider value={{ usuario, estaAutenticado: Boolean(usuario), login, logout, errorLogin }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth debe ser utilizado dentro de un AuthProvider');
  return context;
}
