# Preparación beta para Firebase Hosting — `fir-chae-projects`

Este documento describe el estado preparado para publicar la beta en Firebase Hosting. No incluye credenciales privadas ni ejecuta despliegues.

## 1. Hallazgos de la auditoría

| Hallazgo | Estado |
| :--- | :--- |
| `src/environments/firebase-config.ts` estaba ignorado por Git y no existía en un clone limpio. La compilación fallaba por el import de los entornos. | Corregido: se versiona la configuración web pública y se documenta que no es secreta. |
| No existía `.firebaserc`; los comandos de Firebase dependían de selección interactiva. | Corregido: `.firebaserc` fija `fir-chae-projects` como proyecto por defecto. |
| `npm run build` dependía del `defaultConfiguration` de Angular en lugar de declarar explícitamente producción. | Corregido: `build` y `build:production` usan `--configuration production`. |
| El entorno de desarrollo tenía `useEmulators: false`, por lo que `ng serve` podía apuntar al proyecto real. | Corregido: desarrollo usa emuladores por defecto; producción los desactiva. |
| Hosting no definía cabeceras de seguridad ni política de caché. | Corregido en `firebase.json`. |
| No se pudo verificar desde el repositorio la configuración de la consola Firebase (dominios autorizados, restricciones de API key, estado de Functions). | Queda como checklist manual obligatoria en este documento. |

No se encontraron claves de cuenta de servicio, bloques `BEGIN PRIVATE KEY`, tokens de administrador ni archivos `.env` versionados en el historial revisado. La API key presente corresponde a la configuración web pública del SDK; por sí sola no otorga privilegios administrativos, pero debe restringirse en Google Cloud Console.

## 2. Configuración versionada

### 2.1 Proyecto y entornos

- Proyecto Firebase: `fir-chae-projects`.
- Proyecto por defecto: `.firebaserc`.
- Configuración web pública: `src/environments/firebase-config.ts`.
- Desarrollo: `src/environments/environment.ts` con emuladores activados.
- Producción: `src/environments/environment.production.ts` con emuladores desactivados y sin hosts locales.
- Angular aplica la sustitución de archivos mediante `fileReplacements` en `angular.json`.

No se requieren variables de entorno para compilar o ejecutar el frontend. `.env.example` documenta únicamente variables locales usadas por el script opcional de bootstrap de administrador; ese archivo no es leído por Angular ni por Hosting.

### 2.2 Salida y reescrituras

- Directorio publicado: `dist/fundacion-regalando-sonrisas/browser`.
- Esta ruta coincide con la salida real del builder `@angular/build:application`.
- SPA rewrite: `** → /index.html`, necesario para recargas directas de rutas como `/login`, `/terminos-y-condiciones` o `/admin`.
- `base href="/"` permite resolver recursos absolutos desde cualquier ruta.

### 2.3 Cabeceras y caché

`firebase.json` aplica:

- `X-Content-Type-Options: nosniff`
- `X-Frame-Options: SAMEORIGIN`
- `Referrer-Policy: strict-origin-when-cross-origin`
- `Permissions-Policy` sin cámara, micrófono ni geolocalización.
- `index.html`: `no-store, max-age=0` para evitar servir una versión obsoleta del shell.
- JS/CSS con hash: caché inmutable de un año.
- Imágenes y fuentes: caché de un día.

No se añade una CSP estricta sin validación previa porque la aplicación carga fuentes de Google y depende de flujos del SDK de Firebase; una CSP incorrecta rompería el inicio de sesión. Firebase Hosting ya proporciona HTTPS/HSTS en sus dominios predeterminados.

## 3. Compilación y despliegue

```bash
npm ci
npm run build:production
npm test -- --watch=false
npm run lint
```

Para desplegar solo Hosting:

```bash
npm run deploy:hosting
```

`firebase.json` define un `predeploy` de Hosting que ejecuta `npm run build:production`, de modo que no se publique un `dist` obsoleto. El despliegue no se ejecutó como parte de esta preparación.

Las reglas se publican por separado:

```bash
npm run deploy:firestore-rules
```

No usar `npm run deploy` sin restricciones: ese comando puede incluir otros recursos. Para la beta usar siempre comandos específicos.

Cloud Functions están implementadas en el repositorio, pero este proceso no las despliega. Su estado real debe verificarse en Firebase Console. Si se despliegan más adelante:

```bash
npm --prefix functions run build
firebase deploy --only functions
```

Son necesarias para sincronizar Custom Claims tras cambios de rol/estado. Sin ese backend, un usuario promovido desde `/admin` puede quedar con claims desactualizados hasta una resincronización manual con Admin SDK.

## 4. Checklist manual en Firebase Console

Antes de la prueba beta:

1. **Authentication → Sign-in method**: habilitar `Correo electrónico/contraseña`.
2. **Authentication → Settings → Authorized domains**: agregar
   - `fir-chae-projects.web.app`
   - `fir-chae-projects.firebaseapp.com`
   - `localhost` solo para desarrollo
   - cualquier dominio personalizado que se vaya a usar.
3. **Authentication → Settings → User actions**: revisar la protección contra enumeración de usuarios y las plantillas de correo de restablecimiento; la URL de la acción debe apuntar al dominio de Hosting autorizado.
4. **Google Cloud Console → APIs & Services → Credentials**: restringir la API key web por referenciadores HTTP a los dominios anteriores y limitar las APIs permitidas a las que usa el proyecto (Authentication/Identity Toolkit, Firestore, Functions y Storage si se habilita).
5. **Firestore/Storage**: verificar que las reglas publicadas sean las del repositorio. No existen reglas `allow read, write: if true`.
6. **Hosting**: confirmar que el sitio activo es el proyecto `fir-chae-projects`.

## 5. Pruebas funcionales posteriores al despliegue

- Navegación directa a `/`, `/login`, `/register`, `/pending`, `/terminos-y-condiciones` y `/politica-de-privacidad` sin 404.
- Recarga directa de `/admin`: debe redirigir a `/login` si no hay sesión aprobada.
- Registro con casillas sin marcar: debe bloquearse.
- Registro completo: se crea la cuenta, la evidencia legal y el perfil `pending`.
- Inicio y cierre de sesión; la sesión debe persistir al recargar.
- Recuperación de contraseña desde `/login`.
- Cuenta normal sin acceso a módulos administrativos.
- Administrador aprobado con claims vigentes: acceso a `/dashboard` y módulos.

## 6. Seguridad de credenciales

- No subir `serviceAccountKey*.json`, `*firebase-adminsdk*.json`, `.env`, tokens ni `FIREBASE_SERVICE_ACCOUNT_JSON` con valores reales.
- El bootstrap del primer administrador debe ejecutarse fuera del frontend con Admin SDK y credenciales locales temporales; se recomienda revocarlas al finalizar.
- Si se descubre una credencial privada en el historial, rotarla de inmediato; no basta con borrarla en un commit posterior.
- La configuración web incluida en `firebase-config.ts` es pública y distinta de una credencial administrativa.
