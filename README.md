# Sistema de Gestión Integral — Fundación Regalando Sonrisas

<p align="center">
  <img src="public/images/logo-fundacion.jpg" alt="Texto alternativo" width="400" style="border-radius: 12px;">
</p>

Aplicación web para la Fundación Regalando Sonrisas, organización sin fines de lucro ubicada en Quito, Ecuador. El repositorio contiene un **prototipo funcional** y una base bajo Clean Architecture.

Las páginas y módulos de gestión muestran el flujo de referencia del sistema; no implican que todas las funciones de gestión, persistencia o seguridad estén implementadas. El acceso ahora utiliza Firebase Authentication: el prototipo ya no inicia con una sesión demo y no asigna roles automáticamente. No se deben asumir como funcionalidades terminadas las propuestas descritas en la documentación.

## Tecnologías

- **Frontend:** Angular 22, componentes standalone y Signals.
- **Lenguaje:** TypeScript.
- **Estilos:** SCSS.
- **Servicios Firebase en uso actual (plan Spark):** Authentication, Cloud Firestore y Firebase Hosting.
- **Servicios pendientes de habilitación institucional:** Cloud Storage (no inicializado mientras se define la facturación institucional) y despliegue en producción de Cloud Functions.
- **Pruebas:** Vitest.
- **Calidad:** ESLint con `angular-eslint` y Prettier.
- **Backend:** Cloud Functions for Firebase en `functions/` (proyecto Node.js 20).

## Requisitos previos

- Para el frontend y Firebase CLI: Node.js 22.22.3+ de la serie 22 o 24.15.0+ de la serie 24. Angular 22 requiere esas versiones mínimas y la versión instalada de Firebase CLI incluye una dependencia que no declara soporte para Node 26.
- Para Cloud Functions: Node.js 20, según `functions/package.json`.
- npm 11.19.1 para el proyecto principal.
- Java 21 o superior y Node 24.12+ si se ejecutan las pruebas de reglas (`npm run test:rules`): `firebase-tools` 15 no soporta JDK 17 y `@firebase/rules-unit-testing` 6 requiere Node 24.12+.

## Instalación y ejecución local

```bash
git clone https://github.com/ChaeMendoza/fundacion-regalando-sonrisas-project.git
cd fundacion-regalando-sonrisas-project
npm ci
npm start
```

La aplicación de desarrollo queda disponible en `http://localhost:4200`.

La portada institucional permanece en `/`. El acceso al sistema está disponible en `/login` y el formulario de solicitud de cuenta en `/register`. El registro usa Firebase Authentication con correo y contraseña; las cuentas nuevas crean un documento `users/{uid}` con estado `pending` y rol `user`, y permanecen en la pantalla `/pending` hasta que un administrador aprueba su solicitud desde `/admin`. El entorno de desarrollo está conectado a los emuladores por defecto, por lo que necesitas `npm run emulators:start` en otra terminal antes de registrar cuentas locales.

## Inicialización del Primer Administrador (Bootstrap)

Por seguridad, ninguna cuenta registrada desde el frontend recibe privilegios de administrador automáticamente, y las reglas de Firestore impiden que un usuario modifique su propio rol o estado. Para designar al primer administrador de forma idempotente mediante **Firebase Admin SDK**:

### A) En entorno local (Emuladores de Firebase)
1. Con los emuladores encendidos (`npm run emulators:start`), registra tu usuario desde `http://localhost:4200/register` (o define `INITIAL_ADMIN_PASSWORD` para que el script lo cree).
2. Ejecuta:
   ```bash
   INITIAL_ADMIN_EMAIL="admin@fundacion.org" npm run admin:bootstrap:emulator
   ```

### B) En el proyecto real de Firebase (`fir-chae-projects`, plan Spark)

> Este procedimiento utiliza **exclusivamente Firebase Authentication y Cloud Firestore**; no requiere inicializar Firebase Storage ni activar facturación (plan Blaze).

1. **Desplegar únicamente las reglas de Firestore** (sin intentar desplegar Storage):
   ```bash
   npx firebase use fir-chae-projects
   npm run deploy:firestore-rules
   ```
   *(También puedes usar `npm run deploy:rules`, que actualmente delega en `deploy:firestore-rules` sin incluir Storage.)*
2. En **Firebase Console > Configuración del proyecto > Cuentas de servicio**, genera una nueva clave privada JSON temporal y guárdala **fuera del repositorio** (ej. `~/credenciales/fir-chae-projects-adminsdk.json`). Nunca la versiones ni la copies dentro del proyecto.
3. Registra primero tu cuenta en la aplicación (`/register`) para que exista en Firebase Authentication y luego ejecuta en tu terminal:
   ```bash
   GOOGLE_APPLICATION_CREDENTIALS="/ruta/fuera/del/repo/fir-chae-projects-adminsdk.json" \
   INITIAL_ADMIN_EMAIL="tu-correo@ejemplo.com" \
   npm run admin:bootstrap
   ```
