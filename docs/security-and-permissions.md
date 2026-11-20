# Seguridad, roles y permisos — Beta v1.0.0

## 1. Modelo de autorización

La autorización se apoya en dos capas complementarias:

| Fuente | Uso | Quién puede modificarla |
| :--- | :--- | :--- |
| **Custom Claims** (`role`, `status`) de Firebase Authentication | Autorización en Security Rules para consultas a colecciones (`list`), donde Firestore no permite `get()`/`exists()` sobre otros documentos. | Solo Firebase Admin SDK (bootstrap y callable `syncUserAccessClaims`). |
| **Perfil** `users/{uid}` en Firestore | Fuente operativa del módulo de administración y respaldo para lecturas individuales (`get`) y escrituras. | El propio usuario (datos personales) y el administrador (rol/estado). |

Resultado: el cliente no puede elevar privilegios modificando campos de su perfil ni falsificando claims, porque las reglas validan ambos canales y los claims nunca se escriben desde el frontend.

## 2. Matriz de permisos

| Colección / módulo | Administrador aprobado | Usuario aprobado | No autenticado |
| :--- | :--- | :--- | :--- |
| `users/{uid}` (propio) | Leer y actualizar datos personales; no puede auto-revocarse el rol | Leer y actualizar `displayName`, `phoneNumber`, `photoUrl`, `updatedAt`, `updatedBy` | Denegado |
| `users/{otro}` | Leer, aprobar/rechazar/deshabilitar/reactivar y cambiar rol | Denegado | Denegado |
| `beneficiaries`, `donations`, `donors`, `volunteers`, `activities`, `documents`, `requests` | Consultar, crear, actualizar y desactivar (soft delete) | Denegado | Denegado |
| `reports`, `dashboard` (UI) | Acceso completo | Denegado (redirección a `/profile`) | Denegado |
| `audit_logs` | Consultar; no modificar ni eliminar | Crear únicamente eventos propios con acción/módulo válidos | Denegado |
| `system_config` | Consultar | Denegado | Denegado |
| Cloud Storage | Leer/escribir archivos de los módulos (≤10 MB) | Denegado | Denegado |

El borrado físico permanece prohibido en todas las colecciones institucionales: se conserva la política de desactivación lógica (`isActive: false`).

## 3. Causas raíz corregidas

1. **`get()` en reglas de lectura de colección**: `hasApprovedProfile()` invocaba `get()`/`exists()` en `allow read`, algo prohibido por Firestore para operaciones `list`. El administrador recibía `permission-denied` en cada `getDocs()` (dashboard, reportes, módulos, listado de usuarios y bitácora). Ahora las consultas se validan con Custom Claims.
2. **Operaciones institucionales abiertas a cualquier usuario aprobado**: las reglas permitían `read/create/update` en siete colecciones con solo verificar `createdBy`/`updatedBy` igual al UID del llamante, campos manipulables desde el cliente. Ahora son exclusivas del administrador.
3. **Claims desincronizados**: el panel de administración cambiaba el perfil en Firestore pero nunca propagaba el cambio a Firebase Authentication. Se añadió el contrato `UserAccessClaimsRepository` y su adaptador hacia `syncUserAccessClaims`, invocado tras cada cambio de acceso.
4. **Rutas protegidas solo parcialmente**: solo `/admin` tenía `roleGuard`. Todos los módulos de gestión lo requieren ahora, con redirección a `/profile` para usuarios normales.

## 4. Despliegue y pasos manuales

1. Publicar las reglas de Firestore:
   ```bash
   npm run deploy:firestore-rules
   ```
2. Si Cloud Storage llega a habilitarse, publicar también `storage.rules`:
   ```bash
   npm run deploy:storage-rules
   ```
3. El primer administrador ya recibe Custom Claims al ejecutar `npm run admin:bootstrap` (o `:emulator`). Si el proyecto no tiene desplegadas Cloud Functions, un usuario **promovido** a administrador desde `/admin` conservará su perfil actualizado pero no podrá listar colecciones hasta propagar sus claims. Cuando Cloud Functions esté disponible, el panel lo sincroniza automáticamente. Como alternativa manual con Admin SDK:
   - Volver a aprobar/reactivar al usuario desde `/admin` (dispara la sincronización), o
   - Ejecutar el bootstrap idempotente con la cuenta promovida para refresh de claims.
4. Para revocar accesos de forma inmediata, desplegar `syncUserAccessClaims`: la función revoca los refresh tokens cuando cambian rol o estado, y cuando el estado pasa a `rejected` o `disabled`.

## 5. Pruebas

```bash
npm test                 # 31 pruebas unitarias (guards, casos de uso, componentes)
npm run test:rules       # 9 pruebas de reglas contra emuladores Auth + Firestore
npm run lint
npm run build
npm --prefix functions run build
```

`test:rules` usa `firebase emulators:exec` y requiere **Java 21 o superior** (`firebase-tools` 15) y **Node 24.12+** (`@firebase/rules-unit-testing` 6). Las pruebas crean un proyecto demo aislado; no modifican datos reales.
