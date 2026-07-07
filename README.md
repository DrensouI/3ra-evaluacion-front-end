# HEXACALL - Portal de Acceso Interno

Frontend en React + Vite con autenticación y datos en Firestore.

## Requisitos

- **Node.js** (v18+)
- **npm**
- **Cuenta Firebase** con Firestore habilitado
- **Usuario en Firebase Authentication** (`admin@admin.com` / `123456`)

## Instalación rápida

1. **Instala dependencias**:
   ```bash
   npm install
   ```

2. **Crea `.env`** en la raíz (usa `.env.example` como plantilla):
   ```env
   VITE_FIREBASE_API_KEY=tu_api_key
   VITE_FIREBASE_AUTH_DOMAIN=tu_project.firebaseapp.com
   VITE_FIREBASE_PROJECT_ID=tu_project_id
   VITE_FIREBASE_STORAGE_BUCKET=tu_project.appspot.com
   VITE_FIREBASE_MESSAGING_SENDER_ID=tu_messaging_sender_id
   VITE_FIREBASE_APP_ID=tu_app_id
   ```

3. **Inicia el servidor**:
   ```bash
   npm run dev
   ```

4. **Abre** `http://localhost:3001` en el navegador

## Credenciales de prueba

- **Email**: `admin@admin.com`
- **Contraseña**: `123456`

## Verificación

- El frontend debe abrir en `http://localhost:3001`
- Al login, debe mostrar "**Firestore activo**" en el dashboard
- Los datos se guardan en Firestore (obras, personal, reportes)

## Seguridad - Firestore Rules

**IMPORTANTE**: Debes configurar las reglas de seguridad en Firestore:

1. Ve a **Firebase Console** → **Firestore** → **Rules**
2. Copia las reglas de [FIRESTORE_RULES.md](./FIRESTORE_RULES.md)
3. Publica las reglas

Sin esto, tu Firestore estará **expuesto públicamente**.

## Estructura de carpetas

```
src/
├── context/        # AuthContext (Firebase Auth)
├── services/       # firestore.ts (CRUD operations)
├── componentes/    # React components (Dashboard, Login, etc)
└── utils.ts        # Storage helpers
```

## Nota

Este es un **frontend puro** que usa Firebase:
- ✅ Autenticación con Firebase Auth
- ✅ Datos en Firestore
- ❌ No requiere backend Express

Si necesitas el backend (Express + Admin SDK) para otras funcionalidades, contacta al administrador.


El equipo de la universidad solo necesita CMD y Node.js. No es necesario instalar Java. Si ya tienes Node.js y npm, solo corre `npm install`, `npm run server` y `npm run dev`.
