import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import jwt from 'jsonwebtoken';
import { autenticarAdministrador } from './server/models/usuario.js';
import { getDb } from './server/db.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = process.env.PORT || 4000;
const jwtSecret = process.env.JWT_SECRET || 'hexacall_jwt_secret';
const jwtExpiresIn = process.env.JWT_EXPIRES_IN || '1h';

function generarToken(payload) {
  return jwt.sign(payload, jwtSecret, { expiresIn: jwtExpiresIn });
}

function autenticarToken(req, res, next) {
  const authHeader = req.headers.authorization || '';
  if (!authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Token de autorización faltante o inválido.' });
  }

  const token = authHeader.slice(7);
  try {
    req.user = jwt.verify(token, jwtSecret);
    return next();
  } catch (error) {
    console.error('Token inválido:', error.message);
    return res.status(401).json({ error: 'Token inválido o expirado.' });
  }
}

function esTextoValido(valor) {
  return typeof valor === 'string' && valor.trim().length > 0;
}

function esCorreoValido(correo) {
  return typeof correo === 'string' && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correo.trim());
}

function esFechaValida(fecha) {
  if (typeof fecha !== 'string') return false;
  const fechaObj = new Date(fecha);
  return !Number.isNaN(fechaObj.getTime()) && fecha === fechaObj.toISOString().slice(0, 10);
}

function validarObra(obra) {
  if (!obra || typeof obra !== 'object') return 'Datos de obra inválidos.';
  if (!obra.id || typeof obra.id !== 'string') return 'ID de obra inválido.';
  if (!esTextoValido(obra.nombre) || obra.nombre.trim().length < 5 || obra.nombre.trim().length > 100) return 'Nombre de obra inválido.';
  const estadosValidos = ['en curso', 'pausada', 'finalizada'];
  if (!estadosValidos.includes(obra.estado)) return 'Estado de obra inválido.';
  if (obra.ubicacion && (typeof obra.ubicacion !== 'string' || obra.ubicacion.trim().length < 5)) return 'Ubicación inválida.';
  if (obra.presupuesto !== undefined && obra.presupuesto !== null) {
    if (typeof obra.presupuesto !== 'number' || obra.presupuesto < 0 || obra.presupuesto > 1000000000) return 'Presupuesto inválido.';
  }
  return null;
}

function validarPersonal(empleado) {
  if (!empleado || typeof empleado !== 'object') return 'Datos de empleado inválidos.';
  if (!empleado.id || typeof empleado.id !== 'string') return 'ID de empleado inválido.';
  if (!esTextoValido(empleado.nombre) || empleado.nombre.trim().length < 5 || empleado.nombre.trim().length > 100) return 'Nombre de empleado inválido.';
  if (!esTextoValido(empleado.cargo) || empleado.cargo.trim().length < 3) return 'Cargo de empleado inválido.';
  if (!empleado.obraId || typeof empleado.obraId !== 'string') return 'Obra asignada inválida.';
  return null;
}

function validarReporte(reporte) {
  if (!reporte || typeof reporte !== 'object') return 'Datos de reporte inválidos.';
  if (!reporte.id || typeof reporte.id !== 'string') return 'ID de reporte inválido.';
  if (!reporte.obraId || typeof reporte.obraId !== 'string') return 'Obra asignada inválida.';
  if (!esFechaValida(reporte.fecha)) return 'Fecha de reporte inválida.';
  const hoy = new Date().toISOString().slice(0, 10);
  if (reporte.fecha > hoy) return 'La fecha del reporte no puede ser futura.';
  if (!esTextoValido(reporte.descripcion) || reporte.descripcion.trim().length < 10 || reporte.descripcion.trim().length > 500) return 'Descripción del reporte inválida.';
  return null;
}

function validarArreglo(items, validador) {
  if (!Array.isArray(items)) return 'Payload inválido.';
  for (const item of items) {
    const error = validador(item);
    if (error) return error;
  }
  return null;
}

app.use(cors({ origin: true }));
app.use(express.json());
app.use(express.static(path.join(__dirname, 'dist')));
app.use('/api/obras', autenticarToken);
app.use('/api/personal', autenticarToken);
app.use('/api/reportes', autenticarToken);
app.use('/api/migrate', autenticarToken);

app.post('/api/auth/login', async (req, res) => {
  const { correo, clave } = req.body;

  if (!correo || !clave) {
    return res.status(400).json({ error: 'Correo y contraseña son obligatorios.' });
  }

  try {
    const usuario = await autenticarAdministrador(correo, clave);
    if (!usuario) {
      return res.status(401).json({ error: 'Credenciales inválidas.' });
    }

    const sesion = {
      correo: usuario.correo,
      nombre: usuario.nombre,
      rol: usuario.rol,
      ultimoAcceso: new Date().toISOString(),
    };
    const token = generarToken({ correo: usuario.correo, nombre: usuario.nombre, rol: usuario.rol });

    return res.json({ token, usuario: sesion });
  } catch (error) {
    console.error('Error autenticación:', error);
    return res.status(500).json({ error: 'Error interno al autenticar.', detalle: error.message });
  }
});

