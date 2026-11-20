import { LEGAL_DOCUMENT_VERSIONS } from '../../../domain/entities/legal-document.entity';
import { AuthRepository } from '../../../domain/repositories/auth.repository';
import { LegalAcceptanceRequiredError, RegisterUseCase } from './register.use-case';

describe('RegisterUseCase', () => {
  const register = vi.fn(async () => undefined);
  let auth: AuthRepository;
  let useCase: RegisterUseCase;

  beforeEach(() => {
    register.mockReset();
    auth = {
      getCurrentUser: vi.fn(() => null),
      waitForInitialState: vi.fn(async () => null),
      observeAuthState: vi.fn(() => () => undefined),
      login: vi.fn(async () => undefined),
      register,
      logout: vi.fn(async () => undefined),
      sendPasswordResetEmail: vi.fn(async () => undefined),
    } as unknown as AuthRepository;
    useCase = new RegisterUseCase(auth);
  });

  const validConfirmation = { termsAccepted: true, privacyInformationAcknowledged: true };

  it('rechaza el registro cuando falta la aceptación de los términos', async () => {
    await expect(
      useCase.execute('Nombre', 'correo@ejemplo.com', 'clave123', {
        termsAccepted: false,
        privacyInformationAcknowledged: true,
      }),
    ).rejects.toBeInstanceOf(LegalAcceptanceRequiredError);
    expect(register).not.toHaveBeenCalled();
  });

  it('rechaza el registro cuando falta la constancia de privacidad', async () => {
    await expect(
      useCase.execute('Nombre', 'correo@ejemplo.com', 'clave123', {
        termsAccepted: true,
        privacyInformationAcknowledged: false,
      }),
    ).rejects.toBeInstanceOf(LegalAcceptanceRequiredError);
    expect(register).not.toHaveBeenCalled();
  });

  it('rechaza el registro si no se entregan las manifestaciones', async () => {
    await expect(
      useCase.execute('Nombre', 'correo@ejemplo.com', 'clave123', undefined),
    ).rejects.toBeInstanceOf(LegalAcceptanceRequiredError);
    expect(register).not.toHaveBeenCalled();
  });

  it('envía las versiones vigentes cuando ambas manifestaciones están presentes', async () => {
    await useCase.execute('Nombre', 'correo@ejemplo.com', 'clave123', validConfirmation);

    expect(register).toHaveBeenCalledWith('Nombre', 'correo@ejemplo.com', 'clave123', {
      termsVersion: LEGAL_DOCUMENT_VERSIONS.terms,
      privacyVersion: LEGAL_DOCUMENT_VERSIONS.privacy,
    });
  });
});
