import React, { createContext, useContext, useEffect, useState } from 'react';
import { SesionUsuario } from '../types';
import { authStateObserver, loginFirebase, logoutFirebase } from '../services/firestore';

interface AuthContextType {
  usuario: SesionUsuario | null;
  estaAutenticado: boolean;
  cargando: boolean;
  login: (correo: string, clave: string) => Promise<boolean>;
  logout: () => void;
  errorLogin: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [usuario, setUsuario] = useState<SesionUsuario | null>(null);
  const [errorLogin, setErrorLogin] = useState<string | null>(null);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    const unsubscribe = authStateObserver(user => {
      if (user) {
        const correo = user.email || '';
        setUsuario({
          correo,
          nombre: user.displayName || correo.split('@')[0] || 'Usuario',
          rol: 'administrador',
        });
      } else {
        setUsuario(null);
      }
      setCargando(false);
    });

    return unsubscribe;
  }, []);

  const login = async (correoIngresado: string, claveIngresada: string): Promise<boolean> => {
    setErrorLogin(null);
    const correoNormalizado = correoIngresado.trim().toLowerCase();

    if (!correoNormalizado.includes('@') || claveIngresada.length < 4) {
      setErrorLogin('Correo o contraseña inválidos.');
      return false;
    }

    try {
      const usuarioFirebase = await loginFirebase(correoNormalizado, claveIngresada);
      setUsuario({
        correo: usuarioFirebase.email || correoNormalizado,
        nombre: usuarioFirebase.displayName || correoNormalizado.split('@')[0],
        rol: 'administrador',
      });
      return true;
    } catch (error) {
      console.error('Error en login Firebase:', error);
      setErrorLogin('Credenciales incorrectas o error de autenticación.');
      return false;
    }
  };

  const logout = async () => {
    try {
      await logoutFirebase();
    } catch (error) {
      console.warn('Error al cerrar sesión:', error);
    }
    setUsuario(null);
    setErrorLogin(null);
  };

  return (
    <AuthContext.Provider value={{ usuario, estaAutenticado: Boolean(usuario), cargando, login, logout, errorLogin }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth debe ser utilizado dentro de un AuthProvider');
  return context;
}
