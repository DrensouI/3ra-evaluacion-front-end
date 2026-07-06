import dotenv from 'dotenv';
import { getDb } from '../db.js';

dotenv.config();

const ADMINISTRADORES = [
  {
    correo: 'admin@admin.com',
    clave: '123456',
    nombre: 'Administrador Hexacall',
    rol: 'administrador',
  },
];

async function seedAdministrador(db) {
  const coleccion = db.collection('usuarios');
  const correoAdmin = ADMINISTRADORES[0].correo.toLowerCase();

  const usuarioExistente = await coleccion.findOne({ correo: correoAdmin });

  if (!usuarioExistente) {
    await coleccion.insertOne({
      correo: correoAdmin,
      clave: ADMINISTRADORES[0].clave,
      nombre: ADMINISTRADORES[0].nombre,
      rol: ADMINISTRADORES[0].rol,
      creadoEn: new Date(),
    });
    console.log('Usuario administrador inicial creado en Firebase:', ADMINISTRADORES[0].correo);
  }
}

export async function autenticarAdministrador(correo, clave) {
  const emailNormalizado = (correo || '').trim().toLowerCase();

  try {
    const db = await getDb();
    await seedAdministrador(db);
    const usuario = await db.collection('usuarios').findOne({ correo: emailNormalizado, clave });

    if (usuario) {
      return {
        correo: usuario.correo,
        nombre: usuario.nombre,
        rol: usuario.rol,
      };
    }
  } catch (error) {
    console.warn('No se pudo autenticar contra Firestore:', error.message);
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
