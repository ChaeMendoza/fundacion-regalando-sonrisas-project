import { Component, computed, effect, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { SessionStore } from '../../state/session.store';

@Component({
  selector: 'app-pending-access',
  standalone: true,
  imports: [RouterLink],
  template: `
    <main class="pending-page">
      <section class="pending-card" aria-labelledby="pending-title">
        <a routerLink="/" class="pending-brand">
          <img src="images/logo-fundacion.jpg" alt="" />
          <span>Fundación Regalando Sonrisas</span>
        </a>

        <div
          class="pending-icon"
          [class.pending-icon--danger]="status() === 'rejected' || status() === 'disabled'"
          aria-hidden="true"
        >
          {{ statusIcon() }}
        </div>
        <h1 id="pending-title">{{ statusTitle() }}</h1>
        <p>
          La cuenta
          @if (session.currentUser(); as user) {
            <strong>{{ user.email }}</strong>
          }
          {{ statusDescription() }}
        </p>

        @if (session.currentUser()?.rejectionReason; as reason) {
          <p class="pending-reason"><strong>Observación del administrador:</strong> {{ reason }}</p>
        } @else {
          <p class="pending-note">
            {{ statusNote() }}
          </p>
        }

        @if (errorMessage()) {
          <p class="pending-error" role="alert">{{ errorMessage() }}</p>
        }

        @if (session.isApproved()) {
          <a routerLink="/dashboard" class="pending-button pending-button--link">
            Ingresar al Sistema de Gestión
          </a>
        }

        <button type="button" class="pending-button" [disabled]="loading()" (click)="signOut()">
          {{ loading() ? 'Cerrando sesión…' : 'Cerrar sesión' }}
        </button>
        <a routerLink="/" class="pending-link">← Volver al portal institucional</a>
      </section>
    </main>
  `,
  styles: [
    `
      .pending-page {
        min-height: 100vh;
        display: grid;
        place-items: center;
        padding: 2rem 1rem;
        background:
          radial-gradient(ellipse at top left, rgba(2, 132, 199, 0.1), transparent 40%),
          var(--surface-bg, #f8fafc);
      }

      .pending-card {
        width: min(100%, 32rem);
        padding: clamp(1.5rem, 5vw, 2.5rem);
        text-align: center;
        background: var(--surface-card, #fff);
        border: 1px solid var(--border-color, #e2e8f0);
        border-radius: 1rem;
        box-shadow: 0 16px 48px rgba(15, 23, 42, 0.08);
      }

      .pending-brand {
        display: inline-flex;
        align-items: center;
        gap: 0.75rem;
        color: var(--text-primary, #0f172a);
        font-weight: 700;
      }

      .pending-brand img {
        width: 3rem;
        height: 3rem;
        object-fit: contain;
        border-radius: 0.5rem;
      }

      .pending-icon {
        display: grid;
        place-items: center;
        width: 4rem;
        height: 4rem;
        margin: 2rem auto 1rem;
        border-radius: 50%;
        background: #fef3c7;
        color: #92400e;
        font-size: 2rem;

        &--danger {
          background: #fee2e2;
          color: #b91c1c;
        }
      }

      h1 {
        margin: 0;
        font-size: clamp(1.5rem, 5vw, 1.9rem);
        line-height: 1.25;
      }

      p {
        color: var(--text-secondary, #475569);
        line-height: 1.65;
      }

      .pending-note {
        padding: 0.8rem;
        border-radius: 0.5rem;
        background: #eff6ff;
        color: #1e3a8a;
        font-size: 0.9rem;
      }

      .pending-reason {
        padding: 0.8rem;
        border-radius: 0.5rem;
        background: #fef2f2;
        border: 1px solid #fecaca;
        color: #991b1b;
        font-size: 0.9rem;
      }

      .pending-error {
        color: var(--danger, #dc2626);
      }

      .pending-button {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        width: 100%;
        min-height: 3rem;
        margin-top: 0.5rem;
        border: 0;
        border-radius: 0.5rem;
        background: var(--primary, #0284c7);
        color: white;
        font: inherit;
        font-weight: 700;
        cursor: pointer;
        text-decoration: none;

        &--link {
          background: var(--success, #16a34a);
          margin-bottom: 0.5rem;
        }
      }

      .pending-button:disabled {
        opacity: 0.65;
        cursor: wait;
      }

      .pending-link {
        display: inline-block;
        margin-top: 1.25rem;
        color: var(--text-secondary, #475569);
      }
    `,
  ],
})
export class PendingAccessComponent {
  private readonly router = inject(Router);
  readonly session = inject(SessionStore);
  readonly loading = signal(false);
  readonly errorMessage = signal('');

  readonly status = computed(() => this.session.currentUser()?.status ?? 'pending');

  readonly statusIcon = computed(() => {
    switch (this.status()) {
      case 'rejected':
        return '✕';
      case 'disabled':
        return '⊘';
      case 'approved':
        return '✓';
      default:
        return '⌛';
    }
  });

  readonly statusTitle = computed(() => {
    switch (this.status()) {
      case 'rejected':
        return 'Solicitud de acceso rechazada';
      case 'disabled':
        return 'Cuenta deshabilitada';
      case 'approved':
        return 'Cuenta aprobada';
      default:
        return 'Acceso pendiente de aprobación';
    }
  });

  readonly statusDescription = computed(() => {
    switch (this.status()) {
      case 'rejected':
        return 'no fue autorizada para acceder a los módulos internos del sistema.';
      case 'disabled':
        return 'ha sido deshabilitada por un administrador de la Fundación.';
      case 'approved':
        return 'ya cuenta con autorización activa para acceder al sistema.';
      default:
        return 'se encuentra registrada y pendiente de revisión por parte de un administrador de la Fundación.';
    }
  });

  readonly statusNote = computed(() => {
    switch (this.status()) {
      case 'rejected':
        return 'Si consideras que se trata de un error, comunícate con la administración de la Fundación Regalando Sonrisas.';
      case 'disabled':
        return 'El acceso a los módulos internos se encuentra suspendido. Contacta al administrador si requieres reactivar tu cuenta.';
      default:
        return 'Una vez que un administrador apruebe tu solicitud en el panel de gestión, podrás acceder a los módulos internos automáticamente.';
    }
  });

  constructor() {
    effect(() => {
      if (this.session.isInitialized() && this.session.isApproved()) {
        void this.router.navigate([this.session.homeRoute()]);
      }
    });
  }

  async signOut(): Promise<void> {
    this.errorMessage.set('');
    this.loading.set(true);
    try {
      await this.session.logout();
      await this.router.navigate(['/login']);
    } catch (error) {
      console.error('No se pudo cerrar la sesión:', error);
      this.errorMessage.set('No se pudo cerrar la sesión. Inténtalo de nuevo.');
    } finally {
      this.loading.set(false);
    }
  }
}
