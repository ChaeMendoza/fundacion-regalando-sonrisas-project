import { Component, inject } from '@angular/core';
import { PageHeaderComponent } from '../../shared/components/page-header/page-header.component';
import { AlertComponent } from '../../shared/components/alert/alert.component';
import { StatusBadgeComponent } from '../../shared/components/status-badge/status-badge.component';
import { AuthService } from '../../core/services/firebase/auth.service';

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [PageHeaderComponent, AlertComponent, StatusBadgeComponent],
  template: `
    <app-page-header
      title="Administración y Seguridad"
      subtitle="Gestión de usuarios, asignación preliminar de accesos y registro de auditoría"
      badgeText="Acceso Restringido"
      badgeType="warning"
    />

    <app-alert type="warning" title="Modelo de Autorización en Validación">
      <strong>Regla fundamental del proyecto:</strong> No asumir que <em>'Personal Autorizado'</em>
      constituye necesariamente un tercer rol fijo del sistema.
      La arquitectura permite definir la matriz de permisos una vez que la Fundación valide
      formalmente las restricciones operativas.
    </app-alert>

    <!-- Estado Actual de la Sesión -->
    <div class="card session-card">
      <h3 class="session-card__title">Información de la Sesión Actual</h3>
      <div class="session-grid">
        <div class="session-item">
          <span class="session-item__label">Usuario Autenticado:</span>
          <span class="session-item__value">{{ currentUser()?.displayName }}</span>
        </div>
        <div class="session-item">
          <span class="session-item__label">Correo Electrónico:</span>
          <span class="session-item__value">{{ currentUser()?.email }}</span>
        </div>
        <div class="session-item">
          <span class="session-item__label">Rol Asignado (Preliminar):</span>
          <app-status-badge
            [text]="currentUser()?.role || 'Sin rol'"
            variant="info"
          />
        </div>
        <div class="session-item">
          <span class="session-item__label">Identificador (UID):</span>
          <code class="session-item__uid">{{ currentUser()?.uid }}</code>
        </div>
      </div>
    </div>

    <!-- Pistas de Auditoría y Trazabilidad -->
    <section class="card audit-preview">
      <div class="audit-preview__header">
        <h3 class="audit-preview__title">Bitácora de Auditoría del Sistema</h3>
        <span class="audit-preview__badge">Inmutable</span>
      </div>
      <p class="audit-preview__desc">
        Toda operación relevante (creación, edición, cambio de estado, subida de documentos)
        queda registrada automáticamente con el identificador del usuario, marca de tiempo del servidor e IP.
      </p>

      <div class="audit-table-wrapper">
        <table class="audit-table">
          <thead>
            <tr>
              <th>Módulo</th>
              <th>Acción</th>
              <th>Usuario Responsable</th>
              <th>Fecha y Hora</th>
              <th>Estado</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td><code>sistema</code></td>
              <td>Inicialización de Base Técnica</td>
              <td>{{ currentUser()?.email }}</td>
              <td>{{ initTimestamp }}</td>
              <td>
                <app-status-badge text="Completado" variant="success" />
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>

    <!-- Guía del Alcance Técnico -->
    <section class="card scope-guide">
      <h3 class="scope-guide__title">Perfiles Identificados Preliminarmente</h3>
      <div class="scope-guide__grid">
        <div class="scope-guide__card">
          <h4>Administrador</h4>
          <p>Configuración general, gestión de usuarios, acceso a reportes consolidados y auditoría.</p>
        </div>
        <div class="scope-guide__card">
          <h4>Voluntario</h4>
          <p>Consulta de sus actividades asignadas, registro de asistencias y disponibilidad horaria.</p>
        </div>
        <div class="scope-guide__card">
          <h4>Personal Autorizado (Por Validar)</h4>
          <p>Perfil en evaluación técnica para definir si corresponde a un rol específico o permisos por módulo.</p>
        </div>
      </div>
    </section>
  `,
  styles: [`
    .session-card {
      margin-bottom: 1.5rem;

      &__title {
        font-size: 1rem;
        font-weight: 600;
        margin: 0 0 1rem 0;
        color: var(--text-primary);
      }
    }

    .session-grid {
      display: grid;
      grid-template-columns: 1fr;
      gap: 1rem;

      @media (min-width: 640px) {
        grid-template-columns: repeat(2, 1fr);
      }
    }

    .session-item {
      display: flex;
      flex-direction: column;
      gap: 0.25rem;

      &__label {
        font-size: 0.75rem;
        font-weight: 600;
        text-transform: uppercase;
        letter-spacing: 0.05em;
        color: var(--text-secondary);
      }

      &__value {
        font-size: 0.875rem;
        color: var(--text-primary);
      }

      &__uid {
        font-size: 0.75rem;
        background: var(--surface-bg);
        padding: 0.25rem 0.5rem;
        border-radius: 0.25rem;
        border: 1px solid var(--border-color);
        width: fit-content;
      }
    }

    .audit-preview {
      margin-bottom: 1.5rem;

      &__header {
        display: flex;
        align-items: center;
        gap: 0.75rem;
        margin-bottom: 0.5rem;
      }

      &__title {
        font-size: 1rem;
        font-weight: 600;
        margin: 0;
        color: var(--text-primary);
      }

      &__badge {
        font-size: 0.6875rem;
        font-weight: 700;
        background: #fee2e2;
        color: #b91c1c;
        padding: 0.125rem 0.5rem;
        border-radius: 9999px;
        text-transform: uppercase;
      }

      &__desc {
        font-size: 0.8125rem;
        color: var(--text-secondary);
        margin: 0 0 1rem 0;
      }
    }

    .audit-table-wrapper {
      overflow-x: auto;
    }

    .audit-table {
      width: 100%;
      border-collapse: collapse;
      font-size: 0.8125rem;

      th {
        background: var(--surface-bg);
        text-align: left;
        padding: 0.625rem 0.75rem;
        font-weight: 600;
        color: var(--text-secondary);
        border-bottom: 1px solid var(--border-color);
      }

      td {
        padding: 0.75rem;
        border-bottom: 1px solid var(--border-color);
        color: var(--text-primary);
      }

      code {
        background: #f1f5f9;
        padding: 0.125rem 0.375rem;
        border-radius: 0.25rem;
        font-size: 0.75rem;
      }
    }

    .scope-guide {
      &__title {
        font-size: 1.125rem;
        font-weight: 700;
        margin: 0 0 1rem 0;
        color: var(--text-primary);
      }

      &__grid {
        display: grid;
        grid-template-columns: 1fr;
        gap: 1rem;

        @media (min-width: 640px) {
          grid-template-columns: repeat(3, 1fr);
        }
      }

      &__card {
        padding: 1rem;
        background: var(--surface-bg);
        border: 1px solid var(--border-color);
        border-radius: 0.5rem;

        h4 {
          font-size: 0.875rem;
          font-weight: 600;
          margin: 0 0 0.5rem 0;
          color: var(--text-primary);
        }

        p {
          font-size: 0.8125rem;
          color: var(--text-secondary);
          margin: 0;
          line-height: 1.4;
        }
      }
    }
  `],
})
export class AdminComponent {
  private readonly authService = inject(AuthService);

  readonly currentUser = this.authService.currentUser;
  readonly initTimestamp = new Date().toLocaleString();
}
