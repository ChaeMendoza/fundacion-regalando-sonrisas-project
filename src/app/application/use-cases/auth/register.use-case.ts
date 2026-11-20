import {
  LEGAL_DOCUMENT_VERSIONS,
  LegalAcceptanceConfirmation,
} from '../../../domain/entities/legal-document.entity';
import { AuthRepository } from '../../../domain/repositories/auth.repository';

export class LegalAcceptanceRequiredError extends Error {
  constructor() {
    super('Debe aceptar los Términos y Condiciones de Uso y confirmar la información de privacidad.');
    this.name = 'LegalAcceptanceRequiredError';
  }
}

export class RegisterUseCase {
  constructor(private readonly auth: AuthRepository) {}

  execute(
    displayName: string,
    email: string,
    password: string,
    confirmation: LegalAcceptanceConfirmation | undefined,
  ): Promise<void> {
    // Validación de la capa de aplicación: el registro no puede iniciarse sin
    // las dos manifestaciones obligatorias, aunque se llame al caso de uso
    // directamente desde otra vista o desde una prueba.
    if (!confirmation?.termsAccepted || !confirmation.privacyInformationAcknowledged) {
      return Promise.reject(new LegalAcceptanceRequiredError());
    }

    return this.auth.register(displayName, email, password, {
      termsVersion: LEGAL_DOCUMENT_VERSIONS.terms,
      privacyVersion: LEGAL_DOCUMENT_VERSIONS.privacy,
    });
  }
}
