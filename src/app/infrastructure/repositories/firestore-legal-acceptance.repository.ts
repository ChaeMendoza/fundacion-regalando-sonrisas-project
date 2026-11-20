import { Injectable, inject } from '@angular/core';
import { doc, getDoc, serverTimestamp, setDoc } from 'firebase/firestore';
import {
  LEGAL_DOCUMENT_VERSIONS,
  LegalAcceptanceRecord,
} from '../../domain/entities/legal-document.entity';
import { LegalAcceptanceRepository } from '../../domain/repositories/legal-acceptance.repository';
import { FirebaseAppService } from '../firebase/firebase-app.service';

/**
 * Evidencias de aceptación por versión de documentos.
 *
 * Se guarda un documento distinto por par de versiones para no sobrescribir
 * aceptaciones históricas cuando se publique una versión nueva.
 */
@Injectable({ providedIn: 'root' })
export class FirestoreLegalAcceptanceRepository extends LegalAcceptanceRepository {
  private readonly firebaseAppService = inject(FirebaseAppService);

  async create(record: LegalAcceptanceRecord): Promise<void> {
    const acceptanceId = `${record.uid}_${record.termsVersion}_${record.privacyVersion}`;
    const reference = doc(
      this.firebaseAppService.firestore,
      'users',
      record.uid,
      'legal_acceptances',
      acceptanceId,
    );

    await setDoc(reference, {
      uid: record.uid,
      termsVersion: record.termsVersion,
      privacyVersion: record.privacyVersion,
      termsAccepted: record.termsAccepted,
      privacyInformationAcknowledged: record.privacyInformationAcknowledged,
      acceptedAt: serverTimestamp(),
    });
  }

  async hasCurrentAcceptance(uid: string): Promise<boolean> {
    const acceptanceId = `${uid}_${LEGAL_DOCUMENT_VERSIONS.terms}_${LEGAL_DOCUMENT_VERSIONS.privacy}`;
    const reference = doc(
      this.firebaseAppService.firestore,
      'users',
      uid,
      'legal_acceptances',
      acceptanceId,
    );
    const snapshot = await getDoc(reference);

    return snapshot.exists();
  }
}
