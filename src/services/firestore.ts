// Importa la instancia de autenticación y base de datos desde firebase.ts
import { auth, db } from './firebase';
// Importa funciones de autenticación de Firebase
import {
  signInWithEmailAndPassword,  // Para hacer login
  signOut,                      // Para cerrar sesión
  onAuthStateChanged,           // Para escuchar cambios de autenticación
  User,                         // Tipo de datos del usuario
} from 'firebase/auth';
// Importa funciones de Firestore para operaciones con base de datos
import {
  collection,      // Para referirse a una colección
  getDocs,         // Para obtener todos los documentos
  setDoc,          // Para crear o actualizar un documento
  doc,             // Para referirse a un documento específico
  deleteDoc,       // Para eliminar un documento
  writeBatch,      // Para operaciones en batch (múltiples a la vez)
  DocumentData,    // Tipo genérico para datos
} from 'firebase/firestore';
// Importa los tipos de datos definidos en types.ts
import { Obra, Personal, Reporte, SesionUsuario } from '../types';

// Función auxiliar que retorna una referencia a una colección en Firestore
// Ejemplo: coleccionDe('obras') devuelve referencia a la colección de obras
const coleccionDe = (nombre: string) => collection(db, nombre);

// Función auxiliar que convierte un snapshot (resultado de una consulta) en un array de objetos
// Extrae los datos de cada documento y agrega el ID
// T es un tipo genérico que puede ser Obra, Personal, Reporte, etc
function mapSnapshot<T extends DocumentData>(snapshot: any): T[] {
  // Mapea cada documento del snapshot a un objeto con su ID incluido
  return snapshot.docs.map((documento: any) => ({ 
    id: documento.id,        // Agrega el ID del documento
    ...documento.data()      // Desglosa (spread) los datos del documento
  })) as T[];
}

// ==================== AUTENTICACIÓN ====================

// Función que escucha cambios en el estado de autenticación
// Se ejecuta automáticamente cuando:
// - Usuario inicia sesión
// - Usuario cierra sesión
// - Se abre la app (verifica si hay sesión previa)
export function authStateObserver(callback: (user: User | null) => void) {
  // onAuthStateChanged devuelve una función para detener la escucha
  return onAuthStateChanged(auth, callback);
}

// Función para hacer login con email y contraseña
export async function loginFirebase(correo: string, clave: string) {
  // Envía email y contraseña a Firebase para verificar
  // Si son correctos, devuelve datos del usuario
  // Si no, lanza un error
  const usuario = await signInWithEmailAndPassword(auth, correo, clave);
  // Devuelve el objeto del usuario
  return usuario.user;
}

// Función para cerrar sesión
export async function logoutFirebase() {
  // Cierra la sesión en Firebase
  // Elimina el token del navegador
  await signOut(auth);
}

// ==================== LEER DATOS (READ) ====================

// Obtiene TODAS las obras de Firestore
export async function obtenerObras(): Promise<Obra[]> {
  // getDocs obtiene todos los documentos de la colección
  const snapshot = await getDocs(coleccionDe('obras'));
  // Convierte el snapshot en un array de Obra
  return mapSnapshot<Obra>(snapshot);
}

// Obtiene TODO el personal de Firestore
export async function obtenerPersonal(): Promise<Personal[]> {
  // getDocs obtiene todos los documentos de la colección
  const snapshot = await getDocs(coleccionDe('personal'));
  // Convierte el snapshot en un array de Personal
  return mapSnapshot<Personal>(snapshot);
}

// Obtiene TODOS los reportes de Firestore
export async function obtenerReportes(): Promise<Reporte[]> {
  // getDocs obtiene todos los documentos de la colección
  const snapshot = await getDocs(coleccionDe('reportes'));
  // Convierte el snapshot en un array de Reporte
  return mapSnapshot<Reporte>(snapshot);
}

// ==================== GUARDAR COLECCIONES COMPLETAS ====================

// Función auxiliar que borra todos los documentos de una colección
// y luego guarda los nuevos datos (reemplaza todo)
async function guardarColeccion<T extends { id: string }>(nombre: string, items: T[]) {
  // Obtiene referencia a la colección
  const referencia = coleccionDe(nombre);
  // Obtiene todos los documentos actuales
  const snapshot = await getDocs(referencia);
  // Crea un batch (lote) para operaciones múltiples eficientes
  const batch = writeBatch(db);

  // Borra todos los documentos actuales
  snapshot.docs.forEach((documento: any) => {
    batch.delete(documento.ref);  // Agrega eliminación al batch
  });

  // Guarda los nuevos items
  items.forEach(item => {
    // Crea una referencia al documento con el ID del item
    const referenciaDoc = doc(db, nombre, item.id);
    // Agrega la creación/actualización al batch
    batch.set(referenciaDoc, item);
  });

  // Ejecuta todas las operaciones del batch de una sola vez
  await batch.commit();
}

