# HEXACALL - Portal de Acceso Interno

Frontend en React + Vite con autenticación y datos en Firestore.

## Requisitos

- Node.js (v18+)
- npm
- Cuenta Firebase con Firestore habilitado
- Usuario en Firebase Authentication (admin@admin.com / 123456)

## Instalación rápida

1. Instala dependencias:
   npm install

2. Configura Firebase (ver sección abajo)

3. Inicia el servidor:
   npm run dev

4. Abre http://localhost:3001 en el navegador

## Configuración de Firebase

### Paso 1: Obtén tus credenciales de Firebase

1. Ve a Firebase Console: https://console.firebase.google.com
2. Selecciona tu proyecto
3. Haz clic en Configuración del proyecto
4. Ve a la pestaña "Tus aplicaciones" y selecciona la app web
5. Copia la información en "Firebase SDK snippet"

### Paso 2: Crea el archivo .env

Copia el archivo .env.example y renómbralo a .env:

cp .env.example .env

Luego reemplaza los valores:

| Variable | Valor |
|----------|-------|
| VITE_FIREBASE_API_KEY | apiKey del SDK |
| VITE_FIREBASE_AUTH_DOMAIN | authDomain del SDK |
| VITE_FIREBASE_PROJECT_ID | projectId del SDK |
| VITE_FIREBASE_STORAGE_BUCKET | storageBucket del SDK |
| VITE_FIREBASE_MESSAGING_SENDER_ID | messagingSenderId del SDK |
| VITE_FIREBASE_APP_ID | appId del SDK |

Ejemplo:
VITE_FIREBASE_API_KEY=AIzaSyDXs0hK1yM2nOpQrS3tUvWxYz...
VITE_FIREBASE_AUTH_DOMAIN=myproject.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=myproject
VITE_FIREBASE_STORAGE_BUCKET=myproject.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123456789:web:abcd1234ef56...

IMPORTANTE: El archivo .env está en .gitignore y NO se sube al repositorio.

### Paso 3: Crea un usuario de prueba en Firebase Auth

1. Firebase Console → Authentication → Users
2. Haz clic en "Create user"
3. Email: admin@admin.com
4. Password: 123456
5. Haz clic en "Create"

### Paso 4: Configura Firestore Security Rules

1. Firebase Console → Firestore Database → Rules
2. Copia las reglas de FIRESTORE_RULES.md
3. Haz clic en "Publish"

Sin estas reglas, tu Firestore estará expuesto públicamente.

## Credenciales de prueba

Email: admin@admin.com
Contraseña: 123456

## Verificación

- El frontend debe abrir en http://localhost:3001
- Al login, debe mostrar "Firestore activo" en el dashboard
- Los datos se guardan en Firestore

## Estructura del proyecto

src/
├── context/        AuthContext (Firebase Auth)
├── services/       firestore.ts (CRUD operations)
├── componentes/    React components (Dashboard, Login, etc)
└── utils.ts        Storage helpers

## Archivos importantes para el docente

.env: Ignorado por Git (contiene credenciales reales)
.env.example: En el repositorio como plantilla
FIRESTORE_RULES.md: Reglas de seguridad para Firestore
Firebase Auth + Firestore: Todo configurado en el cliente

Solo se necesita Node.js + npm. No se requiere Java ni servidor backend.
