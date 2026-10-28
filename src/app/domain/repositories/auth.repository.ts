import { AppUser } from '../entities/user.entity';

export type AuthStateListener = (user: AppUser | null) => void;
export type Unsubscribe = () => void;

/** Contrato de autenticación y sesión. La implementación vive en infraestructura. */
export abstract class AuthRepository {
  abstract getCurrentUser(): AppUser | null;
  abstract waitForInitialState(): Promise<AppUser | null>;
  /** Notifica el estado inicial de Firebase y cada cambio posterior de sesión. */
  abstract observeAuthState(listener: AuthStateListener): Unsubscribe;
  abstract login(email: string, password: string): Promise<void>;
  abstract register(displayName: string, email: string, password: string): Promise<void>;
  abstract logout(): Promise<void>;
}
