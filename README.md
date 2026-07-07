Instrucciones de ejecución

Este proyecto usa React/Vite en el frontend y Express + Firebase Admin en el backend. Los datos se guardan en Firestore.

 Requisitos mínimos

- Node.js instalado.
- npm disponible.
- Cuenta de Firebase con Firestore habilitado.
- Service account de Firebase para el backend.

Configuración del proyecto

1. Crea un archivo `.env` en la raíz del proyecto.
2. Copia las variables desde `.env.example` y reemplaza los valores de Firebase por los tuyos.

# Variables principales para el frontend
VITE_FIREBASE_API_KEY=tu_api_key
VITE_FIREBASE_AUTH_DOMAIN=tu_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=tu_project_id
VITE_FIREBASE_STORAGE_BUCKET=tu_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=tu_messaging_sender_id
VITE_FIREBASE_APP_ID=tu_app_id

# Variables opcionales si usas el servidor Express + Firebase Admin
# FIREBASE_PROJECT_ID=tu_project_id
# FIREBASE_CLIENT_EMAIL=tu_service_account@tu_project_id.iam.gserviceaccount.com
# FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nTU_PRIVATE_KEY\n-----END PRIVATE KEY-----\n"
# JWT_SECRET=una_clave_muy_segura
# JWT_EXPIRES_IN=1h


Origen de cada valor

- `FIREBASE_PROJECT_ID`: lo obtienes desde Firebase Console, en el panel principal del proyecto.
- `VITE_FIREBASE_AUTH_DOMAIN`: formato `tu_project.firebaseapp.com`.
- `VITE_FIREBASE_STORAGE_BUCKET`: formato `tu_project.appspot.com`.
- `VITE_FIREBASE_MESSAGING_SENDER_ID`: lo obtienes en la configuración de Firebase.
- `VITE_FIREBASE_APP_ID`: lo obtienes en la configuración de Firebase.
- `FIREBASE_PROJECT_ID`, `FIREBASE_CLIENT_EMAIL`, `FIREBASE_PRIVATE_KEY`: se usan solo si ejecutas el backend Express con Firebase Admin.
- `JWT_SECRET` y `JWT_EXPIRES_IN`: solo necesarios para el backend Express.



 Instalación y ejecución en CMD

Desde la carpeta del proyecto en CMD ejecuta:


npm install


Luego inicia el backend:


npm run server


En otra ventana de CMD inicia el frontend:


npm run dev


Abre el navegador en:


http://localhost:3001


Flujo mínimo

1. Poner en `.env` los datos reales de Firebase.
2. Ejecutar `npm install`.
3. Ejecutar `npm run server`.
4. Ejecutar `npm run dev`.
5. Abrir `http://localhost:3001`.

Verificación

- El backend debe mostrar `API server running on http://localhost:4000`.
- El frontend debe abrir en `http://localhost:3001`.
- Inicia sesión y verifica que los datos se guardan en Firestore.

Credenciales de prueba

- Correo: `admin@admin.com`
- Contraseña: `123456`

 Nota

El equipo de la universidad solo necesita CMD y Node.js. No es necesario instalar Java. Si ya tienes Node.js y npm, solo corre `npm install`, `npm run server` y `npm run dev`.
