import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { autenticarAdministrador } from './server/models/usuario.js';
import { getDb } from './server/db.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = process.env.PORT || 4000;

app.use(cors({ origin: true }));
app.use(express.json());
app.use(express.static(path.join(__dirname, 'dist')));

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

    return res.json(sesion);
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
  if (!empleado || !empleado.id) {
    return res.status(400).json({ error: 'Datos de empleado inválidos.' });
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
  if (!obra || !obra.id) {
    return res.status(400).json({ error: 'Datos de obra inválidos.' });
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
