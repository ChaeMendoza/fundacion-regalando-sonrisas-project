# Sistema de Gestión Integral — Fundación Regalando Sonrisas

<p align="center">
  <img src="public/images/logo-fundacion.jpg" alt="Texto alternativo" width="400" style="border-radius: 12px;">
</p>

Aplicación web para la Fundación Regalando Sonrisas, organización sin fines de lucro ubicada en Quito, Ecuador. El repositorio contiene un **prototipo funcional** y una base bajo Clean Architecture.

Las páginas y módulos de la interfaz muestran el flujo de referencia del sistema; no implican que todas las funciones de gestión, persistencia o seguridad estén implementadas. La autenticación conserva un usuario demo y los roles continúan pendientes de validación institucional. No se deben asumir como funcionalidades terminadas las propuestas descritas en la documentación.

## Tecnologías

- **Frontend:** Angular 22, componentes standalone y Signals.
- **Lenguaje:** TypeScript.
- **Estilos:** SCSS.
- **Servicios Firebase disponibles en el proyecto:** Authentication, Cloud Firestore, Cloud Storage, Cloud Functions y Firebase Hosting.
- **Pruebas:** Vitest.
- **Calidad:** ESLint con `angular-eslint` y Prettier.
- **Backend:** Cloud Functions for Firebase en `functions/` (proyecto Node.js 20).

## Requisitos previos

- Node.js compatible con Angular 22 (Node 20.19+, 22.12+ o 24+).
- npm.
- Java si se ejecuta la suite de emuladores de Firebase.

## Instalación y ejecución local

```bash
git clone https://github.com/ChaeMendoza/fundacion-regalando-sonrisas-project.git
cd fundacion-regalando-sonrisas-project
npm ci
npm start
```

La aplicación de desarrollo queda disponible en `http://localhost:4200`.

## Configuración de Firebase

La configuración utilizada por defecto está en `src/environments/environment.ts`. Contiene valores demo y `useEmulators: false`; no representa credenciales de un proyecto Firebase real.

Para conectar un proyecto real, configura los valores Firebase apropiados para desarrollo en ese archivo y reemplaza los marcadores de `src/environments/environment.production.ts` mediante un proceso seguro de despliegue. No publiques credenciales privadas ni despliegues con los valores placeholder. La plantilla de referencia está en `src/environments/environment.example.ts`.

Los emuladores definidos por `firebase.json` usan estos puertos:

| Servicio | Dirección |
| --- | --- |
| Authentication | `localhost:9099` |
| Firestore | `localhost:8080` |
| Storage | `localhost:9199` |
| Functions | `localhost:5001` |
| Hosting | `localhost:5000` |
| Emulator UI | `localhost:4000` |

Para conectarse a ellos, habilita `useEmulators` en `src/environments/environment.ts` y ejecuta:

```bash
npm run emulators:start
```

## Comandos

| Comando | Descripción |
| --- | --- |
| `npm start` | Inicia el servidor de desarrollo Angular. |
| `npm run build` | Compila la aplicación; por defecto utiliza la configuración de producción. |
| `npm test` | Ejecuta las pruebas unitarias. |
| `npm run lint` | Analiza el código Angular con ESLint. |
| `npm run emulators:start` | Inicia los emuladores configurados en `firebase.json`. |
| `npm run deploy:hosting` | Despliega Hosting con Firebase CLI, una vez configurado el proyecto destino. |
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
│   │       ├── auth/             # Login, logout y observación de sesión
│   │       └── audit/            # Registro y consulta de auditoría
│   ├── infrastructure/
│   │   ├── firebase/             # Adaptadores técnicos Firebase
│   │   └── repositories/         # Implementaciones Firebase de los contratos
│   ├── presentation/
│   │   ├── pages/                # Landing y páginas del prototipo
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

## Alcance y estado

- Las páginas de dashboard, beneficiarios, donaciones, voluntarios, actividades, documentos, reportes y administración son parte de la interfaz del prototipo. Su presencia no implica que exista persistencia completa o flujos CRUD integrados.
- La capa de autenticación mantiene la sesión demo existente para facilitar la navegación del prototipo. La asignación real de roles no está resuelta.
- Existen adaptadores para Firebase y casos de uso de autenticación y auditoría; no todos los servicios están conectados a páginas o flujos de usuario.
- Las rutas actuales no aplican los guards de autenticación y rol.
- Cloud Functions contiene `healthCheck` y una callable `logAuditEvent`; su presencia no significa que la aplicación cliente delegue actualmente toda la auditoría al backend.
- La estructura Firestore, reglas y funcionalidades de negocio pendientes requieren validación formal antes de considerarse requisitos implementados.
- Las definiciones de roles, campos obligatorios y reglas institucionales continúan sujetas a validación.
- El alcance documentado excluye módulos contables, nómina, facturación electrónica y pasarelas de pago. Las ideas de expansión requieren aprobación antes de desarrollarse.
