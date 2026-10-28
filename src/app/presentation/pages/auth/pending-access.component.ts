import { Component, inject, signal } from '@angular/core';
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

        <div class="pending-icon" aria-hidden="true">⌛</div>
        <h1 id="pending-title">Acceso pendiente de aprobación</h1>
        <p>
          La cuenta
          @if (session.currentUser(); as user) {
            <strong>{{ user.email }}</strong>
          }
          no tiene acceso activo al sistema. La asignación de acceso y roles requiere revisión de la
          Fundación.
        </p>
        <p class="pending-note">
          Por ahora, el registro crea una cuenta de autenticación pero no asigna permisos ni activa
          el acceso a los módulos internos.
        </p>

        @if (errorMessage()) {
          <p class="pending-error" role="alert">{{ errorMessage() }}</p>
        }

        <button type="button" class="pending-button" [disabled]="loading()" (click)="signOut()">
          {{ loading() ? 'Cerrando sesión…' : 'Cerrar sesión' }}
        </button>
        <a routerLink="/" class="pending-link">Volver al portal institucional</a>
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

      .pending-error {
        color: var(--danger, #dc2626);
      }

      .pending-button {
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
