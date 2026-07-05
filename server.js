import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { autenticarAdministrador } from './server/models/usuario.js';

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

app.listen(port, () => {
  console.log(`API server running on http://localhost:${port}`);
});
