import express from 'express';
import cors from 'cors';
import { MongoClient } from 'mongodb';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = process.env.PORT || 4000;
const mongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017';
const dbName = process.env.MONGO_DB || 'hexacall_db';

// Log connection info (mask credentials) for debugging
try {
  const safe = typeof mongoUri === 'string' ? mongoUri.replace(/:(?:[^:@]+)@/, ':*****@') : mongoUri;
  import express from 'express';
  import path from 'path';
  import { fileURLToPath } from 'url';

  const __filename = fileURLToPath(import.meta.url);
  const __dirname = path.dirname(__filename);

  const app = express();
  const port = process.env.PORT || 4000;

  app.use(express.json());
  app.use(express.static(path.join(__dirname, 'dist')));

  app.get('/api/ping', (req, res) => {
    res.json({ ok: true });
  });

  app.listen(port, () => {
    console.log(`API server running on http://localhost:${port}`);
  });
app.use(cors({ origin: true }));