4. El procedimiento es **idempotente**: valida que el usuario exista en Firebase Authentication antes de modificar Firestore, asigna el perfil `status: 'approved'` y `role: 'admin'` en `users/{uid}`, sincroniza los **Custom Claims** en Firebase Authentication, registra la operación en `audit_logs` y bloquea la creación accidental de múltiples administradores iniciales mediante `system_config/bootstrap`.
5. **Revoca las credenciales temporales inmediatamente después del bootstrap:**
   - Elimina el archivo JSON local de tu equipo:
     ```bash
     rm -f /ruta/fuera/del/repo/fir-chae-projects-adminsdk.json
     ```
   - En **Google Cloud Console > IAM y administración > Cuentas de servicio** (proyecto `fir-chae-projects`), selecciona la cuenta `firebase-adminsdk-...`, abre la pestaña **Claves** y elimina la clave privada generada para este proceso.
   - Si en su lugar utilizaste Application Default Credentials (`gcloud auth application-default login`), revócalas con:
     ```bash
     gcloud auth application-default revoke
     ```

## Configuración de Firebase

La configuración del proyecto Firebase está centralizada en `src/environments/firebase-config.ts`. Contiene la configuración web pública del proyecto Firebase utilizado por producción; no incluye credenciales administrativas. Las claves de configuración web no autorizan acceso por sí mismas: restringe su uso desde Google Cloud Console y protege los datos mediante Firebase Security Rules.

El entorno local usa un proyecto demo aislado y los emuladores; no crea usuarios ni modifica datos del proyecto real. El entorno de producción reutiliza la configuración central y desactiva los emuladores. Angular sustituye la configuración de entorno durante la compilación, y Firebase Hosting entrega el resultado compilado; no se requieren variables de entorno en tiempo de ejecución ni cambios manuales de código para desplegar.

La sesión del navegador usa la persistencia local administrada por el SDK oficial de Firebase Authentication; la aplicación no guarda contraseñas ni tokens por su cuenta.

En una terminal inicia los emuladores y, en otra, ejecuta `npm start`. La aplicación estará disponible en `http://localhost:4200`; la UI de los emuladores está en `http://localhost:4000`. Las cuentas registradas localmente existen solo en el emulador. El emulador de Authentication muestra los enlaces de recuperación para pruebas.

Para validar localmente contra el proyecto Firebase real sin editar archivos, usa `npx ng serve --configuration=production`. Esta opción usa los servicios reales: no la uses para crear cuentas de prueba ni modificar datos sin autorización. Habilita **Email/Password** y **Email Enumeration Protection** en Authentication. Añade `localhost` y los dominios reales de Hosting (por ejemplo, `fir-chae-projects.web.app` y `fir-chae-projects.firebaseapp.com`) a los dominios autorizados. Un dominio personalizado debe añadirse también en Firebase Console.

El despliegue de Hosting usa la configuración SPA de `firebase.json`, cuyo `predeploy` ejecuta `npm run build:production`. El proyecto destino queda fijado en `.firebaserc` como `fir-chae-projects`; no es necesario seleccionarlo interactivamente. Antes de publicar la beta, revisa la guía completa en [`docs/production-deployment.md`](docs/production-deployment.md), especialmente los dominios autorizados y las restricciones de la API key web.

Los emuladores definidos por `firebase.json` usan estos puertos:

| Servicio | Dirección |
| --- | --- |
| Authentication | `localhost:9099` |
| Firestore | `localhost:8080` |
| Storage | `localhost:9199` |
| Functions | `localhost:5001` |
| Hosting | `localhost:5000` |
| Emulator UI | `localhost:4000` |

`src/environments/environment.ts` ya tiene `useEmulators: true` para desarrollo. Para iniciarlos, ejecuta:

```bash
npm run emulators:start
```

## Comandos

