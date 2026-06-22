import React, { createContext, useContext, useState } from 'react';
import { SesionUsuario } from '../types';

const CLAVE_SESION = 'hexacall_sesion';

const USUARIOS_PREDETERMINADOS = [
  { correo: 'admin@admin.com', clave: '123456', nombre: 'Luis Alberto Rojas', rol: 'administrador' },
];

interface AuthContextType {
  usuario: SesionUsuario | null;
  estaAutenticado: boolean;
  login: (correo: string, clave: string) => boolean;
  logout: () => void;
  errorLogin: string | null;
}

// # PASO 1 Se crea el contexto global para almacenar la sesión (createContext).
const AuthContext = createContext<AuthContextType | undefined>(undefined);

const cargarSesionDesdeStorage = () => {
  try {
    return JSON.parse(localStorage.getItem(CLAVE_SESION) ?? 'null');
  } catch {
    localStorage.removeItem(CLAVE_SESION);
    return null;
  }
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
  // # PASO 2 Estado principal que intenta rescatar la sesión desde el almacenamiento del navegador (useState + localStorage).
  const [usuario, setUsuario] = useState<SesionUsuario | null>(cargarSesionDesdeStorage);
  const [errorLogin, setErrorLogin] = useState<string | null>(null);

  // # PASO 3 Función login que busca coincidencia de credenciales en el arreglo.
  const login = (correoIngresado: string, claveIngresada: string): boolean => {
    setErrorLogin(null);
    const correoNormalizado = correoIngresado.trim().toLowerCase();

    const usuarioEncontrado = USUARIOS_PREDETERMINADOS.find(u => u.correo.toLowerCase() === correoNormalizado && u.clave === claveIngresada);
    if (!usuarioEncontrado) {
      setErrorLogin('Credenciales inválidas. Correo o contraseña incorrectos.');
      return false;
    }

    const datosSesionUsuario: SesionUsuario = {
      correo: usuarioEncontrado.correo,
      nombre: usuarioEncontrado.nombre,
      rol: usuarioEncontrado.rol,
    };

    // # PASO 3.1 Se persiste el usuario en el navegador y se actualiza el estado reactivo (localStorage.setItem y setUsuario).
    localStorage.setItem(CLAVE_SESION, JSON.stringify(datosSesionUsuario));
    setUsuario(datosSesionUsuario);
    return true;
  };

  // # PASO 4 Función logout que remueve todo rastro de la sesión actual (Definición de logout).
  const logout = () => {
    localStorage.removeItem(CLAVE_SESION);
    setUsuario(null);
    setErrorLogin(null);
  };

  // # PASO 5 Compartimos el estado 'usuario' y las funciones al resto de la app (AuthContext.Provider).
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
