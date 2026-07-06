import dotenv from 'dotenv';
import admin from 'firebase-admin';

dotenv.config();

let firestoreDb = null;

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

  if (!admin.apps.length) {
    const credentials = buildServiceAccount();
    const projectId = process.env.FIREBASE_PROJECT_ID || 'hexacall';

    if (isRealServiceAccount(credentials)) {
      admin.initializeApp({
        credential: admin.credential.cert(credentials),
        projectId: credentials.project_id,
      });
    } else if (process.env.FIREBASE_EMULATOR_HOST) {
      admin.initializeApp({ projectId });
    } else if (process.env.GOOGLE_APPLICATION_CREDENTIALS || process.env.FIREBASE_PROJECT_ID) {
      admin.initializeApp({ projectId });
    } else {
      throw new Error('No se encontró la configuración de Firebase. Define FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL y FIREBASE_PRIVATE_KEY en tu archivo .env o usa FIREBASE_EMULATOR_HOST.');
    }
  }

  firestoreDb = admin.firestore();

  if (process.env.FIREBASE_EMULATOR_HOST) {
    firestoreDb.settings({
      host: process.env.FIREBASE_EMULATOR_HOST,
      ssl: false,
    });
  }

  return createCollectionAdapter(firestoreDb);
}
