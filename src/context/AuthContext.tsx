import React, { createContext, useContext, useState } from 'react';
import { SesionUsuario } from '../types';
import { loginAdmin, guardarToken, borrarToken } from '../services/auth';

const CLAVE_SESION = 'hexacall_sesion';

interface AuthContextType {
  usuario: SesionUsuario | null;
  estaAutenticado: boolean;
  login: (correo: string, clave: string) => Promise<boolean>;
  logout: () => void;
  errorLogin: string | null;
}

//  Se crea el contexto global para almacenar la sesión (createContext).
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
  // Estado principal que intenta rescatar la sesión desde el almacenamiento del navegador (useState + localStorage).
  const [usuario, setUsuario] = useState<SesionUsuario | null>(cargarSesionDesdeStorage);
  const [errorLogin, setErrorLogin] = useState<string | null>(null);

  // Función login que intenta autenticar contra el endpoint backend y guarda la sesión en localStorage.
  const login = async (correoIngresado: string, claveIngresada: string): Promise<boolean> => {
    setErrorLogin(null);
    const correoNormalizado = correoIngresado.trim().toLowerCase();

    if (!correoNormalizado.includes('@') || claveIngresada.length < 4) {
      setErrorLogin('Correo o contraseña inválidos.');
      return false;
    }

    try {
      const respuesta = await loginAdmin(correoNormalizado, claveIngresada);
      const datosSesionUsuario: SesionUsuario = {
        correo: respuesta.usuario.correo,
        nombre: respuesta.usuario.nombre,
        rol: respuesta.usuario.rol,
      };

      guardarToken(respuesta.token);
      localStorage.setItem(CLAVE_SESION, JSON.stringify(datosSesionUsuario));
      setUsuario(datosSesionUsuario);
      return true;
    } catch (error) {
      console.error('Error en login:', error);
      setErrorLogin('Credenciales incorrectas o error del servidor.');
      return false;
    }
  };

  // Función logout que remueve todo rastro de la sesión actual (Definición de logout).
  const logout = () => {
    localStorage.removeItem(CLAVE_SESION);
    borrarToken();
    setUsuario(null);
    setErrorLogin(null);
  };

  // Compartimos el estado 'usuario' y las funciones al resto de la app (AuthContext.Provider).
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
