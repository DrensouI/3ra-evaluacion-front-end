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

const coleccionDe = (nombre: string) => collection(db, nombre);

function mapSnapshot<T extends DocumentData>(snapshot: any): T[] {
  return snapshot.docs.map((documento: any) => ({ id: documento.id, ...documento.data() })) as T[];
}

export function authStateObserver(callback: (user: User | null) => void) {
  return onAuthStateChanged(auth, callback);
}

export async function loginFirebase(correo: string, clave: string) {
  const usuario = await signInWithEmailAndPassword(auth, correo, clave);
  return usuario.user;
}

export async function logoutFirebase() {
  await signOut(auth);
}

export async function obtenerObras(): Promise<Obra[]> {
  const snapshot = await getDocs(coleccionDe('obras'));
  return mapSnapshot<Obra>(snapshot);
}

export async function obtenerPersonal(): Promise<Personal[]> {
  const snapshot = await getDocs(coleccionDe('personal'));
  return mapSnapshot<Personal>(snapshot);
}

export async function obtenerReportes(): Promise<Reporte[]> {
  const snapshot = await getDocs(coleccionDe('reportes'));
  return mapSnapshot<Reporte>(snapshot);
}

async function guardarColeccion<T extends { id: string }>(nombre: string, items: T[]) {
  const referencia = coleccionDe(nombre);
  const snapshot = await getDocs(referencia);
  const batch = writeBatch(db);

  snapshot.docs.forEach((documento: any) => {
    batch.delete(documento.ref);
  });

  items.forEach(item => {
    const referenciaDoc = doc(db, nombre, item.id);
    batch.set(referenciaDoc, item);
  });

  await batch.commit();
}

export async function guardarObras(items: Obra[]): Promise<void> {
  await guardarColeccion<Obra>('obras', items);
}

export async function guardarPersonal(items: Personal[]): Promise<void> {
  await guardarColeccion<Personal>('personal', items);
}

export async function guardarReportes(items: Reporte[]): Promise<void> {
  await guardarColeccion<Reporte>('reportes', items);
}

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

export async function crearObra(obra: Obra): Promise<Obra> {
  const referenciaDoc = doc(db, 'obras', obra.id);
  await setDoc(referenciaDoc, obra);
  return obra;
}

export async function actualizarObra(id: string, cambios: Partial<Obra>): Promise<Obra> {
  const referenciaDoc = doc(db, 'obras', id);
  await setDoc(referenciaDoc, cambios, { merge: true });
  return { id, ...cambios } as Obra;
}

export async function eliminarObra(id: string): Promise<void> {
  await deleteDoc(doc(db, 'obras', id));
}

export async function crearPersonal(personal: Personal): Promise<Personal> {
  const referenciaDoc = doc(db, 'personal', personal.id);
  await setDoc(referenciaDoc, personal);
  return personal;
}

export async function actualizarPersonal(id: string, cambios: Partial<Personal>): Promise<Personal> {
  const referenciaDoc = doc(db, 'personal', id);
  await setDoc(referenciaDoc, cambios, { merge: true });
  return { id, ...cambios } as Personal;
}

export async function eliminarPersonal(id: string): Promise<void> {
  await deleteDoc(doc(db, 'personal', id));
}

export async function crearReporte(reporte: Reporte): Promise<Reporte> {
  const referenciaDoc = doc(db, 'reportes', reporte.id);
  await setDoc(referenciaDoc, reporte);
  return reporte;
}

export async function actualizarReporte(id: string, cambios: Partial<Reporte>): Promise<Reporte> {
  const referenciaDoc = doc(db, 'reportes', id);
  await setDoc(referenciaDoc, cambios, { merge: true });
  return { id, ...cambios } as Reporte;
}

export async function eliminarReporte(id: string): Promise<void> {
  await deleteDoc(doc(db, 'reportes', id));
}
