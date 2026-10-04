# Arquitectura de Software — Sistema de Gestión Integral
## Fundación Regalando Sonrisas (Quito, Ecuador)

---

## 1. Contexto y Propósito

La **Fundación Regalando Sonrisas** es una organización sin fines de lucro ubicada en Quito, Ecuador. Históricamente, la administración operativa se ha gestionado mediante herramientas dispersas (documentos físicos, Microsoft Excel, Microsoft Word, Google Drive, WhatsApp y redes sociales). Esta dispersión provocaba problemas recurrentes de información duplicada, datos incompletos, desactualización, pérdida de trazabilidad y dependencia excesiva de personas clave.

El **Sistema de Gestión Integral** es una solución web orientada a centralizar y estandarizar el registro, consulta, seguimiento, gestión documental y generación de indicadores en torno a los ejes misionales de la Fundación.

---

## 2. Pila Tecnológica Seleccionada

| Componente | Tecnología | Justificación Técnica |
| :--- | :--- | :--- |
| **Frontend Framework** | Angular (v22+) | Arquitectura por componentes Standalone, Signals para reactividad declarativa sin sobrecarga de suscripciones manuales, tipado estricto e inyección de dependencias funcional. |
| **Lenguaje** | TypeScript (~6.0) | Tipado estricto (`strict: true`), interfaces unificadas y contratos de datos seguros entre capas. |
| **Autenticación** | Firebase Authentication | Manejo seguro de credenciales, tokens JWT y sesiones de usuario sin delegar almacenamiento de contraseñas al cliente. |
| **Base de Datos NoSQL** | Cloud Firestore | Base de datos orientada a documentos en tiempo real, con reglas de seguridad declarativas a nivel de servidor y alta disponibilidad. |
| **Almacenamiento de Archivos** | Cloud Storage for Firebase | Repositorio escalable y seguro para identificaciones, fichas, fotos familiares y comprobantes, con reglas de acceso por rol y MIME type. |
| **Backend & Eventos** | Cloud Functions for Firebase | Ejecución de lógica de negocio privilegiada, validación de reglas de auditoría y triggers fuera del alcance de manipulación del cliente. |
| **Hosting & CDN** | Firebase Hosting | Distribución estática segura (HTTPS) de la SPA con optimización de caché y enrutamiento global hacia `index.html`. |
| **Control de Calidad** | ESLint (`@angular-eslint`) + Prettier + Vitest | Linter moderno (Flat Config), formateo estandarizado y pruebas unitarias rápidas integradas en el pipeline. |

---

## 3. Modelo Arquitectónico en Capas

El diseño sigue una arquitectura modular en tres capas principales:

```
src/
├── app/
│   ├── core/                    # CAPA DE INFRAESTRUCTURA Y SERVICIOS TRANSVERSALES (Singleton)
│   │   ├── guards/              # authGuard, roleGuard
│   │   ├── models/              # user.model.ts, audit.model.ts
│   │   └── services/
│   │       ├── firebase/        # firebase-app.service, auth.service, firestore.service, storage.service, functions.service
│   │       └── audit.service.ts # Registro inmutable de eventos de auditoría
│   │
│   ├── shared/                  # CAPA REUTILIZABLE
│   │   └── components/          # page-header, stat-card, status-badge, empty-state, alert
│   │
│   ├── layout/                  # CAPA ESTRUCTURAL DE INTERFAZ RESPONSIVE
│   │   ├── header/              # Barra superior con datos de usuario y selector de entorno
│   │   ├── sidebar/             # Navegación principal adaptativa (drawer móvil / fijo desktop)
│   │   ├── footer/              # Pie de página institucional
│   │   └── main-layout/         # Contenedor principal con RouterOutlet
│   │
│   └── features/                # CAPA DE DOMINIO Y MÓDULOS DE NEGOCIO (Lazy Loaded)
│       ├── dashboard/           # Panel de control, indicadores preliminares y visión global
│       ├── beneficiaries/       # Ficha socioeconómica, composición familiar y seguimiento
│       ├── donations/           # Registro de donaciones, donantes y actas de entrega
│       ├── volunteers/          # Padrón de voluntarios, habilidades y disponibilidad
│       ├── activities/          # Eventos sociales, educativos, comunitarios y entregas
│       ├── documents/           # Repositorio documental clasificado por entidad
│       ├── reports/             # Generación de reportes institucionales (PDF, Excel, CSV)
│       └── admin/               # Gestión de usuarios, perfiles y bitácora de auditoría
│
└── environments/                # CONFIGURACIÓN POR ENTORNOS
    ├── environment.model.ts     # Contrato TypeScript de variables requeridas
    ├── environment.ts           # Configuración de desarrollo local / emuladores
    ├── environment.production.ts# Configuración de producción para CI/CD
    └── environment.example.ts   # Plantilla pública sin secretos
```

