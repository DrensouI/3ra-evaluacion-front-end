# Firestore Security Rules

## Descripción

Estas reglas configuran la seguridad de Firestore para la aplicación Hexacall. Se requiere autenticación de Firebase para cualquier acceso a los datos.

## Instalación

1. Abre [Firebase Console](https://console.firebase.google.com)
2. Ve a tu proyecto → **Firestore Database** → **Rules**
3. Reemplaza el contenido con las reglas siguientes
4. Haz clic en **Publish**

## Reglas de Seguridad

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Permitir solo a usuarios autenticados
    match /obras/{document=**} {
      allow read, write: if request.auth != null;
    }
    
    match /personal/{document=**} {
      allow read, write: if request.auth != null;
    }
    
    match /reportes/{document=**} {
      allow read, write: if request.auth != null;
    }
    
    match /usuarios/{document=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```

## Explicación de las Reglas

### Autenticación Requerida
```javascript
if request.auth != null
```
- Solo usuarios con sesión activa en Firebase Auth pueden leer o escribir.
- Rechaza automáticamente peticiones sin autenticación.

### Colecciones Protegidas
- **`obras`**: Datos de proyectos civiles (nombre, estado, ubicación, presupuesto)
- **`personal`**: Datos de operarios (nombre, cargo, obraId)
- **`reportes`**: Bitácoras diarias (descripción, fecha, obraId)
- **`usuarios`**: Datos de administradores (correo, nombre, rol)

## Validaciones de Datos (Opcional)

Si necesitas validaciones más estrictas en la base de datos, puedes ampliar las reglas:

```javascript
match /obras/{obraId} {
  allow create: if request.auth != null 
    && request.resource.data.nombre is string
    && request.resource.data.nombre.size() >= 5
    && request.resource.data.estado in ['en curso', 'pausada', 'finalizada']
    && request.resource.data.presupuesto is number
    && request.resource.data.presupuesto >= 0;
    
  allow update: if request.auth != null;
  
  allow delete: if request.auth != null;
  
  allow read: if request.auth != null;
}
```

## Verificación

Después de publicar las reglas, prueba con:

1. **Usuario no autenticado**: Debe recibir error `Permission denied`.
2. **Usuario autenticado**: Debe poder leer/escribir en las colecciones.

En la consola de Firestore:
```
// Esto fallará (sin autenticación)
db.collection('obras').get()

// Esto funciona (con sesión Firebase activa)
obtenerObras() // desde src/services/firestore.ts
```

## Roles y Permisos Futuros

Para implementar control de acceso basado en roles:

```javascript
match /obras/{obraId} {
  // Solo admin puede escribir
  allow write: if request.auth != null 
    && get(/databases/$(database)/documents/usuarios/$(request.auth.uid)).data.rol == 'administrador';
  
  // Todos los autenticados pueden leer
  allow read: if request.auth != null;
}
```

## Recursos

- [Documentación oficial de Firestore Security](https://firebase.google.com/docs/firestore/security/start)
- [Simulador de reglas](https://firebase.google.com/docs/firestore/security/test-rules-emulator)
