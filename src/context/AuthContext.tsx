// Importa React y hooks
import React, { createContext, useContext, useEffect, useState } from 'react';
import { SesionUsuario } from '../types';
import { authStateObserver, loginFirebase, logoutFirebase } from '../services/firestore';
import { loginAdmin } from '../services/auth';

// Estructura del contexto
interface AuthContextType {
  usuario: SesionUsuario | null;
  estaAutenticado: boolean;
  cargando: boolean;
  login: (correo: string, clave: string) => Promise<boolean>;
  logout: () => void;
  errorLogin: string | null;
}

// Crea el contexto
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Proveedor de autenticación
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [usuario, setUsuario] = useState<SesionUsuario | null>(null);
  const [errorLogin, setErrorLogin] = useState<string | null>(null);
  const [cargando, setCargando] = useState(true);

  // Verifica sesión previa al cargar
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

  // Login con email y contraseña
  const login = async (correoIngresado: string, claveIngresada: string): Promise<boolean> => {
    setErrorLogin(null);
    const correoNormalizado = correoIngresado.trim().toLowerCase();

    // Valida email y contraseña
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
      console.warn('Error en login Firebase:', error);
      // Fallback local/backend admin login for admin@admin.com
      if (correoNormalizado === 'admin@admin.com') {
        try {
          const usuarioAdmin = await loginAdmin(correoNormalizado, claveIngresada);
          setUsuario({
            correo: usuarioAdmin.usuario.correo,
            nombre: usuarioAdmin.usuario.nombre,
            rol: usuarioAdmin.usuario.rol,
          });
          return true;
        } catch (fallbackError) {
          console.warn('Fallback login admin failed:', fallbackError);
        }
      }
      setErrorLogin('Credenciales incorrectas o error de autenticación.');
      return false;
    }
  };

  // Cierra sesión
  const logout = async () => {
    try {
      await logoutFirebase();
    } catch (error) {
      console.warn('Error al cerrar sesión:', error);
    }
    setUsuario(null);
    setErrorLogin(null);
  };

  // Proporciona contexto a la app
  return (
    <AuthContext.Provider value={{ 
      usuario, 
      estaAutenticado: Boolean(usuario), 
      cargando, 
      login, 
      logout, 
      errorLogin 
    }}>
      {children}
    </AuthContext.Provider>
  );
}

// Hook para acceder al contexto
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth debe ser utilizado dentro de un AuthProvider');
  return context;
}
