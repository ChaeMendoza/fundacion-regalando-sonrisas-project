import { LegalAcceptanceRecord } from '../entities/legal-document.entity';

/**
 * Contrato para dejar constancia de la aceptación de los documentos institucionales.
 * La fecha de aceptación la genera el servidor, nunca el cliente.
 */
export abstract class LegalAcceptanceRepository {
  abstract create(record: LegalAcceptanceRecord): Promise<void>;
  abstract hasCurrentAcceptance(uid: string): Promise<boolean>;
}
