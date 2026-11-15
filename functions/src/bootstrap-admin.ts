/**
 * Procedimiento seguro e idempotente de inicialización del primer administrador
 * Fundación Regalando Sonrisas — Firebase Admin SDK
 *
 * Uso:
 *   1) Contra Emuladores Locales:
 *      INITIAL_ADMIN_EMAIL="admin@fundacion.org" npm run admin:bootstrap:emulator
 *
 *   2) Contra Proyecto Firebase Real (Producción / Nube):
 *      GOOGLE_APPLICATION_CREDENTIALS="/ruta/fuera/del/repo/service-account.json" \
 *      INITIAL_ADMIN_EMAIL="tu-correo@ejemplo.com" \
 *      npm run admin:bootstrap
 */
import * as admin from 'firebase-admin';
import * as fs from 'fs';

interface BootstrapOptions {
  email: string;
  displayName: string;
  password?: string;
  projectId: string;
  useEmulator: boolean;
}

function parseCliArgs(): BootstrapOptions {
  const args = process.argv.slice(2);
  const argMap = new Map<string, string>();

  for (const arg of args) {
    if (arg === '--emulator') {
      argMap.set('emulator', 'true');
      continue;
    }
    const match = /^--([^=]+)=(.*)$/.exec(arg);
    if (match) {
      argMap.set(match[1], match[2]);
    }
  }

  const useEmulator =
    argMap.get('emulator') === 'true' ||
    Boolean(process.env['FIRESTORE_EMULATOR_HOST']) ||
    Boolean(process.env['FIREBASE_AUTH_EMULATOR_HOST']);

  if (useEmulator) {
    process.env['FIRESTORE_EMULATOR_HOST'] =
      process.env['FIRESTORE_EMULATOR_HOST'] || '127.0.0.1:8080';
    process.env['FIREBASE_AUTH_EMULATOR_HOST'] =
      process.env['FIREBASE_AUTH_EMULATOR_HOST'] || '127.0.0.1:9099';
  }

  const email = (argMap.get('email') || process.env['INITIAL_ADMIN_EMAIL'] || '').trim();
  const displayName = (
    argMap.get('name') ||
    process.env['INITIAL_ADMIN_NAME'] ||
    'Administrador Fundación'
  ).trim();
  const password = argMap.get('password') || process.env['INITIAL_ADMIN_PASSWORD'] || undefined;
  const projectId = (
    argMap.get('project') ||
    process.env['FIREBASE_PROJECT_ID'] ||
    process.env['GCLOUD_PROJECT'] ||
    (useEmulator ? 'demo-regalando-sonrisas' : 'fir-chae-projects')
  ).trim();

  if (!email || !email.includes('@')) {
    throw new Error(
      'Debe especificar un correo válido mediante INITIAL_ADMIN_EMAIL="correo@dominio.com" o --email=correo@dominio.com',
    );
  }

  return { email, displayName, password, projectId, useEmulator };
}

function initializeFirebaseAdmin(options: BootstrapOptions): void {
  if (admin.apps.length > 0) {
    return;
  }

  if (options.useEmulator) {
    admin.initializeApp({ projectId: options.projectId });
    return;
  }

  const serviceAccountJson = process.env['FIREBASE_SERVICE_ACCOUNT_JSON'];
  if (serviceAccountJson) {
    const parsedCredential = JSON.parse(serviceAccountJson) as admin.ServiceAccount;
    admin.initializeApp({
      credential: admin.credential.cert(parsedCredential),
      projectId: options.projectId,
    });
    return;
  }

  const credentialsPath = process.env['GOOGLE_APPLICATION_CREDENTIALS'];
  if (credentialsPath) {
    if (!fs.existsSync(credentialsPath)) {
      throw new Error(
        `No se encontró el archivo de credenciales en GOOGLE_APPLICATION_CREDENTIALS="${credentialsPath}".`,
      );
    }
    const rawFile = fs.readFileSync(credentialsPath, 'utf8');
    const parsedCredential = JSON.parse(rawFile) as admin.ServiceAccount;
    admin.initializeApp({
      credential: admin.credential.cert(parsedCredential),
      projectId: options.projectId,
    });
    return;
  }

  // Fallback a Application Default Credentials (ej. `gcloud auth application-default login`)
  admin.initializeApp({
    credential: admin.credential.applicationDefault(),
    projectId: options.projectId,
  });
}

async function resolveOrCreateAuthUser(
  auth: admin.auth.Auth,
  options: BootstrapOptions,
): Promise<admin.auth.UserRecord> {
  try {
    return await auth.getUserByEmail(options.email);
  } catch (err: unknown) {
    const code =
      typeof err === 'object' && err !== null && 'code' in err ? String(err.code) : '';
    if (code !== 'auth/user-not-found') {
      throw err;
    }

    if (!options.password) {
      throw new Error(
        `El usuario "${options.email}" aún no existe en Firebase Authentication. ` +
          'Regístrelo primero desde la pantalla /register de la aplicación o proporcione INITIAL_ADMIN_PASSWORD para crearlo automáticamente.',
      );
    }

    if (options.password.length < 6) {
      throw new Error('INITIAL_ADMIN_PASSWORD debe tener al menos 6 caracteres.');
    }

    return await auth.createUser({
      email: options.email,
      displayName: options.displayName,
      password: options.password,
      emailVerified: true,
    });
  }
}

