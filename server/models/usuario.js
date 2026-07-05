import dotenv from 'dotenv';
import { MongoClient } from 'mongodb';

dotenv.config();

const ADMINISTRADORES = [
  {
    correo: 'admin@admin.com',
    clave: '123456',
    nombre: 'Administrador Hexacall',
    rol: 'administrador',
  },
];

let clienteMongo = null;
let baseDatos = null;

async function conectarMongo() {
  if (baseDatos) {
    return baseDatos;
  }

  const uri = process.env.MONGODB_URI || process.env.MONGO_URI;
  const nombreBD = process.env.MONGODB_DB || process.env.MONGO_DB || 'hexacall';

  if (!uri) {
    throw new Error('No se encontró la URI de MongoDB. Define MONGODB_URI o MONGO_URI en tu archivo .env');
  }

  clienteMongo = new MongoClient(uri);
  await clienteMongo.connect();
  baseDatos = clienteMongo.db(nombreBD);

  await seedAdministrador(baseDatos);
  return baseDatos;
}

async function seedAdministrador(db) {
  const coleccion = db.collection('usuarios');
  const correoAdmin = ADMINISTRADORES[0].correo.toLowerCase();

  const usuarioExistente = await coleccion.findOne({
    correo: { $regex: new RegExp(`^${escaparRegex(correoAdmin)}$`, 'i') },
  });

  if (!usuarioExistente) {
    await coleccion.insertOne({
      correo: ADMINISTRADORES[0].correo,
      clave: ADMINISTRADORES[0].clave,
      nombre: ADMINISTRADORES[0].nombre,
      rol: ADMINISTRADORES[0].rol,
      creadoEn: new Date(),
    });
    console.log('Usuario administrador inicial creado en MongoDB:', ADMINISTRADORES[0].correo);
  }
}

function escaparRegex(texto) {
  return texto.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

export async function autenticarAdministrador(correo, clave) {
  const emailNormalizado = (correo || '').trim().toLowerCase();

  try {
    const db = await conectarMongo();
    const usuario = await db.collection('usuarios').findOne({
      correo: { $regex: new RegExp(`^${escaparRegex(emailNormalizado)}$`, 'i') },
      clave,
    });

    if (usuario) {
      return {
        correo: usuario.correo,
        nombre: usuario.nombre,
        rol: usuario.rol,
      };
    }
  } catch (error) {
    console.warn('No se pudo autenticar contra MongoDB:', error.message);
  }

  const usuarioLocal = ADMINISTRADORES.find(
    u => u.correo.toLowerCase() === emailNormalizado && u.clave === clave,
  );

  if (!usuarioLocal) {
    return null;
  }

  return {
    correo: usuarioLocal.correo,
    nombre: usuarioLocal.nombre,
    rol: usuarioLocal.rol,
  };
}
