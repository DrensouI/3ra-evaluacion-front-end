// Importa la función para inicializar la app de Firebase
import { initializeApp } from "firebase/app";
// Importa la función para obtener el servicio de Autenticación (Auth)
import { getAuth } from "firebase/auth";
// Importa la función para obtener el servicio de Base de Datos (Firestore)
import { getFirestore } from "firebase/firestore";

// Configuración de Firebase con credenciales desde variables de entorno (.env)
// import.meta.env.VITE_* obtiene valores del archivo .env
const firebaseConfig = {
  // Clave única para identificar tu app en Firebase
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  // Dominio de autenticación (donde están los usuarios)
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  // ID del proyecto Firebase en Google Cloud
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  // Bucket de almacenamiento de archivos (opcional para HEXACALL)
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  // ID del remitente para mensajes de Firebase
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  // ID único de la aplicación web
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

// Inicializa la app de Firebase con la configuración anterior
// Esto conecta tu proyecto con los servidores de Google
const app = initializeApp(firebaseConfig);

// Obtiene la instancia de Autenticación de Firebase (para logins)
// Se exporta para que otros archivos puedan usarla
export const auth = getAuth(app);

// Obtiene la instancia de Firestore (para guardar datos)
// Se exporta para que otros archivos puedan usarla
export const db = getFirestore(app);