app.get('/api/ping', (req, res) => {
  res.json({ ok: true });
});

app.get('/api/personal', async (req, res) => {
  try {
    const db = await getDb();
    const personal = await db.collection('empleados').find().toArray();
    return res.json(personal);
  } catch (error) {
    console.error('Error al obtener personal:', error);
    return res.status(500).json({ error: 'Error al obtener personal.' });
  }
});

app.put('/api/personal', async (req, res) => {
  const personal = Array.isArray(req.body) ? req.body : [];
  const errorValidacion = validarArreglo(personal, validarPersonal);
  if (errorValidacion) {
    return res.status(400).json({ error: errorValidacion });
  }
  try {
    const db = await getDb();
    const coleccion = db.collection('empleados');
    await coleccion.deleteMany({});
    if (personal.length > 0) {
      await coleccion.insertMany(personal);
    }
    return res.status(204).end();
  } catch (error) {
    console.error('Error al guardar personal:', error);
    return res.status(500).json({ error: 'Error al guardar personal.' });
  }
});

app.post('/api/personal', async (req, res) => {
  const empleado = req.body;
  const errorValidacion = validarPersonal(empleado);
  if (errorValidacion) {
    return res.status(400).json({ error: errorValidacion });
  }

  try {
    const db = await getDb();
    await db.collection('empleados').insertOne(empleado);
    return res.status(201).json(empleado);
  } catch (error) {
    console.error('Error al crear empleado:', error);
    return res.status(500).json({ error: 'Error al crear empleado.' });
  }
});

app.put('/api/personal/:id', async (req, res) => {
  const { id } = req.params;
  const cambios = req.body;
  const empleado = { id, ...cambios };
  const errorValidacion = validarPersonal(empleado);
  if (errorValidacion) {
    return res.status(400).json({ error: errorValidacion });
  }

  try {
    const db = await getDb();
    const resultado = await db.collection('empleados').findOneAndUpdate(
      { id },
      { $set: cambios },
      { returnDocument: 'after' },
    );

    if (!resultado.value) {
      return res.status(404).json({ error: 'Empleado no encontrado.' });
    }

    return res.json(resultado.value);
  } catch (error) {
    console.error('Error al actualizar empleado:', error);
    return res.status(500).json({ error: 'Error al actualizar empleado.' });
  }
});

app.delete('/api/personal/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const db = await getDb();
    const resultado = await db.collection('empleados').deleteOne({ id });
    if (resultado.deletedCount === 0) {
      return res.status(404).json({ error: 'Empleado no encontrado.' });
    }
    return res.status(204).end();
  } catch (error) {
    console.error('Error al eliminar empleado:', error);
    return res.status(500).json({ error: 'Error al eliminar empleado.' });
  }
});

app.get('/api/obras', async (req, res) => {
  try {
    const db = await getDb();
    const obras = await db.collection('obras').find().toArray();
    return res.json(obras);
  } catch (error) {
    console.error('Error al obtener obras:', error);
    return res.status(500).json({ error: 'Error al obtener obras.' });
  }
});

app.put('/api/obras', async (req, res) => {
  const obras = Array.isArray(req.body) ? req.body : [];
  const errorValidacion = validarArreglo(obras, validarObra);
  if (errorValidacion) {
    return res.status(400).json({ error: errorValidacion });
  }
  try {
    const db = await getDb();
    const coleccion = db.collection('obras');
    await coleccion.deleteMany({});
    if (obras.length > 0) {
      await coleccion.insertMany(obras);
    }
    return res.status(204).end();
  } catch (error) {
    console.error('Error al guardar obras:', error);
    return res.status(500).json({ error: 'Error al guardar obras.' });
  }
});

app.get('/api/obras/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const db = await getDb();
    const obra = await db.collection('obras').findOne({ id });
    if (!obra) {
      return res.status(404).json({ error: 'Obra no encontrada.' });
    }
    return res.json(obra);
  } catch (error) {
    console.error('Error al obtener obra:', error);
    return res.status(500).json({ error: 'Error al obtener obra.' });
  }
});

app.post('/api/obras', async (req, res) => {
  const obra = req.body;
  const errorValidacion = validarObra(obra);
  if (errorValidacion) {
    return res.status(400).json({ error: errorValidacion });
  }

  try {
    const db = await getDb();
    await db.collection('obras').insertOne(obra);
    return res.status(201).json(obra);
  } catch (error) {
    console.error('Error al crear obra:', error);
    return res.status(500).json({ error: 'Error al crear obra.' });
  }
});

