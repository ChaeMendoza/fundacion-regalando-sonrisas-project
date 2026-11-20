/**
 * Versiones de los documentos institucionales públicos.
 *
 * Estas constantes se usan para:
 * - mostrar la versión vigente en cada página;
 * - registrar la evidencia de aceptación durante el registro;
 * - validar las evidencias desde las reglas de Firestore.
 *
 * Si se publica una versión sustancialmente nueva, actualizar este archivo,
 * las reglas `firestore.rules` y el texto del documento en la misma entrega.
 */
export const LEGAL_DOCUMENT_VERSIONS = {
  terms: '1.0',
  privacy: '1.0',
} as const;

export type LegalDocumentKey = keyof typeof LEGAL_DOCUMENT_VERSIONS;

export const LEGAL_DOCUMENT_LAST_UPDATED = '20 de noviembre de 2026';

export interface LegalAcceptanceVersions {
  readonly termsVersion: string;
  readonly privacyVersion: string;
}

export interface LegalAcceptanceConfirmation {
  readonly termsAccepted: boolean;
  readonly privacyInformationAcknowledged: boolean;
}

/** Datos mínimos y verificables de la aceptación de los documentos institucionales. */
export interface LegalAcceptanceRecord extends LegalAcceptanceVersions {
  readonly uid: string;
  readonly termsAccepted: boolean;
  readonly privacyInformationAcknowledged: boolean;
}
