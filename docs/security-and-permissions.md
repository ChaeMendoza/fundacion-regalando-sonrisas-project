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
| `users/{uid}/legal_acceptances/{acceptanceId}` | Consultar evidencias (incluye `collectionGroup`); no modificar ni eliminar | Crear únicamente las suyas con las versiones vigentes; leer las suyas; no modificar ni eliminar | Denegado |
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
5. **Ausencia de constancia verificable de aceptación**: se añadió la subcolección `users/{uid}/legal_acceptances`. El registro crea primero la evidencia y después el perfil `pending`; si falla la evidencia, se elimina la cuenta de Authentication creada en ese intento y se aborta el registro. La ruta `resolveFirebaseUser()` tampoco crea perfiles automáticamente para cuentas que no tengan aceptación vigente, de modo que no se puede eludir el formulario iniciando sesión por otro medio.

### 3.1 Evidencias de aceptación de documentos legales

Cada evidencia se guarda en:

```text
users/{uid}/legal_acceptances/{uid}_{termsVersion}_{privacyVersion}
```

El documento contiene únicamente:

| Campo | Origen / validación |
| :--- | :--- |
| `uid` | Debe coincidir con `request.auth.uid`. |
| `termsVersion` | Literal `'1.0'` validado en `firestore.rules`. |
| `privacyVersion` | Literal `'1.0'` validado en `firestore.rules`. |
| `termsAccepted` | Debe ser `true`; no puede marcarse desde otro usuario. |
| `privacyInformationAcknowledged` | Debe ser `true`; es la constancia de recepción de información, no un consentimiento universal. |
| `acceptedAt` | `serverTimestamp()`; la regla exige `request.resource.data.acceptedAt == request.time`. |

Garantías de las reglas:

- `create` solo para el titular autenticado y sobre su propio `uid`.
- El identificador del documento debe coincidir con `{uid}_{termsVersion}_{privacyVersion}`; no se aceptan identificadores arbitrarios.
- No se permiten campos adicionales ni versiones, estados o fechas falsificadas.
- `update` y `delete` están prohibidos para usuarios y administradores: el historial no se sobrescribe.
- La lectura individual la permite el propietario o un administrador aprobado.
- `collectionGroup('legal_acceptances')` solo se habilita para administradores con claims vigentes; es el mecanismo previsto para detectar cuentas pendientes de una versión nueva.

Las versiones vigentes viven en `src/app/domain/entities/legal-document.entity.ts` y se repiten deliberadamente como literales en `firestore.rules` porque las reglas no pueden importar TypeScript. Al publicar una versión nueva deben actualizarse en la misma entrega: el contenido del documento, la constante de dominio, los literales de las reglas y esta tabla. La prueba de reglas verifica que los literales sigan coincidiendo con las constantes.

### 3.2 Migración a versiones nuevas y cuentas pendientes

Para detectar pendientes tras publicar, por ejemplo, `terms: '1.1'`, un administrador puede consultar todas las evidencias con `collectionGroup('legal_acceptances')` y comparar `termsVersion`/`privacyVersion` con las constantes vigentes. Una cuenta sin documento para el par actual debe considerarse pendiente; no se crea una aceptación retroactiva ni se altera una evidencia anterior. El sistema actual **no notifica automáticamente** esa obligación ni bloquea módulos por versión desactualizada: [PENDIENTE: definir el canal de notificación y la política de bloqueo]. Esta limitación también se declara en la política de privacidad.

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
npm test                 # 44 pruebas unitarias (guards, casos de uso, componentes, páginas legales)
npm run test:rules       # 15 pruebas de reglas contra emuladores Auth + Firestore
npm run lint
npm run build
npm --prefix functions run build
```

`test:rules` usa `firebase emulators:exec` y requiere **Java 21 o superior** (`firebase-tools` 15) y **Node 24.12+** (`@firebase/rules-unit-testing` 6). Las pruebas crean un proyecto demo aislado; no modifican datos reales.

## 6. Alcance legal de estos cambios

Los textos públicos están en:

- `src/app/presentation/pages/legal/terms-of-use.content.ts`
- `src/app/presentation/pages/legal/privacy-policy.content.ts`

Ambos documentos se renderizan con el mismo componente y están disponibles sin autenticación en `/terminos-y-condiciones` y `/politica-de-privacidad`. El pie del portal público enlaza a los dos documentos.

Antes de publicar formalmente los textos debe completarse toda marca `[PENDIENTE: ...]` con datos institucionales verificados: razón social/RUC, domicilio, correos de contacto y privacidad, teléfono, región de procesamiento, plazos de conservación y eventual delegado de protección de datos. Tampoco se ha inventado un mecanismo de consentimiento para datos sensibles ni de representación legal de menores: la política lo declara como control pendiente.

La base de legitimación se analizó por finalidad conforme al artículo 7 de la LOPDP. La aceptación de términos y el acuse de recepción de la política no se tratan como consentimiento universal. No se afirma cifrado, eliminaciones automáticas, DPO designado ni certificación alguna que no conste en el repositorio.

> Nota operativa: `npm run test:rules` se ejecutó localmente con un JDK 21 aislado porque el entorno base tiene Java 17. El repositorio no incluye ni instala ese JDK; el requisito documentado sigue siendo Java 21+.
