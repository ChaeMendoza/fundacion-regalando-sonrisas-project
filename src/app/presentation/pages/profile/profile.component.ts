import { Component, OnInit, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { LogAuditEventUseCase } from '../../../application/use-cases/audit/log-audit-event.use-case';
import { UserProfileRepository } from '../../../domain/repositories/user-profile.repository';
import { AlertComponent } from '../../shared/components/alert/alert.component';
import { PageHeaderComponent } from '../../shared/components/page-header/page-header.component';
import { StatusBadgeComponent } from '../../shared/components/status-badge/status-badge.component';
import { NotificationService } from '../../shared/services/notification.service';
import { getFirebaseErrorMessage } from '../../shared/utils/firebase-error-message';
import { SessionStore } from '../../state/session.store';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [FormsModule, PageHeaderComponent, AlertComponent, StatusBadgeComponent],
  template: `
    <app-page-header
      title="Mi Perfil de Usuario"
      subtitle="Consulta y actualización de información personal y seguridad de tu cuenta"
      badgeText="Cuenta Activa"
      badgeType="success"
    />

    @if (feedbackMessage()) {
      <app-alert [type]="feedbackType()" [title]="feedbackTitle()">
        {{ feedbackMessage() }}
      </app-alert>
    }

    <div class="profile-grid">
      <section class="card profile-summary">
        <div class="profile-summary__avatar">{{ initials() }}</div>
        <h2 class="profile-summary__name">{{ user()?.displayName || 'Usuario' }}</h2>
        <p class="profile-summary__email">{{ user()?.email }}</p>

        <div class="profile-summary__badges">
          <app-status-badge [text]="formatRole(user()?.role)" variant="info" />
          <app-status-badge text="Acceso Aprobado" variant="success" />
        </div>

        <dl class="profile-summary__meta">
          <div>
            <dt>Identificador (UID)</dt>
            <dd class="mono">{{ user()?.uid }}</dd>
          </div>
          <div>
            <dt>Fecha de registro</dt>
            <dd>{{ formatDate(user()?.createdAt) }}</dd>
          </div>
          <div>
            <dt>Última actualización</dt>
            <dd>{{ formatDate(user()?.updatedAt) }}</dd>
          </div>
        </dl>
      </section>

      <section class="card profile-form-card">
        <h3 class="section-title">Información Personal</h3>
        <form (ngSubmit)="saveProfile()" #profileForm="ngForm" class="form-grid">
          <div class="form-field form-field--full">
            <label for="profile-name">Nombre completo *</label>
            <input
              id="profile-name"
              name="displayName"
              type="text"
              class="form-control"
              required
              minlength="3"
              maxlength="80"
              [(ngModel)]="displayName"
              placeholder="Ej. María Fernanda López"
            />
          </div>

          <div class="form-field">
            <label for="profile-email">Correo electrónico</label>
            <input
              id="profile-email"
              type="email"
              class="form-control"
              [value]="user()?.email || ''"
              disabled
            />
          </div>

          <div class="form-field">
            <label for="profile-phone">Teléfono de contacto</label>
            <input
              id="profile-phone"
              name="phoneNumber"
              type="tel"
              class="form-control"
              maxlength="20"
              [(ngModel)]="phoneNumber"
              placeholder="Ej. 0991234567"
            />
          </div>

          <div class="form-field form-field--full profile-actions">
            <button
              type="submit"
              class="btn btn--primary"
              [disabled]="saving() || profileForm.invalid"
            >
              {{ saving() ? 'Guardando cambios…' : 'Guardar cambios' }}
            </button>

            <button
              type="button"
              class="btn btn--outline"
              [disabled]="sendingReset()"
              (click)="requestPasswordReset()"
            >
              {{ sendingReset() ? 'Enviando correo…' : 'Enviar enlace para cambiar contraseña' }}
            </button>
          </div>
        </form>
      </section>
    </div>
  `,
  styles: [
    `
      .profile-grid {
        display: grid;
        grid-template-columns: 1fr;
        gap: 1.5rem;

        @media (min-width: 900px) {
          grid-template-columns: 340px 1fr;
          align-items: start;
        }
      }

      .profile-summary {
        display: flex;
        flex-direction: column;
        align-items: center;
        text-align: center;

        &__avatar {
          width: 4.5rem;
          height: 4.5rem;
          border-radius: 50%;
          background: var(--primary);
          color: #ffffff;
          font-size: 1.5rem;
          font-weight: 700;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 1rem;
        }

        &__name {
          margin: 0 0 0.25rem;
          font-size: 1.125rem;
          font-weight: 700;
          color: var(--text-primary);
        }

        &__email {
          margin: 0 0 1rem;
          font-size: 0.875rem;
          color: var(--text-secondary);
          word-break: break-all;
        }

        &__badges {
          display: flex;
          gap: 0.5rem;
          flex-wrap: wrap;
          justify-content: center;
          margin-bottom: 1.25rem;
        }

        &__meta {
          width: 100%;
          margin: 0;
          padding-top: 1rem;
          border-top: 1px solid var(--border-color);
          text-align: left;
          display: flex;
          flex-direction: column;
          gap: 0.75rem;

          dt {
            font-size: 0.75rem;
            font-weight: 600;
            color: var(--text-muted);
          }

          dd {
            margin: 0.125rem 0 0;
            font-size: 0.8125rem;
            color: var(--text-primary);
            word-break: break-all;
          }
        }
      }

      .mono {
        font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
        font-size: 0.75rem;
      }

      .section-title {
        margin: 0 0 1.25rem;
        font-size: 1.0625rem;
        font-weight: 700;
        color: var(--text-primary);
      }

      .profile-actions {
        display: flex;
        flex-direction: row;
        flex-wrap: wrap;
        gap: 0.75rem;
        margin-top: 0.5rem;
      }
    `,
  ],
})
export class ProfileComponent implements OnInit {
  private readonly session = inject(SessionStore);
  private readonly userProfiles = inject(UserProfileRepository);
  private readonly audit = inject(LogAuditEventUseCase);
  private readonly notifications = inject(NotificationService);

