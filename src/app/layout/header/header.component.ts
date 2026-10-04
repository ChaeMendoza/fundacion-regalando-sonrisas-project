import { Component, inject, output } from '@angular/core';
import { AuthService } from '../../core/services/firebase/auth.service';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-header',
  standalone: true,
  template: `
    <header class="app-header">
      <div class="app-header__left">
        <button
          type="button"
          class="app-header__menu-btn"
          aria-label="Abrir menú de navegación"
          (click)="toggleMenu.emit()"
        >
          <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
          </svg>
        </button>

        <div class="app-header__location">
          <span class="app-header__org">Fundación Regalando Sonrisas</span>
          <span class="app-header__city">Quito, Ecuador</span>
        </div>
      </div>

      <div class="app-header__right">
        <!-- Indicador de Entorno -->
        <span
          class="app-header__env-badge"
          [class.app-header__env-badge--prod]="environment.production"
        >
          {{ environment.production ? 'Producción' : 'Desarrollo' }}
        </span>

        <!-- Perfil de Usuario -->
        <div class="app-header__user">
          <div class="app-header__user-avatar">
            {{ userInitials() }}
          </div>
          <div class="app-header__user-info">
            <span class="app-header__user-name">{{ currentUser()?.displayName || 'Usuario' }}</span>
            <span class="app-header__user-role">{{ formatRole(currentUser()?.role) }}</span>
          </div>
        </div>
      </div>
    </header>
  `,
  styles: [`
    .app-header {
      height: var(--header-height, 64px);
      background-color: var(--surface-card, #ffffff);
      border-bottom: 1px solid var(--border-color, #e2e8f0);
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0 1.25rem;
      position: sticky;
      top: 0;
      z-index: 10;

      &__left {
        display: flex;
        align-items: center;
        gap: 1rem;
      }

      &__menu-btn {
        display: flex;
        align-items: center;
        justify-content: center;
        background: transparent;
        border: 1px solid var(--border-color, #e2e8f0);
        border-radius: 0.375rem;
        padding: 0.375rem;
        color: var(--text-secondary, #475569);
        cursor: pointer;

        @media (min-width: 1024px) {
          display: none;
        }

        &:hover {
          background-color: var(--surface-bg, #f8fafc);
        }
      }

      &__location {
        display: flex;
        flex-direction: column;
      }

      &__org {
        font-weight: 600;
        font-size: 0.9375rem;
        color: var(--text-primary, #0f172a);
        line-height: 1.2;
      }

      &__city {
        font-size: 0.75rem;
        color: var(--text-muted, #94a3b8);
      }

      &__right {
        display: flex;
        align-items: center;
        gap: 1rem;
      }

      &__env-badge {
        font-size: 0.6875rem;
        font-weight: 600;
        text-transform: uppercase;
        letter-spacing: 0.05em;
        padding: 0.25rem 0.5rem;
        border-radius: 0.25rem;
        background-color: #fef3c7;
        color: #b45309;

        &--prod {
          background-color: #dcfce7;
          color: #15803d;
        }
      }

      &__user {
        display: flex;
        align-items: center;
        gap: 0.625rem;
      }

      &__user-avatar {
        width: 2rem;
        height: 2rem;
        border-radius: 50%;
        background-color: #0284c7;
        color: #ffffff;
        font-size: 0.75rem;
        font-weight: 700;
        display: flex;
        align-items: center;
        justify-content: center;
      }

      &__user-info {
        display: none;
        flex-direction: column;

        @media (min-width: 640px) {
          display: flex;
        }
      }

      &__user-name {
        font-size: 0.8125rem;
        font-weight: 600;
        color: var(--text-primary, #0f172a);
        line-height: 1.2;
      }

      &__user-role {
        font-size: 0.6875rem;
        color: var(--text-secondary, #64748b);
      }
    }
  `],
})
export class HeaderComponent {
  private readonly authService = inject(AuthService);
  readonly environment = environment;

  readonly toggleMenu = output<void>();

  readonly currentUser = this.authService.currentUser;

  userInitials(): string {
    const name = this.currentUser()?.displayName || 'U';
    const parts = name.trim().split(' ');
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  }

  formatRole(role?: string): string {
    switch (role) {
      case 'admin':
        return 'Administrador';
      case 'volunteer':
        return 'Voluntario';
      case 'authorized_staff':
        return 'Personal Autorizado (Pendiente)';
      default:
        return 'Usuario';
    }
  }
}
