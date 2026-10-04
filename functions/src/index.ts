/**
 * Cloud Functions for Firebase - Fundación Regalando Sonrisas
 *
 * Backend seguro para operaciones privilegiadas, auditoría y lógica de negocio sensible.
 */
import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

// Inicialización de Firebase Admin SDK
if (!admin.apps.length) {
  admin.initializeApp();
}

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
 * Nota: La validación de roles y permisos específicos se implementará
 * conforme a las definiciones validadas por la Fundación.
 */
export const logAuditEvent = functions.https.onCall(async (data, context) => {
  // Verificar autenticación obligatoria
  if (!context.auth) {
    throw new functions.https.HttpsError(
      'unauthenticated',
      'El usuario debe estar autenticado para registrar eventos de auditoría.'
    );
  }

  const { action, module, details } = data;

  if (!action || !module) {
    throw new functions.https.HttpsError(
      'invalid-argument',
      'Los campos action y module son obligatorios.'
    );
  }

  const auditEntry = {
    userId: context.auth.uid,
    userEmail: context.auth.token.email || null,
    action,
    module,
    details: details || {},
    timestamp: admin.firestore.FieldValue.serverTimestamp(),
    ipAddress: context.rawRequest.ip || null,
  };

  await admin.firestore().collection('audit_logs').add(auditEntry);

  return { success: true };
});
