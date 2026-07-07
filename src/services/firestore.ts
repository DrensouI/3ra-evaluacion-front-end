// Importa servicios de Firebase
import { auth, db } from './firebase';
import {
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  User,
} from 'firebase/auth';
import {
  collection,
  getDocs,
  setDoc,
  doc,
  deleteDoc,
  writeBatch,
  DocumentData,
} from 'firebase/firestore';
import { Obra, Personal, Reporte, SesionUsuario } from '../types';

// Retorna referencia a una colección
const coleccionDe = (nombre: string) => collection(db, nombre);

// Convierte snapshot de Firestore a array tipado
function mapSnapshot<T extends DocumentData>(snapshot: any): T[] {
  return snapshot.docs.map((documento: any) => ({ 
    id: documento.id,
    ...documento.data()
  })) as T[];
}

// ==================== AUTENTICACIÓN ====================

// Escucha cambios de estado de autenticación
export function authStateObserver(callback: (user: User | null) => void) {
  return onAuthStateChanged(auth, callback);
}

// Login con email y contraseña
export async function loginFirebase(correo: string, clave: string) {
  const usuario = await signInWithEmailAndPassword(auth, correo, clave);
  return usuario.user;
}

// Cierra sesión
export async function logoutFirebase() {
  await signOut(auth);
}

// ==================== LEER DATOS (READ) ====================

// Obtiene todas las obras
export async function obtenerObras(): Promise<Obra[]> {
  const snapshot = await getDocs(coleccionDe('obras'));
  return mapSnapshot<Obra>(snapshot);
}

// Obtiene todo el personal
export async function obtenerPersonal(): Promise<Personal[]> {
  const snapshot = await getDocs(coleccionDe('personal'));
  return mapSnapshot<Personal>(snapshot);
}

// Obtiene todos los reportes
export async function obtenerReportes(): Promise<Reporte[]> {
  const snapshot = await getDocs(coleccionDe('reportes'));
  return mapSnapshot<Reporte>(snapshot);
}

// ==================== GUARDAR COLECCIONES COMPLETAS ====================

// Reemplaza todos los documentos de una colección
async function guardarColeccion<T extends { id: string }>(nombre: string, items: T[]) {
  const referencia = coleccionDe(nombre);
  const snapshot = await getDocs(referencia);
  const batch = writeBatch(db);

  // Borra documentos actuales
  snapshot.docs.forEach((documento: any) => {
    batch.delete(documento.ref);
  });

  // Guarda nuevos items
  items.forEach(item => {
    const referenciaDoc = doc(db, nombre, item.id);
    batch.set(referenciaDoc, item);
  });

  await batch.commit();
}

// Guarda todas las obras
export async function guardarObras(items: Obra[]): Promise<void> {
  await guardarColeccion<Obra>('obras', items);
}

// Guarda todo el personal
export async function guardarPersonal(items: Personal[]): Promise<void> {
  await guardarColeccion<Personal>('personal', items);
}

// Guarda todos los reportes
export async function guardarReportes(items: Reporte[]): Promise<void> {
  await guardarColeccion<Reporte>('reportes', items);
}

// ==================== MIGRACIÓN DE DATOS ====================

// Migra datos masivamente a Firestore
export async function migrarDatos(data: { obras: Obra[]; personal: Personal[]; reportes: Reporte[] }) {
  const batch = writeBatch(db);

  const colecciones = [
    { nombre: 'obras', items: data.obras },
    { nombre: 'personal', items: data.personal },
    { nombre: 'reportes', items: data.reportes },
  ];

  for (const { nombre, items } of colecciones) {
    const referencia = coleccionDe(nombre);
    const snapshot = await getDocs(referencia);
    snapshot.docs.forEach((documento: any) => batch.delete(documento.ref));
    items.forEach(item => {
      const referenciaDoc = doc(db, nombre, item.id);
      batch.set(referenciaDoc, item);
    });
  }

  await batch.commit();
}

// ==================== OBRAS - CRUD ====================

// Crea una obra
export async function crearObra(obra: Obra): Promise<Obra> {
  const referenciaDoc = doc(db, 'obras', obra.id);
  await setDoc(referenciaDoc, obra);
  return obra;
}

// Actualiza una obra
export async function actualizarObra(id: string, cambios: Partial<Obra>): Promise<Obra> {
  const referenciaDoc = doc(db, 'obras', id);
  await setDoc(referenciaDoc, cambios, { merge: true });
  return { id, ...cambios } as Obra;
}

// Elimina una obra
export async function eliminarObra(id: string): Promise<void> {
  await deleteDoc(doc(db, 'obras', id));
}

// ==================== PERSONAL - CRUD ====================

// Crea un personal
export async function crearPersonal(personal: Personal): Promise<Personal> {
  const referenciaDoc = doc(db, 'personal', personal.id);
  await setDoc(referenciaDoc, personal);
  return personal;
}

// Actualiza un personal
export async function actualizarPersonal(id: string, cambios: Partial<Personal>): Promise<Personal> {
  const referenciaDoc = doc(db, 'personal', id);
  await setDoc(referenciaDoc, cambios, { merge: true });
  return { id, ...cambios } as Personal;
}

// Elimina un personal
export async function eliminarPersonal(id: string): Promise<void> {
  await deleteDoc(doc(db, 'personal', id));
}

// ==================== REPORTES - CRUD ====================

// Crea un reporte
export async function crearReporte(reporte: Reporte): Promise<Reporte> {
  const referenciaDoc = doc(db, 'reportes', reporte.id);
  await setDoc(referenciaDoc, reporte);
  return reporte;
}

// Actualiza un reporte
export async function actualizarReporte(id: string, cambios: Partial<Reporte>): Promise<Reporte> {
  const referenciaDoc = doc(db, 'reportes', id);
  await setDoc(referenciaDoc, cambios, { merge: true });
  return { id, ...cambios } as Reporte;
}

// Elimina un reporte
export async function eliminarReporte(id: string): Promise<void> {
  await deleteDoc(doc(db, 'reportes', id));
}
