// Importa React y hooks necesarios para crear el contexto
import React, { createContext, useContext, useEffect, useState } from 'react';
// Importa el tipo de datos del usuario desde types.ts
import { SesionUsuario } from '../types';
// Importa funciones de autenticación desde firestore.ts
import { authStateObserver, loginFirebase, logoutFirebase } from '../services/firestore';

// Define la estructura de datos que el AuthContext proporciona a toda la app
interface AuthContextType {
  // Usuario autenticado actual (null si no hay sesión)
  usuario: SesionUsuario | null;
  // Booleano para saber si está autenticado
  estaAutenticado: boolean;
  // Booleano para saber si se está cargando (verificando sesión)
  cargando: boolean;
  // Función para hacer login (devuelve true si éxito, false si error)
  login: (correo: string, clave: string) => Promise<boolean>;
  // Función para cerrar sesión
  logout: () => void;
  // Mensaje de error si el login falló
  errorLogin: string | null;
}

// Crea el contexto (área compartida donde guardar datos de autenticación)
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Componente proveedor que envuelve la app y proporciona autenticación a todos
export function AuthProvider({ children }: { children: React.ReactNode }) {
  // Estado: datos del usuario actual
  const [usuario, setUsuario] = useState<SesionUsuario | null>(null);
  // Estado: mensaje de error en login
  const [errorLogin, setErrorLogin] = useState<string | null>(null);
  // Estado: si está cargando (verificando sesión previa)
  const [cargando, setCargando] = useState(true);

  // Hook que se ejecuta al cargar el componente (una sola vez)
  useEffect(() => {
    // Escucha cambios en el estado de autenticación de Firebase
    // Si hay sesión previa, el usuario se carga automáticamente
    const unsubscribe = authStateObserver(user => {
      // Si hay usuario autenticado
      if (user) {
        // Obtiene el email del usuario
        const correo = user.email || '';
        // Actualiza el estado con datos del usuario
        setUsuario({
          correo,
          // Usa el nombre registrado en Firebase, o saca el nombre del email antes del @
          nombre: user.displayName || correo.split('@')[0] || 'Usuario',
          // Para HEXACALL, todos son administradores
          rol: 'administrador',
        });
      } else {
        // Si no hay usuario, limpia el estado
        setUsuario(null);
      }
      // Marca que terminó de cargar/verificar la sesión
      setCargando(false);
    });

    // Devuelve la función que detiene de escuchar cambios (cleanup)
    return unsubscribe;
  }, []);

  // Función para hacer login con email y contraseña
  const login = async (correoIngresado: string, claveIngresada: string): Promise<boolean> => {
    // Limpia errores previos
    setErrorLogin(null);
    // Normaliza el email: quita espacios y convierte a minúsculas
    const correoNormalizado = correoIngresado.trim().toLowerCase();

    // Validaciones básicas
    // Si no tiene @ o contraseña muy corta, rechaza
    if (!correoNormalizado.includes('@') || claveIngresada.length < 4) {
      setErrorLogin('Correo o contraseña inválidos.');
      // Devuelve false para indicar que falló
      return false;
    }

    // Intenta autenticarse con Firebase
    try {
      // Envía email y contraseña a Firebase para verificar
      const usuarioFirebase = await loginFirebase(correoNormalizado, claveIngresada);
      // Si fue exitoso, actualiza el estado con los datos del usuario
      setUsuario({
        correo: usuarioFirebase.email || correoNormalizado,
        nombre: usuarioFirebase.displayName || correoNormalizado.split('@')[0],
        rol: 'administrador',
      });
      // Devuelve true para indicar que el login fue exitoso
      return true;
    } catch (error) {
      // Si hay error (credenciales incorrectas, usuario no existe, etc)
      console.error('Error en login Firebase:', error);
      // Muestra un mensaje de error genérico por seguridad
      setErrorLogin('Credenciales incorrectas o error de autenticación.');
      // Devuelve false para indicar que falló
      return false;
    }
  };

  // Función para cerrar sesión
  const logout = async () => {
    // Intenta cerrar la sesión en Firebase
    try {
      // Envía la solicitud de logout a Firebase
      await logoutFirebase();
    } catch (error) {
      // Si hay error, solo lo registra pero no hace nada
      console.warn('Error al cerrar sesión:', error);
    }
    // Limpia el estado del usuario
    setUsuario(null);
    // Limpia el mensaje de error
    setErrorLogin(null);
  };

  // Proporciona los valores a todos los componentes dentro de AuthProvider
  return (
    <AuthContext.Provider value={{ 
      usuario, 
      // estaAutenticado es true si usuario no es null
      estaAutenticado: Boolean(usuario), 
      cargando, 
      login, 
      logout, 
      errorLogin 
    }}>
      {/* children son todos los componentes dentro del AuthProvider */}
      {children}
    </AuthContext.Provider>
  );
}

// Hook personalizado para acceder al contexto desde cualquier componente
export function useAuth() {
  // Obtiene el contexto
  const context = useContext(AuthContext);
  // Si no está dentro de un AuthProvider, lanza error
  if (!context) throw new Error('useAuth debe ser utilizado dentro de un AuthProvider');
  // Devuelve el contexto para que el componente pueda usarlo
  return context;
}