app.put('/api/obras/:id', async (req, res) => {
  const { id } = req.params;
  const cambios = req.body;
  const obra = { id, ...cambios };
  const errorValidacion = validarObra(obra);
  if (errorValidacion) {
    return res.status(400).json({ error: errorValidacion });
  }

  try {
    const db = await getDb();
    const resultado = await db.collection('obras').findOneAndUpdate(
      { id },
      { $set: cambios },
      { returnDocument: 'after' },
    );

    if (!resultado.value) {
      return res.status(404).json({ error: 'Obra no encontrada.' });
    }

    return res.json(resultado.value);
  } catch (error) {
    console.error('Error al actualizar obra:', error);
    return res.status(500).json({ error: 'Error al actualizar obra.' });
  }
});

app.delete('/api/obras/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const db = await getDb();
    const resultado = await db.collection('obras').deleteOne({ id });
    if (resultado.deletedCount === 0) {
      return res.status(404).json({ error: 'Obra no encontrada.' });
    }
    return res.status(204).end();
  } catch (error) {
    console.error('Error al eliminar obra:', error);
    return res.status(500).json({ error: 'Error al eliminar obra.' });
  }
});

// Reportes CRUD
app.get('/api/reportes', async (req, res) => {
  try {
    const db = await getDb();
    const reportes = await db.collection('reportes').find().toArray();
    return res.json(reportes);
  } catch (error) {
    console.error('Error al obtener reportes:', error);
    return res.status(500).json({ error: 'Error al obtener reportes.' });
  }
});

app.put('/api/reportes', async (req, res) => {
  const reportes = Array.isArray(req.body) ? req.body : [];
  const errorValidacion = validarArreglo(reportes, validarReporte);
  if (errorValidacion) {
    return res.status(400).json({ error: errorValidacion });
  }
  try {
    const db = await getDb();
    const coleccion = db.collection('reportes');
    await coleccion.deleteMany({});
    if (reportes.length > 0) {
      await coleccion.insertMany(reportes);
    }
    return res.status(204).end();
  } catch (error) {
    console.error('Error al guardar reportes:', error);
    return res.status(500).json({ error: 'Error al guardar reportes.' });
  }
});

app.post('/api/reportes', async (req, res) => {
  const reporte = req.body;
  const errorValidacion = validarReporte(reporte);
  if (errorValidacion) {
    return res.status(400).json({ error: errorValidacion });
  }

  try {
    const db = await getDb();
    await db.collection('reportes').insertOne(reporte);
    return res.status(201).json(reporte);
  } catch (error) {
    console.error('Error al crear reporte:', error);
    return res.status(500).json({ error: 'Error al crear reporte.' });
  }
});

app.put('/api/reportes/:id', async (req, res) => {
  const { id } = req.params;
  const cambios = req.body;
  const reporte = { id, ...cambios };
  const errorValidacion = validarReporte(reporte);
  if (errorValidacion) {
    return res.status(400).json({ error: errorValidacion });
  }

  try {
    const db = await getDb();
    const resultado = await db.collection('reportes').findOneAndUpdate(
      { id },
      { $set: cambios },
      { returnDocument: 'after' },
    );

    if (!resultado.value) {
      return res.status(404).json({ error: 'Reporte no encontrado.' });
    }

    return res.json(resultado.value);
  } catch (error) {
    console.error('Error al actualizar reporte:', error);
    return res.status(500).json({ error: 'Error al actualizar reporte.' });
  }
});

app.delete('/api/reportes/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const db = await getDb();
    const resultado = await db.collection('reportes').deleteOne({ id });
    if (resultado.deletedCount === 0) {
      return res.status(404).json({ error: 'Reporte no encontrado.' });
    }
    return res.status(204).end();
  } catch (error) {
    console.error('Error al eliminar reporte:', error);
    return res.status(500).json({ error: 'Error al eliminar reporte.' });
  }
});

app.post('/api/migrate', async (req, res) => {
  const { obras, personal, reportes } = req.body;

  if (!Array.isArray(obras) || !Array.isArray(personal) || !Array.isArray(reportes)) {
    return res.status(400).json({ error: 'Payload de migración inválido.' });
  }

  try {
    const db = await getDb();
    await Promise.all([
      db.collection('obras').deleteMany({}),
      db.collection('empleados').deleteMany({}),
      db.collection('reportes').deleteMany({}),
    ]);

    await Promise.all([
      obras.length ? db.collection('obras').insertMany(obras) : Promise.resolve(),
      personal.length ? db.collection('empleados').insertMany(personal) : Promise.resolve(),
      reportes.length ? db.collection('reportes').insertMany(reportes) : Promise.resolve(),
    ]);

    return res.status(200).json({ ok: true });
  } catch (error) {
    console.error('Error al migrar datos a MongoDB:', error);
    return res.status(500).json({ error: 'Error al migrar datos a MongoDB.' });
  }
});

app.listen(port, () => {
  console.log(`API server running on http://localhost:${port}`);
});
