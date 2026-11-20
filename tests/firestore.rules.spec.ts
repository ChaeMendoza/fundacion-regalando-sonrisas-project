import { readFileSync } from 'node:fs';
import { LEGAL_DOCUMENT_VERSIONS } from '../src/app/domain/entities/legal-document.entity';
import {
  assertFails,
  assertSucceeds,
  initializeTestEnvironment,
  type RulesTestEnvironment,
} from '@firebase/rules-unit-testing';
import {
  addDoc,
  collection,
  collectionGroup,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  query,
  serverTimestamp,
  setDoc,
  Timestamp,
  updateDoc,
  where,
} from 'firebase/firestore';

const INSTITUTIONAL_COLLECTIONS = [
  'beneficiaries',
  'donations',
  'donors',
  'volunteers',
  'activities',
  'documents',
  'requests',
] as const;

describe('Firestore Security Rules - Fundación Regalando Sonrisas', () => {
  let testEnv: RulesTestEnvironment;

  beforeAll(async () => {
    const rules = readFileSync('firestore.rules', 'utf8');

    // Las versiones deben permanecer sincronizadas entre la aplicación y las
    // reglas; de lo contrario el cliente no podría registrar nuevas evidencias.
    expect(rules).toContain(`termsVersion == '${LEGAL_DOCUMENT_VERSIONS.terms}'`);
    expect(rules).toContain(`privacyVersion == '${LEGAL_DOCUMENT_VERSIONS.privacy}'`);

    testEnv = await initializeTestEnvironment({
      projectId: 'demo-regalando-sonrisas',
      firestore: { rules },
    });
  });

  afterAll(async () => {
    await testEnv.cleanup();
  });

  beforeEach(async () => {
    await testEnv.clearFirestore();
    await testEnv.withSecurityRulesDisabled(async (context) => {
      const db = context.firestore();
      const profiles = [
        {
          uid: 'admin-1',
          email: 'admin@fundacion.org',
          role: 'admin',
          status: 'approved',
        },
        {
          uid: 'admin-2',
          email: 'admin2@fundacion.org',
          role: 'admin',
          status: 'approved',
        },
        {
          uid: 'user-1',
          email: 'user@fundacion.org',
          role: 'user',
          status: 'approved',
        },
        {
          uid: 'user-2',
          email: 'user2@fundacion.org',
          role: 'user',
          status: 'approved',
        },
        {
          uid: 'pending-1',
          email: 'pending@fundacion.org',
          role: 'user',
          status: 'pending',
        },
      ];

      for (const profile of profiles) {
        await setDoc(doc(db, 'users', profile.uid), {
          ...profile,
          displayName: profile.uid,
          updatedBy: 'system:bootstrap',
        });
      }

      for (const name of INSTITUTIONAL_COLLECTIONS) {
        await setDoc(doc(db, name, `${name}-1`), {
          createdBy: 'admin-1',
          updatedBy: 'admin-1',
          isActive: true,
        });
      }

      await setDoc(doc(db, 'audit_logs', 'log-1'), {
        userId: 'admin-1',
        userEmail: 'admin@fundacion.org',
        action: 'update',
        module: 'admin',
        timestamp: '2026-01-01T00:00:00.000Z',
      });

      await setDoc(doc(db, 'system_config', 'bootstrap'), { initialized: true });
    });
  });

  const adminClaims = () =>
    testEnv.authenticatedContext('admin-1', { role: 'admin', status: 'approved' });
  const regularUser = () =>
    testEnv.authenticatedContext('user-1', { role: 'user', status: 'approved' });
  const approvedUserWithoutClaims = () => testEnv.authenticatedContext('user-2');
  const adminWithoutClaims = () => testEnv.authenticatedContext('admin-2');
  const unauthenticated = () => testEnv.unauthenticatedContext();

  it('allows an authenticated admin with claims to use every management module', async () => {
    const db = adminClaims().firestore();

    for (const name of [...INSTITUTIONAL_COLLECTIONS, 'users', 'audit_logs', 'system_config']) {
      await assertSucceeds(getDocs(collection(db, name)));
    }

    for (const name of INSTITUTIONAL_COLLECTIONS) {
      await assertSucceeds(getDoc(doc(db, name, `${name}-1`)));
      await assertSucceeds(
        addDoc(collection(db, name), { createdBy: 'admin-1', updatedBy: 'admin-1' }),
      );
      await assertSucceeds(
        updateDoc(doc(db, name, `${name}-1`), { updatedBy: 'admin-1', isActive: false }),
      );
      await assertFails(deleteDoc(doc(db, name, `${name}-1`)));
    }
  });

  it('lets the admin manage roles and statuses without allowing self-demotion', async () => {
    const db = adminClaims().firestore();

    await assertSucceeds(
      updateDoc(doc(db, 'users', 'user-1'), {
        role: 'admin',
        status: 'approved',
        updatedBy: 'admin-1',
      }),
    );
    await assertSucceeds(
      updateDoc(doc(db, 'users', 'pending-1'), {
        role: 'user',
        status: 'approved',
        approvedBy: 'admin@fundacion.org',
        updatedBy: 'admin-1',
      }),
    );
    await assertFails(
      updateDoc(doc(db, 'users', 'admin-1'), { role: 'user', updatedBy: 'admin-1' }),
    );
  });

  it('keeps the Firestore profile as a fallback for individual admin reads and writes', async () => {
    const db = adminWithoutClaims().firestore();

    await assertSucceeds(getDoc(doc(db, 'beneficiaries', 'beneficiaries-1')));
    await assertSucceeds(
      updateDoc(doc(db, 'beneficiaries', 'beneficiaries-1'), { updatedBy: 'admin-2' }),
    );
    // Las consultas a colección no pueden evaluar get(); requieren Custom Claims.
    await assertFails(getDocs(collection(db, 'beneficiaries')));
  });

  it('does not honor stale admin claims for individual reads or writes', async () => {
    await testEnv.withSecurityRulesDisabled(async (context) => {
      await setDoc(doc(context.firestore(), 'users', 'admin-1'), {
        uid: 'admin-1',
        email: 'admin@fundacion.org',
        displayName: 'admin-1',
        role: 'user',
        status: 'approved',
        updatedBy: 'admin-1',
      });
    });

    const db = adminClaims().firestore();
    await assertFails(getDoc(doc(db, 'beneficiaries', 'beneficiaries-1')));
    await assertFails(
      updateDoc(doc(db, 'beneficiaries', 'beneficiaries-1'), { updatedBy: 'admin-1' }),
    );
    await assertFails(
      updateDoc(doc(db, 'users', 'user-1'), { role: 'admin', updatedBy: 'admin-1' }),
    );
  });

  it('restricts a regular user to their own profile and non-privileged fields', async () => {
    const db = regularUser().firestore();

    await assertSucceeds(getDoc(doc(db, 'users', 'user-1')));
    await assertFails(getDoc(doc(db, 'users', 'user-2')));
    await assertFails(getDocs(collection(db, 'users')));

    await assertSucceeds(
      updateDoc(doc(db, 'users', 'user-1'), {
        displayName: 'Nombre actualizado',
        phoneNumber: '0991234567',
        updatedBy: 'user-1',
      }),
    );

    // Elevación directa de privilegios manipulando la petición a Firestore.
    await assertFails(
      updateDoc(doc(db, 'users', 'user-1'), { role: 'admin', updatedBy: 'user-1' }),
    );
    await assertFails(
      updateDoc(doc(db, 'users', 'user-1'), { status: 'pending', updatedBy: 'user-1' }),
    );
    await assertFails(
      updateDoc(doc(db, 'users', 'user-1'), { approvedBy: 'user-1', updatedBy: 'user-1' }),
    );
    await assertFails(deleteDoc(doc(db, 'users', 'user-1')));
  });

  it('blocks a regular user from reading or writing institutional modules', async () => {
    const db = regularUser().firestore();

    for (const name of INSTITUTIONAL_COLLECTIONS) {
      await assertFails(getDocs(collection(db, name)));
      await assertFails(getDoc(doc(db, name, `${name}-1`)));
      await assertFails(
        addDoc(collection(db, name), { createdBy: 'user-1', updatedBy: 'user-1' }),
      );
      await assertFails(
        updateDoc(doc(db, name, `${name}-1`), { updatedBy: 'user-1', isActive: false }),
      );
    }

    await assertFails(getDocs(collection(db, 'audit_logs')));
    await assertFails(getDoc(doc(db, 'system_config', 'bootstrap')));
    await assertFails(
      updateDoc(doc(db, 'system_config', 'bootstrap'), { initialized: false }),
    );
  });

  it('only lets a caller append audit events about themselves and never mutate the log', async () => {
    const db = regularUser().firestore();

    await assertFails(
      addDoc(collection(db, 'audit_logs'), {
        userId: 'user-2',
        userEmail: 'otro@fundacion.org',
        action: 'update',
        module: 'admin',
        timestamp: '2026-01-01T00:00:00.000Z',
      }),
    );
    await assertSucceeds(
      addDoc(collection(db, 'audit_logs'), {
        userId: 'user-1',
        userEmail: 'user@fundacion.org',
        action: 'update',
        module: 'profile',
        timestamp: '2026-01-01T00:00:00.000Z',
      }),
    );
    await assertFails(
      updateDoc(doc(db, 'audit_logs', 'log-1'), { action: 'delete' }),
    );
    await assertFails(deleteDoc(doc(db, 'audit_logs', 'log-1')));
  });

  it('supports approved users whose claims were not synchronized yet', async () => {
    const db = approvedUserWithoutClaims().firestore();

    await assertSucceeds(getDoc(doc(db, 'users', 'user-2')));
    await assertSucceeds(
      updateDoc(doc(db, 'users', 'user-2'), { displayName: 'Sin claims', updatedBy: 'user-2' }),
    );
    await assertFails(getDoc(doc(db, 'beneficiaries', 'beneficiaries-1')));
    await assertFails(
      addDoc(collection(db, 'audit_logs'), {
        userId: 'otro',
        userEmail: 'otro@fundacion.org',
        action: 'update',
        module: 'profile',
        timestamp: '2026-01-01T00:00:00.000Z',
      }),
    );
  });

  it('denies all protected data to unauthenticated requests', async () => {
    const db = unauthenticated().firestore();

    await assertFails(getDoc(doc(db, 'users', 'admin-1')));
    await assertFails(getDocs(collection(db, 'users')));
    await assertFails(getDoc(doc(db, 'donations', 'donations-1')));
    await assertFails(addDoc(collection(db, 'donations'), { createdBy: 'anonymous' }));
    await assertFails(addDoc(collection(db, 'audit_logs'), { userId: 'anonymous' }));
    await assertFails(getDoc(doc(db, 'system_config', 'bootstrap')));
  });

  describe('legal acceptance evidence', () => {
    const acceptancePath = (uid: string) => `users/${uid}/legal_acceptances/${uid}_1.0_1.0`;

    const validPayload = (uid: string) => ({
      uid,
      termsVersion: '1.0',
      privacyVersion: '1.0',
      termsAccepted: true,
      privacyInformationAcknowledged: true,
      acceptedAt: serverTimestamp(),
    });

    it('lets a user create only their own evidence with the current versions', async () => {
      const db = regularUser().firestore();
      await assertSucceeds(setDoc(doc(db, acceptancePath('user-1')), validPayload('user-1')));

      const saved = await getDoc(doc(db, acceptancePath('user-1')));
      expect(saved.data()?.['termsVersion']).toBe('1.0');
      expect(saved.data()?.['privacyInformationAcknowledged']).toBe(true);
    });

    it('rejects evidence for another user', async () => {
      const db = regularUser().firestore();
      await assertFails(setDoc(doc(db, acceptancePath('user-2')), validPayload('user-2')));
      await assertFails(
        setDoc(doc(db, 'users', 'user-2', 'legal_acceptances', 'forged'), validPayload('user-1')),
      );
    });

    it('rejects forged versions, statuses or extra fields', async () => {
      const db = regularUser().firestore();
      const ref = doc(db, acceptancePath('user-1'));

      await assertFails(setDoc(ref, { ...validPayload('user-1'), termsVersion: '9.9' }));
      await assertFails(setDoc(ref, { ...validPayload('user-1'), privacyVersion: '9.9' }));
      await assertFails(setDoc(ref, { ...validPayload('user-1'), termsAccepted: false }));
      await assertFails(
        setDoc(ref, { ...validPayload('user-1'), privacyInformationAcknowledged: false }),
      );
      await assertFails(setDoc(ref, { ...validPayload('user-1'), unexpected: 'data' }));
      await assertFails(
        setDoc(
          doc(db, 'users', 'user-1', 'legal_acceptances', 'arbitrary-id'),
          validPayload('user-1'),
        ),
      );
    });

    it('rejects a client-provided acceptance date', async () => {
      const db = regularUser().firestore();
      await assertFails(
        setDoc(doc(db, acceptancePath('user-1')), {
          ...validPayload('user-1'),
          acceptedAt: Timestamp.fromDate(new Date('2020-01-01T00:00:00.000Z')),
        }),
      );
    });

    it('keeps evidence immutable and readable only by its owner or an admin', async () => {
      const seededAt = Timestamp.fromDate(new Date('2026-01-01T00:00:00.000Z'));
      await testEnv.withSecurityRulesDisabled(async (context) => {
        await setDoc(doc(context.firestore(), acceptancePath('user-1')), {
          ...validPayload('user-1'),
          acceptedAt: seededAt,
        });
      });

      const ownerDb = regularUser().firestore();
      const otherDb = testEnv.authenticatedContext('user-2').firestore();
      const adminDb = adminClaims().firestore();

      await assertSucceeds(getDoc(doc(ownerDb, acceptancePath('user-1'))));
      await assertFails(getDoc(doc(otherDb, acceptancePath('user-1'))));
      await assertSucceeds(getDoc(doc(adminDb, acceptancePath('user-1'))));
      await assertSucceeds(
        getDocs(query(collectionGroup(adminDb, 'legal_acceptances'), where('uid', '==', 'user-1'))),
      );
      await assertFails(updateDoc(doc(ownerDb, acceptancePath('user-1')), { termsVersion: '9.9' }));
      await assertFails(deleteDoc(doc(ownerDb, acceptancePath('user-1'))));
      await assertFails(deleteDoc(doc(adminDb, acceptancePath('user-1'))));
    });

    it('does not allow unauthenticated reads or writes of evidence', async () => {
      const db = unauthenticated().firestore();
      await assertFails(getDoc(doc(db, acceptancePath('user-1'))));
      await assertFails(setDoc(doc(db, acceptancePath('user-1')), validPayload('user-1')));
    });
  });
});