// Guarda todas las obras (reemplaza la colección completa)
export async function guardarObras(items: Obra[]): Promise<void> {
  await guardarColeccion<Obra>('obras', items);
}

// Guarda todo el personal (reemplaza la colección completa)
export async function guardarPersonal(items: Personal[]): Promise<void> {
  await guardarColeccion<Personal>('personal', items);
}

// Guarda todos los reportes (reemplaza la colección completa)
export async function guardarReportes(items: Reporte[]): Promise<void> {
  await guardarColeccion<Reporte>('reportes', items);
}

// ==================== MIGRACIÓN DE DATOS ====================

// Función para migrar datos masivamente (usado al importar desde localStorage a Firestore)
export async function migrarDatos(data: { obras: Obra[]; personal: Personal[]; reportes: Reporte[] }) {
  // Crea un batch para operaciones múltiples
  const batch = writeBatch(db);

  // Define las colecciones y sus datos
  const colecciones = [
    { nombre: 'obras', items: data.obras },
    { nombre: 'personal', items: data.personal },
    { nombre: 'reportes', items: data.reportes },
  ];

  // Para cada colección
  for (const { nombre, items } of colecciones) {
    // Obtiene referencia a la colección
    const referencia = coleccionDe(nombre);
    // Obtiene todos los documentos actuales
    const snapshot = await getDocs(referencia);
    // Borra todos los documentos actuales
    snapshot.docs.forEach((documento: any) => batch.delete(documento.ref));
    // Guarda los nuevos datos
    items.forEach(item => {
      const referenciaDoc = doc(db, nombre, item.id);
      batch.set(referenciaDoc, item);
    });
  }

  // Ejecuta todas las operaciones de una sola vez
  await batch.commit();
}

// ==================== OBRAS - CRUD ====================

// CREATE: Crear una obra nueva
export async function crearObra(obra: Obra): Promise<Obra> {
  // Crea una referencia al documento con el ID de la obra
  const referenciaDoc = doc(db, 'obras', obra.id);
  // Guarda el documento en Firestore
  await setDoc(referenciaDoc, obra);
  // Devuelve la obra creada
  return obra;
}

// UPDATE: Actualizar una obra existente
export async function actualizarObra(id: string, cambios: Partial<Obra>): Promise<Obra> {
  // Crea una referencia al documento
  const referenciaDoc = doc(db, 'obras', id);
  // Actualiza solo los campos especificados (merge: true = no borra otros campos)
  await setDoc(referenciaDoc, cambios, { merge: true });
  // Devuelve la obra actualizada (combinando ID y cambios)
  return { id, ...cambios } as Obra;
}

// DELETE: Eliminar una obra
export async function eliminarObra(id: string): Promise<void> {
  // Crea una referencia al documento y lo borra
  await deleteDoc(doc(db, 'obras', id));
}

// ==================== PERSONAL - CRUD ====================

// CREATE: Crear un personal nuevo
export async function crearPersonal(personal: Personal): Promise<Personal> {
  // Crea una referencia al documento con el ID del personal
  const referenciaDoc = doc(db, 'personal', personal.id);
  // Guarda el documento en Firestore
  await setDoc(referenciaDoc, personal);
  // Devuelve el personal creado
  return personal;
}

// UPDATE: Actualizar un personal existente
export async function actualizarPersonal(id: string, cambios: Partial<Personal>): Promise<Personal> {
  // Crea una referencia al documento
  const referenciaDoc = doc(db, 'personal', id);
  // Actualiza solo los campos especificados (merge: true = no borra otros campos)
  await setDoc(referenciaDoc, cambios, { merge: true });
  // Devuelve el personal actualizado
  return { id, ...cambios } as Personal;
}

// DELETE: Eliminar un personal
export async function eliminarPersonal(id: string): Promise<void> {
  // Crea una referencia al documento y lo borra
  await deleteDoc(doc(db, 'personal', id));
}

// ==================== REPORTES - CRUD ====================

// CREATE: Crear un reporte nuevo
export async function crearReporte(reporte: Reporte): Promise<Reporte> {
  // Crea una referencia al documento con el ID del reporte
  const referenciaDoc = doc(db, 'reportes', reporte.id);
  // Guarda el documento en Firestore
  await setDoc(referenciaDoc, reporte);
  // Devuelve el reporte creado
  return reporte;
}

// UPDATE: Actualizar un reporte existente
export async function actualizarReporte(id: string, cambios: Partial<Reporte>): Promise<Reporte> {
  // Crea una referencia al documento
  const referenciaDoc = doc(db, 'reportes', id);
  // Actualiza solo los campos especificados (merge: true = no borra otros campos)
  await setDoc(referenciaDoc, cambios, { merge: true });
  // Devuelve el reporte actualizado
  return { id, ...cambios } as Reporte;
}

// DELETE: Eliminar un reporte
export async function eliminarReporte(id: string): Promise<void> {
  // Crea una referencia al documento y lo borra
  await deleteDoc(doc(db, 'reportes', id));
}
