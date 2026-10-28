import { Injectable, OnDestroy, computed, inject, signal } from '@angular/core';
import { AppUser, UserRole } from '../../domain/entities/user.entity';
import { LoginUseCase } from '../../application/use-cases/auth/login.use-case';
import { LogoutUseCase } from '../../application/use-cases/auth/logout.use-case';
import { ObserveSessionUseCase } from '../../application/use-cases/auth/observe-session.use-case';

/** Estado reactivo (signals) de la sesión para la UI. */
@Injectable({ providedIn: 'root' })
export class SessionStore implements OnDestroy {
  private readonly loginUseCase = inject(LoginUseCase);
  private readonly logoutUseCase = inject(LogoutUseCase);
  private readonly user = signal<AppUser | null>(null);
  private readonly unsubscribe = inject(ObserveSessionUseCase).execute((u) => this.user.set(u));

  readonly currentUser = this.user.asReadonly();
  readonly isAuthenticated = computed(() => this.user() !== null);
  readonly userRole = computed<UserRole | null>(() => this.user()?.role ?? null);
  readonly isAdmin = computed(() => this.user()?.role === 'admin');

  login(email: string, password: string): Promise<void> {
    return this.loginUseCase.execute(email, password);
  }

  logout(): Promise<void> {
    return this.logoutUseCase.execute();
  }

  ngOnDestroy(): void {
    this.unsubscribe();
  }
}