export async function runBootstrapFirstAdmin(): Promise<void> {
  const options = parseCliArgs();
  initializeFirebaseAdmin(options);

  const auth = admin.auth();
  const db = admin.firestore();

  console.log(
    `[Bootstrap Admin] Verificando estado de inicialización en el proyecto "${options.projectId}" (${
      options.useEmulator ? 'EMULADOR LOCAL' : 'FIREBASE CLOUD'
    })...`,
  );

  const targetAuthUser = await resolveOrCreateAuthUser(auth, options);
  const now = new Date().toISOString();

  const bootstrapRef = db.collection('system_config').doc('bootstrap');
  const userRef = db.collection('users').doc(targetAuthUser.uid);

  const result = await db.runTransaction(async (tx) => {
    const bootstrapSnap = await tx.get(bootstrapRef);
    const adminsQuery = db
      .collection('users')
      .where('role', '==', 'admin')
      .where('status', '==', 'approved')
      .limit(2);
    const existingAdminsSnap = await tx.get(adminsQuery);
    const userSnap = await tx.get(userRef);

    const otherAdminDoc = existingAdminsSnap.docs.find((d) => d.id !== targetAuthUser.uid);
    const bootstrapData = bootstrapSnap.exists ? bootstrapSnap.data() : undefined;
    const configuredAdminUid =
      bootstrapData && typeof bootstrapData['initialAdminUid'] === 'string'
        ? bootstrapData['initialAdminUid']
        : null;

    if (
      (configuredAdminUid && configuredAdminUid !== targetAuthUser.uid) ||
      otherAdminDoc !== undefined
    ) {
      const existingEmail =
        (bootstrapData && bootstrapData['initialAdminEmail']) ||
        otherAdminDoc?.data()['email'] ||
        configuredAdminUid;
      return {
        status: 'already_exists_other' as const,
        existingAdmin: String(existingEmail),
      };
    }

    const existingUserData = userSnap.exists ? userSnap.data() : undefined;
    const isAlreadySameAdmin =
      configuredAdminUid === targetAuthUser.uid &&
      existingUserData?.['role'] === 'admin' &&
      existingUserData?.['status'] === 'approved';

    const createdAt =
      (typeof existingUserData?.['createdAt'] === 'string' && existingUserData['createdAt']) ||
      (targetAuthUser.metadata.creationTime
        ? new Date(targetAuthUser.metadata.creationTime).toISOString()
        : now);

    const profilePayload = {
      uid: targetAuthUser.uid,
      email: targetAuthUser.email || options.email,
      displayName:
        existingUserData?.['displayName'] || targetAuthUser.displayName || options.displayName,
      role: 'admin',
      status: 'approved',
      createdAt,
      updatedAt: now,
      approvedAt: existingUserData?.['approvedAt'] || now,
      approvedBy: existingUserData?.['approvedBy'] || 'system:bootstrap',
      updatedBy: 'system:bootstrap',
      rejectionReason: null,
    };

    tx.set(userRef, profilePayload, { merge: true });
    tx.set(
      bootstrapRef,
      {
        initialized: true,
        initialAdminUid: targetAuthUser.uid,
        initialAdminEmail: targetAuthUser.email || options.email,
        initializedAt: bootstrapData?.['initializedAt'] || now,
        updatedAt: now,
      },
      { merge: true },
    );

    if (!isAlreadySameAdmin) {
      const auditRef = db.collection('audit_logs').doc();
      tx.set(auditRef, {
        userId: targetAuthUser.uid,
        userEmail: targetAuthUser.email || options.email,
        action: 'update',
        module: 'admin',
        recordId: targetAuthUser.uid,
        details: {
          operation: 'bootstrap_first_admin',
          targetEmail: targetAuthUser.email || options.email,
          role: 'admin',
          newStatus: 'approved',
        },
        timestamp: now,
      });
    }

    return {
      status: isAlreadySameAdmin ? ('idempotent_noop' as const) : ('initialized' as const),
    };
  });

  if (result.status === 'already_exists_other') {
    console.error(
      `[Bootstrap Admin] ABORTADO: Ya existe un administrador inicial registrado (${result.existingAdmin}). ` +
        'Por seguridad no se permite crear múltiples administradores iniciales mediante bootstrap. ' +
        'Inicie sesión con la cuenta administradora existente y utilice el módulo de Administración (/admin).',
    );
    process.exitCode = 1;
    return;
  }

  // Sincronizar Firebase Custom Claims con el perfil en Firestore
  await auth.setCustomUserClaims(targetAuthUser.uid, {
    role: 'admin',
    status: 'approved',
  });

  if (result.status === 'idempotent_noop') {
    console.log(
      `[Bootstrap Admin] IDEMPOTENTE: El usuario ${options.email} (UID: ${targetAuthUser.uid}) ` +
        'ya estaba designado como primer administrador. Custom Claims y perfil en Firestore verificados.',
    );
  } else {
    console.log(
      `[Bootstrap Admin] ÉXITO: Se inicializó a ${options.email} (UID: ${targetAuthUser.uid}) ` +
        'como primer administrador del sistema con estado "approved", rol "admin" y Custom Claims sincronizados.',
    );
  }
}

if (require.main === module) {
  runBootstrapFirstAdmin().catch((err: unknown) => {
    console.error(
      '[Bootstrap Admin] Error:',
      err instanceof Error ? err.message : String(err),
    );
    process.exit(1);
  });
}
