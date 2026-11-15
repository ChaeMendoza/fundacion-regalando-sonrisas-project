/**
 * Cloud Functions for Firebase - Fundación Regalando Sonrisas
 *
 * Backend seguro para operaciones privilegiadas, sincronización de Custom Claims,
 * revocación de sesiones y auditoría inmutable.
 */
import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

// Inicialización de Firebase Admin SDK
if (!admin.apps.length) {
  admin.initializeApp();
}

const VALID_ROLES = new Set(['admin', 'user', 'volunteer', 'authorized_staff']);
const VALID_STATUSES = new Set(['pending', 'approved', 'rejected', 'disabled']);

/**
 * Healthcheck de Cloud Functions para verificación de operatividad del backend.
 */
export const healthCheck = functions.https.onRequest((req, res) => {
  res.status(200).json({
    status: 'ok',
    service: 'fundacion-regalando-sonrisas-backend',
    timestamp: new Date().toISOString(),
  });
});

/**
 * Función reservada para registrar eventos críticos de auditoría desde el servidor.
 */
export const logAuditEvent = functions.https.onCall(async (request) => {
  if (!request.auth) {
    throw new functions.https.HttpsError(
      'unauthenticated',
      'El usuario debe estar autenticado para registrar eventos de auditoría.',
    );
  }

  const data = (request.data || {}) as Record<string, unknown>;
  const action = typeof data['action'] === 'string' ? data['action'] : '';
  const module = typeof data['module'] === 'string' ? data['module'] : '';
  const details =
    typeof data['details'] === 'object' && data['details'] !== null ? data['details'] : {};

  if (!action || !module) {
    throw new functions.https.HttpsError(
      'invalid-argument',
      'Los campos action y module son obligatorios.',
    );
  }

  const auditEntry = {
    userId: request.auth.uid,
    userEmail: request.auth.token.email || '',
    action,
    module,
    details,
    timestamp: new Date().toISOString(),
    ipAddress: request.rawRequest?.ip || null,
  };

  await admin.firestore().collection('audit_logs').add(auditEntry);

  return { success: true };
});

/**
 * Sincroniza Custom Claims y revoca tokens de actualización cuando un administrador
 * cambia el rol o estado de un usuario.
 */
export const syncUserAccessClaims = functions.https.onCall(async (request) => {
  if (!request.auth) {
    throw new functions.https.HttpsError(
      'unauthenticated',
      'Debe iniciar sesión como administrador.',
    );
  }

  const db = admin.firestore();
  const callerSnap = await db.collection('users').doc(request.auth.uid).get();
  const callerData = callerSnap.data();

  if (
    !callerSnap.exists ||
    callerData?.['role'] !== 'admin' ||
    callerData?.['status'] !== 'approved'
  ) {
    throw new functions.https.HttpsError(
      'permission-denied',
      'Solo un administrador aprobado puede sincronizar privilegios de cuentas.',
    );
  }

  const payload = (request.data || {}) as Record<string, unknown>;
  const targetUid = typeof payload['targetUid'] === 'string' ? payload['targetUid'].trim() : '';

  if (!targetUid) {
    throw new functions.https.HttpsError(
      'invalid-argument',
      'El identificador targetUid es obligatorio.',
    );
  }

  const targetSnap = await db.collection('users').doc(targetUid).get();
  if (!targetSnap.exists) {
    throw new functions.https.HttpsError('not-found', 'El perfil del usuario no existe.');
  }

  const targetData = targetSnap.data() || {};
  const role = typeof targetData['role'] === 'string' ? targetData['role'] : 'user';
  const status = typeof targetData['status'] === 'string' ? targetData['status'] : 'pending';

  if (!VALID_ROLES.has(role) || !VALID_STATUSES.has(status)) {
    throw new functions.https.HttpsError(
      'failed-precondition',
      'El perfil contiene un rol o estado no válido.',
    );
  }

  await admin.auth().setCustomUserClaims(targetUid, { role, status });

  if (status === 'rejected' || status === 'disabled') {
    await admin.auth().revokeRefreshTokens(targetUid);
  }

  return {
    success: true,
    uid: targetUid,
    role,
    status,
  };
});
