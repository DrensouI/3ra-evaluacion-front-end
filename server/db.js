import dotenv from 'dotenv';
import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

dotenv.config();

let firestoreDb = null;
const memoryCollections = new Map();

function buildServiceAccount() {
  const projectId = process.env.FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n');

  if (!projectId || !clientEmail || !privateKey) {
    return null;
  }

  return {
    project_id: projectId,
    client_email: clientEmail,
    private_key: privateKey,
  };
}

function isRealServiceAccount(credentials) {
  return Boolean(
    credentials
    && credentials.project_id
    && credentials.client_email
    && credentials.private_key
    && credentials.private_key.includes('BEGIN PRIVATE KEY')
    && !credentials.private_key.includes('TU_PRIVATE_KEY')
  );
}

function normalizeId(value) {
  return value === undefined || value === null ? undefined : String(value);
}

function matchesFilter(documento, filtro) {
  if (!filtro || typeof filtro !== 'object' || Array.isArray(filtro)) {
    return true;
  }

  return Object.entries(filtro).every(([campo, valor]) => {
    if (campo === 'id' && valor !== undefined) {
      return normalizeId(documento.id ?? documento[campo]) === normalizeId(valor);
    }

    if (valor && typeof valor === 'object' && '$regex' in valor) {
      const regex = new RegExp(String(valor.$regex), valor.$options || 'i');
      return regex.test(String(documento[campo] ?? ''));
    }

    return documento[campo] === valor;
  });
}

function toPlainDocument(documento) {
  if (!documento) {
    return null;
  }

  return { ...documento.data(), id: documento.id };
}

function createMemoryDb() {
  return {
    collection(nombreColeccion) {
      if (!memoryCollections.has(nombreColeccion)) {
        memoryCollections.set(nombreColeccion, []);
      }

      const documentos = memoryCollections.get(nombreColeccion);

      return {
        async findOne(filtro = {}) {
          return documentos.find(item => matchesFilter(item, filtro)) || null;
        },

        find() {
          return {
            async toArray() {
              return [...documentos];
            },
          };
        },

        async deleteMany(filtro = {}) {
          const filtrados = documentos.filter(item => matchesFilter(item, filtro));
          if (filtrados.length === 0) {
            return { deletedCount: 0 };
          }

          filtrados.forEach(item => {
            const index = documentos.indexOf(item);
            if (index >= 0) {
              documentos.splice(index, 1);
            }
          });
          return { deletedCount: filtrados.length };
        },

        async deleteOne(filtro = {}) {
          const item = documentos.find(doc => matchesFilter(doc, filtro));
          if (!item) {
            return { deletedCount: 0 };
          }

          const index = documentos.indexOf(item);
          documentos.splice(index, 1);
          return { deletedCount: 1 };
        },

        async insertOne(item) {
          const payload = { ...(item || {}) };
          const docId = normalizeId(payload.id) || `mem-${Date.now()}-${documentos.length + 1}`;
          const documento = { ...payload, id: docId };
          documentos.push(documento);
          return documento;
        },

        async insertMany(items = []) {
          const documentosNuevos = [];
          for (const item of items) {
            const payload = { ...(item || {}) };
            const docId = normalizeId(payload.id) || `mem-${Date.now()}-${documentos.length + 1}`;
            const documento = { ...payload, id: docId };
            documentos.push(documento);
            documentosNuevos.push(documento);
          }
          return documentosNuevos;
        },

        async findOneAndUpdate(filtro = {}, actualizacion = {}) {
          const item = documentos.find(doc => matchesFilter(doc, filtro));
          if (!item) {
            return { value: null };
          }

          const cambios = actualizacion.$set || actualizacion || {};
          const actual = { ...item, ...cambios, id: item.id };
          const index = documentos.indexOf(item);
          documentos.splice(index, 1, actual);
          return { value: actual };
        },
      };
    },
  };
}

function createCollectionAdapter(db) {
  return {
    collection(nombreColeccion) {
      const referencia = db.collection(nombreColeccion);

      return {
        async findOne(filtro = {}) {
          const snapshot = await referencia.get();
          const coincidencia = snapshot.docs.find(doc => matchesFilter(toPlainDocument(doc), filtro));
          return coincidencia ? toPlainDocument(coincidencia) : null;
        },

        find() {
          return {
            async toArray() {
              const snapshot = await referencia.get();
              return snapshot.docs.map(doc => toPlainDocument(doc));
            },
          };
        },

        async deleteMany(filtro = {}) {
          const snapshot = await referencia.get();
          const docs = snapshot.docs.filter(doc => matchesFilter(toPlainDocument(doc), filtro));
          if (docs.length === 0) {
            return { deletedCount: 0 };
          }

          const batch = db.batch();
          docs.forEach(doc => batch.delete(doc.ref));
          await batch.commit();
          return { deletedCount: docs.length };
        },

        async deleteOne(filtro = {}) {
          const snapshot = await referencia.get();
          const doc = snapshot.docs.find(item => matchesFilter(toPlainDocument(item), filtro));
          if (!doc) {
            return { deletedCount: 0 };
          }

          await doc.ref.delete();
          return { deletedCount: 1 };
        },

        async insertOne(item) {
          const payload = { ...(item || {}) };
          const docId = normalizeId(payload.id) || referencia.doc().id;
          const documento = { ...payload, id: docId };
          await referencia.doc(docId).set(documento);
          return documento;
        },

        async insertMany(items = []) {
          const batch = db.batch();
          const documentos = [];

          for (const item of items) {
            const payload = { ...(item || {}) };
            const docId = normalizeId(payload.id) || referencia.doc().id;
            const documento = { ...payload, id: docId };
            batch.set(referencia.doc(docId), documento);
            documentos.push(documento);
          }

          if (documentos.length > 0) {
            await batch.commit();
          }

          return documentos;
        },

        async findOneAndUpdate(filtro = {}, actualizacion = {}) {
          const snapshot = await referencia.get();
          const doc = snapshot.docs.find(item => matchesFilter(toPlainDocument(item), filtro));
          if (!doc) {
            return { value: null };
          }

          const actual = toPlainDocument(doc);
          const cambios = actualizacion.$set || actualizacion || {};
          const siguiente = { ...actual, ...cambios, id: actual.id };
          await doc.ref.set(siguiente, { merge: true });
          return { value: siguiente };
        },
      };
    },
  };
}

export async function getDb() {
  if (firestoreDb) {
    return createCollectionAdapter(firestoreDb);
  }

  const credentials = buildServiceAccount();

  if (isRealServiceAccount(credentials)) {
    if (!getApps().length) {
      initializeApp({
        credential: cert(credentials),
        projectId: credentials.project_id,
      });
    }

    try {
      firestoreDb = getFirestore();

      if (process.env.FIREBASE_EMULATOR_HOST) {
        firestoreDb.settings({
          host: process.env.FIREBASE_EMULATOR_HOST,
          ssl: false,
        });
      }

      return createCollectionAdapter(firestoreDb);
    } catch (error) {
      console.warn('No se pudo conectar con Firestore, usando almacenamiento en memoria:', error.message);
      return createMemoryDb();
    }
  }

  console.warn('No se detectaron credenciales reales de Firebase; usando almacenamiento en memoria para la demo.');
  return createMemoryDb();
}
