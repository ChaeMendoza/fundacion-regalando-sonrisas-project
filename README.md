# Sistema de Gestión Integral — Fundación Regalando Sonrisas

Aplicación web institucional orientada a centralizar y optimizar la gestión operativa, asistencial, documental y de voluntariado de la **Fundación Regalando Sonrisas** (organización sin fines de lucro ubicada en Quito, Ecuador).

Desarrollada como proyecto de titulación profesional bajo una metodología incremental, conservadora y fundamentada en documentación verificable.

---

## 1. Tecnologías y Herramientas

* **Frontend:** [Angular](https://angular.dev/) (v22+) con componentes Standalone y Signals.
* **Lenguaje:** [TypeScript](https://www.typescriptlang.org/) (estricto).
* **Estilos:** SCSS modular con variables semánticas y diseño responsive accesible (computadores, laptops, tablets y móviles).
* **Autenticación:** Firebase Authentication.
* **Base de Datos:** Cloud Firestore (NoSQL orientado a documentos).
* **Almacenamiento de Archivos:** Cloud Storage for Firebase.
* **Backend y Lógica Privilegiada:** Cloud Functions for Firebase.
* **Despliegue y CDN:** Firebase Hosting.
* **Pruebas Unitarias:** Vitest.
* **Calidad de Código:** ESLint (`@angular-eslint`) y Prettier.

---

## 2. Requisitos Previos

* **Node.js:** Versión 20.x, 22.x o 24.x LTS (compatible con Node 26.x).
* **npm:** Versión 10.x o superior.
* **Java:** Requerido únicamente si se ejecutan los emuladores locales de Firebase (`firebase emulators:start`).

---

## 3. Instalación

1. Clonar el repositorio:
   ```bash
   git clone https://github.com/ChaeMendoza/fundacion-regalando-sonrisas-project.git
   cd p_final
   ```

2. Instalar dependencias del proyecto:
   ```bash
   npm install
   ```

---

## 4. Configuración de Ambientes y Firebase

Para mantener la seguridad y evitar la exposición de secretos en el control de versiones, el proyecto maneja la configuración de forma estricta:

1. El archivo `src/environments/environment.example.ts` contiene la plantilla pública de variables.
2. Para desarrollo local, revise `src/environments/environment.ts`.
3. Si desea conectar el proyecto a su instancia real de Firebase, actualice las credenciales en `src/environments/environment.ts` o genere `src/environments/environment.local.ts` (ignorado automáticamente por `.gitignore`).
4. Para despliegues en producción, el comando `npm run build` utiliza automáticamente `src/environments/environment.production.ts`.

### Emuladores Locales de Firebase
El proyecto está preconfigurado para utilizar la suite de emuladores locales sin necesidad de consumir cuotas de Firebase en la nube:
* **Auth Emulator:** `http://localhost:9099`
* **Firestore Emulator:** `localhost:8080`
* **Storage Emulator:** `localhost:9199`
* **Functions Emulator:** `localhost:5001`
* **Emulator UI (Panel web):** `http://localhost:4000`

Para iniciar los emuladores:
```bash
npm run emulators:start
```

---

## 5. Comandos Principales

| Comando | Descripción |
| :--- | :--- |
| `npm start` | Inicia el servidor de desarrollo local de Angular en `http://localhost:4200` |
| `npm run build` | Compila la aplicación para producción en la carpeta `dist/` |
| `npm test` | Ejecuta la suite de pruebas unitarias mediante Vitest |
| `npm run lint` | Ejecuta el análisis estático de código con ESLint |
| `npm run emulators:start` | Inicia la suite local de emuladores de Firebase |
| `npm run deploy:hosting` | Despliega los archivos estáticos en Firebase Hosting |

---

## 6. Estructura General del Proyecto

```
p_final/
├── docs/                     # Documentación de arquitectura y decisiones
│   └── architecture.md       # Arquitectura técnica, NoSQL y matriz de seguridad
├── functions/                # Backend con Cloud Functions for Firebase
│   ├── src/index.ts          # Endpoints de salud y auditoría privilegiada
│   └── tsconfig.json         # Configuración TypeScript del backend
├── public/                   # Recursos estáticos públicos (favicon, etc.)
├── src/
│   ├── app/
│   │   ├── core/             # Servicios transversales singleton
│   │   │   ├── guards/       # authGuard, roleGuard
│   │   │   ├── models/       # user.model.ts, audit.model.ts
│   │   │   └── services/     # FirebaseApp, Auth, Firestore, Storage, Functions, Audit
│   │   ├── layout/           # Componentes estructurales (Sidebar, Header, Footer, MainLayout)
│   │   ├── shared/           # Componentes UI reutilizables (StatCard, PageHeader, etc.)
│   │   ├── features/         # Módulos del sistema cargados perezosamente (Lazy Loading)
│   │   │   ├── dashboard/    # Panel general e indicadores
│   │   │   ├── beneficiaries/# Gestión de beneficiarios
│   │   │   ├── donations/    # Control de donaciones
│   │   │   ├── volunteers/   # Padrón de voluntarios
│   │   │   ├── activities/   # Eventos comunitarios y entregas
│   │   │   ├── documents/    # Repositorio documental
│   │   │   ├── reports/      # Reportes e indicadores
│   │   │   └── admin/        # Administración y auditoría
│   │   ├── app.config.ts     # Proveedores globales de Angular
│   │   ├── app.routes.ts     # Tabla de enrutamiento modular
│   │   └── app.ts            # Componente raíz
│   ├── environments/         # Modelos y configuraciones de entorno
│   ├── styles.scss           # Estilos globales y variables de diseño
│   └── index.html            # Plantilla HTML base
├── angular.json              # Configuración del workspace de Angular CLI
├── firebase.json             # Configuración de servicios y emuladores de Firebase
├── firestore.rules           # Reglas de seguridad de Cloud Firestore
├── storage.rules             # Reglas de seguridad de Cloud Storage
└── package.json              # Manifiesto de dependencias y scripts
```

---

## 7. Reglas y Límites del Alcance

De acuerdo con los lineamientos del proyecto de titulación:

1. **Sin invención de requisitos:** No se agregan campos ni entidades que no estén formalmente justificadas en la documentación.
2. **Exclusiones mandatorias:** El sistema no incluye módulos contables, nómina, facturación electrónica ni pasarelas de pago.
3. **Roles en validación:** La distinción entre roles y la naturaleza de "Personal Autorizado" está sujeta a validación con la directiva de la Fundación.
4. **Trazabilidad:** Cada cambio relevante queda registrado bajo el usuario autenticado con bitácora inmutable.
5. **Funcionalidades de expansión:** La gestión de emprendedoras del proyecto *"Emprendiendo e Innovando Desde Casa"* y alianzas institucionales se encuentran documentadas pero reservadas para futuros incrementos tras su validación.