  readonly user = this.session.currentUser;
  readonly saving = signal(false);
  readonly sendingReset = signal(false);
  readonly feedbackMessage = signal('');
  readonly feedbackType = signal<'success' | 'danger' | 'info'>('info');
  readonly feedbackTitle = signal('');

  displayName = '';
  phoneNumber = '';

  ngOnInit(): void {
    const current = this.user();
    if (current) {
      this.displayName = current.displayName;
      this.phoneNumber = current.phoneNumber ?? '';
    }
  }

  initials(): string {
    const name = this.user()?.displayName || 'U';
    const parts = name.trim().split(/\s+/);
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  }

  formatRole(role?: string | null): string {
    switch (role) {
      case 'admin':
        return 'Administrador';
      case 'authorized_staff':
        return 'Personal Autorizado';
      case 'volunteer':
        return 'Voluntario';
      default:
        return 'Usuario Regular';
    }
  }

  formatDate(iso?: string | null): string {
    if (!iso) {
      return 'No disponible';
    }
    const date = new Date(iso);
    if (Number.isNaN(date.getTime())) {
      return iso;
    }
    return date.toLocaleString('es-EC', {
      dateStyle: 'medium',
      timeStyle: 'short',
    });
  }

  async saveProfile(): Promise<void> {
    const current = this.user();
    if (!current) {
      return;
    }

    const trimmedName = this.displayName.trim();
    if (trimmedName.length < 3) {
      this.feedbackType.set('danger');
      this.feedbackTitle.set('Nombre inválido');
      this.feedbackMessage.set('El nombre completo debe tener al menos 3 caracteres.');
      return;
    }

    this.saving.set(true);
    this.feedbackMessage.set('');

    try {
      await this.userProfiles.updateOwnProfile({
        uid: current.uid,
        displayName: trimmedName,
        phoneNumber: this.phoneNumber.trim(),
        updatedAt: new Date().toISOString(),
      });

      await this.audit.execute(
        'update',
        'profile',
        {
          displayName: trimmedName,
        },
        current.uid,
      );

      this.feedbackType.set('success');
      this.feedbackTitle.set('Perfil actualizado');
      this.feedbackMessage.set('Tu información personal se guardó correctamente en Firestore.');
      this.notifications.success('Perfil actualizado', 'Tus datos personales fueron guardados.');
    } catch (error) {
      const msg = getFirebaseErrorMessage(error, 'No fue posible actualizar tu perfil.');
      this.feedbackType.set('danger');
      this.feedbackTitle.set('Error al guardar');
      this.feedbackMessage.set(msg);
      this.notifications.error('Error al actualizar perfil', msg);
    } finally {
      this.saving.set(false);
    }
  }

  async requestPasswordReset(): Promise<void> {
    const email = this.user()?.email;
    if (!email) {
      return;
    }

    this.sendingReset.set(true);
    try {
      await this.session.sendPasswordResetEmail(email);
      this.feedbackType.set('info');
      this.feedbackTitle.set('Correo enviado');
      this.feedbackMessage.set(
        `Se envió un enlace de restablecimiento de contraseña a ${email}. Revisa tu bandeja de entrada.`,
      );
      this.notifications.info('Correo enviado', `Enlace enviado a ${email}.`);
    } catch (error) {
      const msg = getFirebaseErrorMessage(
        error,
        'No fue posible enviar el correo de restablecimiento.',
      );
      this.feedbackType.set('danger');
      this.feedbackTitle.set('Error al enviar correo');
      this.feedbackMessage.set(msg);
      this.notifications.error('Error', msg);
    } finally {
      this.sendingReset.set(false);
    }
  }
}
