import dotenv from 'dotenv';
import { MongoClient } from 'mongodb';

dotenv.config();

const uri = process.env.MONGODB_URI || process.env.MONGO_URI;
const dbName = process.env.MONGODB_DB || process.env.MONGO_DB || 'hexacall';

if (!uri) {
  throw new Error('No se encontró la URI de MongoDB. Define MONGODB_URI o MONGO_URI en tu archivo .env');
}

let clienteMongo = null;
let baseDatos = null;

export async function getDb() {
  if (baseDatos) {
    return baseDatos;
  }

  clienteMongo = new MongoClient(uri);
  await clienteMongo.connect();
  baseDatos = clienteMongo.db(dbName);
  return baseDatos;
}