---

## 4. Estrategia de Persistencia en Cloud Firestore

### 4.1. Análisis NoSQL y Modelado de Datos
Para minimizar costos de lectura/escritura y garantizar la integridad en Firestore:

1. **Colecciones de Nivel Superior**:
   - `users`: Perfil de usuario y rol del sistema.
   - `beneficiaries`: Ficha personal, datos de contacto, sector geográfico y estado socioeconómico general.
   - `donations`: Registro de donación, tipo, donante, valor aproximado y destino.
   - `volunteers`: Información personal, disponibilidad, área y habilidades.
   - `activities`: Eventos, fecha, lugar, descripción y lista de responsables.
   - `documents`: Metadatos de archivos subidos a Storage (`storagePath`, `module`, `recordId`, `mimeType`, `uploadedBy`).
   - `audit_logs`: Bitácora inmutable de eventos del sistema.

2. **Datos Embebidos vs. Referencias**:
   - **Embebido**: Subdocumentos con relación 1:pocos que no crecen indefinidamente y se consultan conjuntamente (ej. lista de cargas familiares del beneficiario, contacto de emergencia del voluntario, metadatos de auditoría `createdAt`, `updatedBy`).
   - **Referencias / Colección Separada**: Relaciones N:M o entidades con ciclo de vida independiente (ej. registro de asistencia de voluntarios a actividades, vinculación de una donación específica a un beneficiario).

3. **Política de Desactivación Lógica (Soft Delete)**:
   - Los registros de beneficiarios, donaciones, voluntarios y actividades **no se eliminan físicamente** de la base de datos.
   - Se utiliza una propiedad booleana `isActive: false` para salvaguardar la memoria institucional, trazabilidad y consistencia de reportes históricos.

---

## 5. Matriz de Seguridad y Reglas de Firestore / Storage

### 5.1. Principio de Menor Privilegio
- **Denegación por Defecto**: Todas las rutas y colecciones están cerradas para accesos no autenticados (`allow read, write: if false;`).
- **Autenticación Obligatoria**: Toda operación sobre el sistema requiere un usuario autenticado mediante Firebase Authentication.
- **Inmutabilidad de Auditoría**: La colección `audit_logs` permite únicamente operaciones `create` vinculadas al UID del autor. Las operaciones `update` y `delete` están **prohibidas a nivel de reglas** de Firestore.
- **Restricción de Cloud Storage**: Los archivos sólo se leen y escriben bajo validación de usuario autenticado y con restricción de tamaño máximo (10 MB por archivo).

---

## 6. Registro de Decisiones Técnicas y Pendientes de Validación

| ID | Tema | Decisión / Estado Actual | Justificación / Pendiente de Validación |
| :--- | :--- | :--- | :--- |
| **D-01** | Modelo de Roles | Se contemplan 'admin' y 'volunteer'. Se incluye 'authorized_staff' sólo como tipo preliminar sin permisos asumidos. | **Pendiente de validación formal:** Definir si "Personal Autorizado" es un tercer rol independiente o un conjunto de permisos granulares por módulo. |
| **D-02** | Campos Obligatorios de Beneficiarios | No se imponen validaciones bloqueantes en ficha socioeconómica en este incremento. | **Pendiente de validación formal:** La Fundación debe convalidar qué campos son indispensables (cédula, ingresos, número de dependientes). |
| **D-03** | Fórmulas de Indicadores | Las fórmulas de cálculo en el módulo de Reportes se mantienen referenciales. | **Pendiente de validación formal:** Se requiere confirmación institucional sobre cómo valorar donaciones en especies y definir rangos de cobertura. |
| **D-04** | Exclusión de Módulos Contables | No se implementan facturación electrónica, nómina, contabilidad ni pasarelas de pago. | **Regla mandataria:** El alcance del sistema es operativo, socioeconómico e institucional. |
| **D-05** | Funcionalidades de Expansión | "Emprendiendo e Innovando Desde Casa", proyectos/programas y aliados están excluidos de esta fase. | **Regla mandataria:** Requieren validación institucional explícita antes de su incremento. |
| **D-06** | Canales de Notificación | No se implementa integración con WhatsApp API ni SMS. | **Regla mandataria:** Requiere estudio previo de costos operativos, proveedores y decisiones de gobernanza por parte de la Fundación. |
