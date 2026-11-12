import { Injectable, OnDestroy, computed, inject, signal } from '@angular/core';
import { AppUser, UserRole } from '../../domain/entities/user.entity';
import { LoginUseCase } from '../../application/use-cases/auth/login.use-case';
import { LogoutUseCase } from '../../application/use-cases/auth/logout.use-case';
import { RegisterUseCase } from '../../application/use-cases/auth/register.use-case';
import { ObserveSessionUseCase } from '../../application/use-cases/auth/observe-session.use-case';
import { SendPasswordResetEmailUseCase } from '../../application/use-cases/auth/send-password-reset-email.use-case';

/** Estado reactivo (signals) de la sesión para la UI. */
@Injectable({ providedIn: 'root' })
export class SessionStore implements OnDestroy {
  private readonly loginUseCase = inject(LoginUseCase);
  private readonly logoutUseCase = inject(LogoutUseCase);
  private readonly registerUseCase = inject(RegisterUseCase);
  private readonly observeSession = inject(ObserveSessionUseCase);
  private readonly sendPasswordResetEmailUseCase = inject(SendPasswordResetEmailUseCase);
  private readonly user = signal<AppUser | null>(null);
  private readonly initialized = signal(false);
  private readonly authStatus = signal<
    'initializing' | 'authenticated' | 'unauthenticated' | 'error'
  >('initializing');
  private readonly authError = signal<string | null>(null);
  private readonly unsubscribe = this.observeSession.execute((user, error) => {
    this.user.set(user);
    if (error) {
      this.authStatus.set('error');
      this.authError.set(
        'No fue posible verificar la sesión. Recarga la página para intentarlo de nuevo.',
      );
      return;
    }

    this.authStatus.set(user ? 'authenticated' : 'unauthenticated');
    this.authError.set(null);
  });
  private readonly initialState = this.observeSession.waitForInitialState().then(
    (user) => {
      this.user.set(user);
      if (this.authStatus() !== 'error') {
        this.authStatus.set(user ? 'authenticated' : 'unauthenticated');
      }
      this.initialized.set(true);
      return user;
    },
    (err: unknown) => {
      console.error('No se pudo recuperar el estado inicial de la sesión:', err);
      this.authStatus.set('error');
      this.authError.set(
        'No fue posible verificar la sesión. Recarga la página para intentarlo de nuevo.',
      );
      this.initialized.set(true);
      return null;
    },
  );

  readonly currentUser = this.user.asReadonly();
  readonly isAuthenticated = computed(() => this.user() !== null);
  readonly isInitialized = this.initialized.asReadonly();
  readonly sessionStatus = this.authStatus.asReadonly();
  readonly sessionError = this.authError.asReadonly();
  readonly userRole = computed<UserRole | null>(() => this.user()?.role ?? null);
  readonly isAdmin = computed(() => this.user()?.role === 'admin');

  waitUntilInitialized(): Promise<AppUser | null> {
    return this.initialState;
  }

  login(email: string, password: string): Promise<void> {
    return this.loginUseCase.execute(email, password);
  }

  register(displayName: string, email: string, password: string): Promise<void> {
    return this.registerUseCase.execute(displayName, email, password);
  }

  logout(): Promise<void> {
    return this.logoutUseCase.execute();
  }

  sendPasswordResetEmail(email: string): Promise<void> {
    return this.sendPasswordResetEmailUseCase.execute(email);
  }

  ngOnDestroy(): void {
    this.unsubscribe();
  }
}