| Comando | Descripción |
| --- | --- |
| `npm start` | Inicia el servidor de desarrollo Angular. |
| `npm run build` | Compila la aplicación; por defecto utiliza la configuración de producción. |
| `npm test` | Ejecuta las pruebas unitarias. |
| `npm run test:rules` | Ejecuta las pruebas de reglas de Firestore contra los emuladores de Auth y Firestore (requiere Java 21+). |
| `npm run lint` | Analiza el código Angular con ESLint. |
| `npm run emulators:start` | Inicia los emuladores configurados en `firebase.json`. |
| `npm run deploy:firestore-rules` | Publica exclusivamente `firestore.rules` en Firebase (sin desplegar Storage). |
| `npm run deploy:rules` | Alias seguro que ejecuta `deploy:firestore-rules` mientras Storage no esté habilitado. |
| `npm run deploy:storage-rules` | Publica `storage.rules` de forma independiente (para cuando Storage esté habilitado). |
| `npm run deploy:hosting` | Compila producción (`predeploy`) y despliega solo Hosting en `fir-chae-projects`. |
| `npm run admin:bootstrap` | Asigna el primer administrador en Authentication y Firestore (requiere credenciales locales temporales). |
| `npm run admin:bootstrap:emulator` | Ejecuta el bootstrap del primer administrador contra los emuladores locales. |
| `npm --prefix functions run build` | Compila el backend de Cloud Functions. |

## Arquitectura

La aplicación Angular está organizada en capas. Las dependencias apuntan hacia las capas internas: Presentation puede usar Application; Application depende de Domain; Infrastructure implementa contratos definidos en Domain. `app.providers.ts` es la raíz de composición que enlaza implementaciones con sus abstracciones.

```text
src/
├── app/
│   ├── domain/
│   │   ├── entities/             # User y AuditLog
│   │   └── repositories/         # Contratos AuthRepository y AuditLogRepository
│   ├── application/
│   │   └── use-cases/
│   │       ├── auth/             # Login, registro, logout y observación de sesión
│   │       └── audit/            # Registro y consulta de auditoría
│   ├── infrastructure/
│   │   ├── firebase/             # Adaptadores técnicos Firebase
│   │   └── repositories/         # Implementaciones Firebase de los contratos
│   ├── presentation/
│   │   ├── pages/                # Landing, autenticación y páginas del prototipo
│   │   ├── layout/               # Header, sidebar, footer y layout principal
│   │   ├── shared/components/    # Componentes de interfaz reutilizables
│   │   ├── guards/               # Guards de autenticación y rol
│   │   ├── state/                # Estado reactivo de sesión para la UI
│   │   └── config/               # Tokens de configuración de presentación
│   ├── app.routes.ts             # Rutas de la aplicación
│   ├── app.config.ts             # Configuración de Angular
│   └── app.providers.ts          # Composición de casos de uso y adaptadores
├── environments/                 # Configuración de los entornos
└── styles.scss                   # Estilos globales
functions/                        # Backend Cloud Functions
docs/architecture.md              # Descripción arquitectónica y decisiones documentadas
```

El detalle de las capas y los contratos está en [`docs/architecture.md`](docs/architecture.md).

## Autorización y seguridad

El panel, los módulos institucionales (beneficiarios, donaciones, voluntarios, actividades, solicitudes, documentos), los reportes y la bitácora son de uso exclusivo del administrador aprobado. El usuario aprobado accede a su perfil y no puede consultar ni modificar información de terceros. Firestore aplica esta separación con Custom Claims para consultas a colecciones y con el perfil `users/{uid}` para lecturas individuales y escrituras; las rutas y el menú reflejan el mismo criterio. La matriz completa, las causas corregidas y los pasos manuales de despliegue están en [`docs/security-and-permissions.md`](docs/security-and-permissions.md).

## Alcance y estado

- Las páginas de dashboard, beneficiarios, donaciones, voluntarios, actividades, documentos, reportes y administración son parte de la interfaz del prototipo. Su presencia no implica que exista persistencia completa o flujos CRUD integrados.
- El login y el registro usan Firebase Authentication y crean/consultan perfiles en `users`. Las cuentas nuevas quedan pendientes, sin rol; el sistema no tiene todavía un flujo institucional para aprobarlas o asignar roles.
- Existen adaptadores para Firebase y casos de uso de autenticación y auditoría; no todos los servicios están conectados a páginas o flujos de usuario.
- Las rutas internas requieren una sesión con perfil `approved` y rol asignado. Firestore aplica el mismo requisito a nivel de servidor; las cuentas sin aprobación se dirigen a la página de acceso pendiente.
- **Firebase Storage** permanece como funcionalidad **pendiente de habilitación institucional** (junto con la definición de plan y facturación por parte de la fundación); el proyecto opera actualmente en el plan Spark con Firebase Authentication y Cloud Firestore.
- Cloud Functions contiene `healthCheck` y una callable `logAuditEvent`; su presencia no significa que la aplicación cliente delegue actualmente toda la auditoría al backend.
- La estructura Firestore, reglas y funcionalidades de negocio pendientes requieren validación formal antes de considerarse requisitos implementados.
- Las definiciones de roles, campos obligatorios y reglas institucionales continúan sujetas a validación.
- El alcance documentado excluye módulos contables, nómina, facturación electrónica y pasarelas de pago. Las ideas de expansión requieren aprobación antes de desarrollarse.
