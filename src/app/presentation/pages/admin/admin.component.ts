import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { GetRecentAuditLogsUseCase } from '../../../application/use-cases/audit/get-recent-audit-logs.use-case';
import { GetUsersUseCase } from '../../../application/use-cases/users/get-users.use-case';
import { ManageUserAccessUseCase } from '../../../application/use-cases/users/manage-user-access.use-case';
import { AuditLog } from '../../../domain/entities/audit-log.entity';
import {
  AppUser,
  UserRole,
  UserStatus,
  calculateUserStats,
} from '../../../domain/entities/user.entity';
import { AlertComponent } from '../../shared/components/alert/alert.component';
import { EmptyStateComponent } from '../../shared/components/empty-state/empty-state.component';
import { PageHeaderComponent } from '../../shared/components/page-header/page-header.component';
import { StatCardComponent } from '../../shared/components/stat-card/stat-card.component';
import {
  BadgeVariant,
  StatusBadgeComponent,
} from '../../shared/components/status-badge/status-badge.component';
import { SessionStore } from '../../state/session.store';

export type PendingAdminActionType =
  | 'approve'
  | 'reject'
  | 'disable'
  | 'reactivate'
  | 'change_role';

export interface PendingAdminAction {
  type: PendingAdminActionType;
  targetUser: AppUser;
  newRole?: UserRole;
}

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [
    FormsModule,
    PageHeaderComponent,
    AlertComponent,
    StatusBadgeComponent,
    StatCardComponent,
    EmptyStateComponent,
  ],
  template: `
    <app-page-header
      title="Administración de Usuarios y Roles"
      subtitle="Aprobación de cuentas registradas, control de acceso y bitácora de auditoría"
      badgeText="Solo Administradores"
      badgeType="warning"
    >
      <button
        type="button"
        class="btn btn--outline btn--sm"
        [disabled]="loading()"
        (click)="loadData()"
      >
        {{ loading() ? 'Actualizando…' : '↻ Actualizar listado' }}
      </button>
    </app-page-header>

    @if (feedbackMessage()) {
      <app-alert [type]="feedbackType()" [title]="feedbackTitle()">
        {{ feedbackMessage() }}
      </app-alert>
    }

    <!-- Panel Principal de Indicadores de Usuarios -->
    <section class="admin-stats" aria-label="Indicadores de cuentas de usuario">
      <app-stat-card
        label="Total Registrados"
        [value]="stats().total"
        hint="Cuentas en el sistema"
        tag="Global"
      />
      <app-stat-card
        label="Pendientes"
        [value]="stats().pending"
        hint="Requieren revisión"
        tag="Por aprobar"
      />
      <app-stat-card
        label="Aprobados"
        [value]="stats().approved"
        hint="Con acceso habilitado"
        tag="Activos"
      />
      <app-stat-card
        label="Rechazados"
        [value]="stats().rejected"
        hint="Solicitudes denegadas"
        tag="Sin acceso"
      />
      <app-stat-card
        label="Deshabilitados"
        [value]="stats().disabled"
        hint="Cuentas suspendidas"
        tag="Suspendidos"
      />
    </section>

    <!-- Barra de Filtros -->
    <section class="card admin-filters" aria-label="Filtros de usuarios">
      <div class="filter-group">
        <label for="search-user" class="filter-label">Buscar por nombre o correo:</label>
        <input
          id="search-user"
          type="search"
          class="filter-input"
          placeholder="Ej. María Pérez o correo@ejemplo.com"
          [ngModel]="searchTerm()"
          (ngModelChange)="searchTerm.set($event)"
        />
      </div>

      <div class="filter-group">
        <label for="filter-status" class="filter-label">Estado de aprobación:</label>
        <select
          id="filter-status"
          class="filter-select"
          [ngModel]="statusFilter()"
          (ngModelChange)="statusFilter.set($event)"
        >
          <option value="all">Todos los estados</option>
          <option value="pending">Pendientes de aprobación</option>
          <option value="approved">Aprobados</option>
          <option value="rejected">Rechazados</option>
          <option value="disabled">Deshabilitados</option>
        </select>
      </div>

      <div class="filter-group">
        <label for="filter-role" class="filter-label">Rol asignado:</label>
        <select
          id="filter-role"
          class="filter-select"
          [ngModel]="roleFilter()"
          (ngModelChange)="roleFilter.set($event)"
        >
          <option value="all">Todos los roles</option>
          <option value="admin">Administrador (admin)</option>
          <option value="user">Usuario regular (user)</option>
        </select>
      </div>
    </section>

    <!-- Cuadro de Confirmación para Operaciones Sensibles -->
    @if (pendingAction(); as action) {
      <section
        class="card confirm-panel"
        role="dialog"
        aria-modal="false"
        aria-labelledby="confirm-action-title"
      >
        <div class="confirm-panel__header">
          <h3 id="confirm-action-title" class="confirm-panel__title">
            {{ getActionTitle(action) }}
          </h3>
          <app-status-badge text="Confirmación requerida" variant="warning" />
        </div>

        <p class="confirm-panel__desc">
          {{ getActionDescription(action) }}
        </p>

        @if (action.type === 'approve') {
          <div class="confirm-panel__field">
            <label for="approve-role" class="filter-label">Rol a otorgar al usuario:</label>
            <select
              id="approve-role"
              class="filter-select"
              [ngModel]="selectedApprovalRole()"
              (ngModelChange)="selectedApprovalRole.set($event)"
            >
              <option value="user">Usuario regular (user)</option>
              <option value="admin">Administrador del sistema (admin)</option>
            </select>
          </div>
        }

        @if (action.type === 'reject' || action.type === 'disable') {
          <div class="confirm-panel__field">
            <label for="action-reason" class="filter-label">
              Motivo u observación (opcional):
            </label>
            <input
              id="action-reason"
              type="text"
              class="filter-input"
              placeholder="Ej. Solicitud no corresponde a personal de la Fundación"
              [ngModel]="actionReason()"
              (ngModelChange)="actionReason.set($event)"
            />
          </div>
        }

        <div class="confirm-panel__actions">
          <button
            type="button"
            class="btn btn--primary btn--sm"
            [class.btn--danger]="action.type === 'reject' || action.type === 'disable'"
            [disabled]="processingUid() !== null"
            (click)="confirmPendingAction()"
          >
            {{ processingUid() ? 'Procesando…' : 'Confirmar operación' }}
          </button>
          <button
            type="button"
            class="btn btn--outline btn--sm"
            [disabled]="processingUid() !== null"
            (click)="cancelPendingAction()"
          >
            Cancelar
          </button>
        </div>
      </section>
    }

    <!-- Vista Detallada de un Usuario -->
    @if (selectedUser(); as detail) {
      <section class="card detail-panel" aria-labelledby="detail-user-title">
        <div class="detail-panel__header">
          <div>
            <h3 id="detail-user-title" class="detail-panel__title">
              Ficha de Usuario: {{ detail.displayName }}
            </h3>
            <p class="detail-panel__subtitle">{{ detail.email }}</p>
          </div>
          <button
            type="button"
            class="btn btn--outline btn--sm"
            (click)="selectedUser.set(null)"
          >
            Cerrar detalle
          </button>
        </div>

        <div class="session-grid">
          <div class="session-item">
            <span class="session-item__label">UID de Firebase Auth:</span>
            <code class="session-item__uid">{{ detail.uid }}</code>
          </div>
          <div class="session-item">
            <span class="session-item__label">Estado Actual:</span>
            <app-status-badge
              [text]="formatStatus(detail.status)"
              [variant]="getStatusVariant(detail.status)"
            />
          </div>
          <div class="session-item">
            <span class="session-item__label">Rol Asignado:</span>
            <app-status-badge
              [text]="formatRole(detail.role)"
              [variant]="detail.role === 'admin' ? 'info' : 'neutral'"
            />
          </div>
          <div class="session-item">
            <span class="session-item__label">Fecha de Registro:</span>
            <span class="session-item__value">{{ formatDate(detail.createdAt) }}</span>
          </div>
          <div class="session-item">
            <span class="session-item__label">Fecha de Aprobación:</span>
            <span class="session-item__value">
              {{ detail.approvedAt ? formatDate(detail.approvedAt) : 'No registra' }}
            </span>
          </div>
          <div class="session-item">
            <span class="session-item__label">Aprobado Por:</span>
            <span class="session-item__value">{{ detail.approvedBy || 'No registra' }}</span>
          </div>
          <div class="session-item">
            <span class="session-item__label">Última Actualización:</span>
            <span class="session-item__value">{{ formatDate(detail.updatedAt) }}</span>
          </div>
          @if (detail.rejectionReason) {
            <div class="session-item">
              <span class="session-item__label">Observación / Motivo:</span>
              <span class="session-item__value">{{ detail.rejectionReason }}</span>
            </div>
          }
        </div>
      </section>
    }

    <!-- Tabla de Usuarios Registrados -->
    <section class="card users-section" aria-labelledby="users-table-title">
      <div class="users-section__header">
        <div>
          <h3 id="users-table-title" class="users-section__title">
            Listado de Cuentas y Solicitudes ({{ filteredUsers().length }})
          </h3>
          <p class="users-section__desc">
            Gestiona la aprobación de nuevos registros, asignación de roles y suspensión de cuentas.
          </p>
        </div>
      </div>

      @if (loading()) {
        <div class="loading-box" role="status" aria-live="polite">
          Cargando cuentas registradas desde Firestore…
        </div>
      } @else if (filteredUsers().length === 0) {
        <app-empty-state
          title="No se encontraron usuarios"
          description="No existen cuentas registradas que coincidan con los criterios de búsqueda o filtrado actuales."
        />
      } @else {
        <div class="audit-table-wrapper">
          <table class="audit-table users-table">
            <thead>
              <tr>
                <th>Nombre Completo</th>
                <th>Correo Electrónico</th>
                <th>Rol</th>
                <th>Estado</th>
                <th>Fecha de Registro</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              @for (u of filteredUsers(); track u.uid) {
                <tr [class.users-table__row--pending]="u.status === 'pending'">
                  <td>
                    <div class="user-cell">
                      <span class="user-cell__name">
                        {{ u.displayName }}
                        @if (u.uid === currentUser()?.uid) {
                          <span class="user-cell__self">(Tú)</span>
                        }
                      </span>
                      <code class="user-cell__uid">{{ u.uid.slice(0, 10) }}…</code>
                    </div>
                  </td>
                  <td>{{ u.email }}</td>
                  <td>
                    <app-status-badge
                      [text]="formatRole(u.role)"
                      [variant]="u.role === 'admin' ? 'info' : 'neutral'"
                    />
                  </td>
                  <td>
                    <app-status-badge
                      [text]="formatStatus(u.status)"
                      [variant]="getStatusVariant(u.status)"
                    />
                  </td>
                  <td>{{ formatDate(u.createdAt) }}</td>
                  <td>
                    <div class="action-buttons">
                      <button
                        type="button"
                        class="btn btn--outline btn--sm"
                        (click)="inspectUser(u)"
                      >
                        Detalle
                      </button>

                      @if (u.status === 'pending') {
                        <button
                          type="button"
                          class="btn btn--success btn--sm"
                          [disabled]="processingUid() === u.uid"
                          (click)="promptApprove(u)"
                        >
                          Aprobar
                        </button>
                        <button
                          type="button"
                          class="btn btn--danger btn--sm"
                          [disabled]="processingUid() === u.uid"
                          (click)="promptReject(u)"
                        >
                          Rechazar
                        </button>
                      }

                      @if (u.status === 'approved' && u.uid !== currentUser()?.uid) {
                        <button
                          type="button"
                          class="btn btn--outline btn--sm"
                          [disabled]="processingUid() === u.uid"
                          (click)="promptToggleRole(u)"
                        >
                          {{ u.role === 'admin' ? 'Cambiar a Usuario' : 'Hacer Admin' }}
                        </button>
                        <button
                          type="button"
                          class="btn btn--danger btn--sm"
                          [disabled]="processingUid() === u.uid"
                          (click)="promptDisable(u)"
                        >
                          Deshabilitar
                        </button>
                      }

                      @if (u.status === 'disabled' || u.status === 'rejected') {
                        <button
                          type="button"
                          class="btn btn--primary btn--sm"
                          [disabled]="processingUid() === u.uid"
                          (click)="promptReactivate(u)"
                        >
                          {{ u.status === 'disabled' ? 'Reactivar' : 'Aprobar' }}
                        </button>
                      }
                    </div>
                  </td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      }
    </section>

    <!-- Estado Actual de la Sesión del Administrador -->
    <div class="card session-card">
      <h3 class="session-card__title">Información de tu Sesión Administrativa</h3>
      <div class="session-grid">
        <div class="session-item">
          <span class="session-item__label">Administrador Autenticado:</span>
          <span class="session-item__value">{{ currentUser()?.displayName }}</span>
        </div>
        <div class="session-item">
          <span class="session-item__label">Correo Electrónico:</span>
          <span class="session-item__value">{{ currentUser()?.email }}</span>
        </div>
        <div class="session-item">
          <span class="session-item__label">Rol Activo:</span>
          <app-status-badge [text]="formatRole(currentUser()?.role)" variant="info" />
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
        Toda operación administrativa (aprobación, rechazo, deshabilitación o cambio de rol) queda
        registrada con marca de tiempo e identificador del administrador responsable.
      </p>

      <div class="audit-table-wrapper">
        <table class="audit-table">
          <thead>
            <tr>
              <th>Módulo</th>
              <th>Acción</th>
              <th>Administrador Responsable</th>
              <th>Detalle</th>
              <th>Fecha y Hora</th>
            </tr>
          </thead>
          <tbody>
            @for (log of auditLogs(); track log.id || log.timestamp) {
              <tr>
                <td><code>{{ log.module }}</code></td>
                <td>{{ formatAuditAction(log) }}</td>
                <td>{{ log.userEmail }}</td>
                <td>{{ formatAuditDetails(log) }}</td>
                <td>{{ formatDate(log.timestamp) }}</td>
              </tr>
            } @empty {
              <tr>
                <td><code>admin</code></td>
                <td>Sesión Administrativa Activa</td>
                <td>{{ currentUser()?.email }}</td>
                <td>Panel de control inicializado</td>
                <td>{{ initTimestamp }}</td>
              </tr>
            }
          </tbody>
        </table>
      </div>
    </section>
  `,
  styles: [
    `
      .admin-stats {
        display: grid;
        grid-template-columns: 1fr;
        gap: 1rem;
        margin-bottom: 1.5rem;

        @media (min-width: 640px) {
          grid-template-columns: repeat(2, 1fr);
        }

        @media (min-width: 1100px) {
          grid-template-columns: repeat(5, 1fr);
        }
      }

      .admin-filters {
        display: flex;
        flex-direction: column;
        gap: 1rem;
        margin-bottom: 1.5rem;

        @media (min-width: 768px) {
          flex-direction: row;
          align-items: flex-end;
        }
      }

      .filter-group {
        display: flex;
        flex-direction: column;
        gap: 0.375rem;
        flex: 1;
      }

      .filter-label {
        font-size: 0.8125rem;
        font-weight: 600;
        color: var(--text-secondary);
      }

      .filter-input,
      .filter-select {
        padding: 0.5rem 0.75rem;
        border: 1px solid var(--border-color);
        border-radius: 0.375rem;
        font-size: 0.875rem;
        background: var(--surface-card, #ffffff);
        color: var(--text-primary);
      }

      .confirm-panel {
        margin-bottom: 1.5rem;
        border-left: 4px solid var(--warning, #d97706);
        background: #fffbeb;

        &__header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 0.75rem;
          margin-bottom: 0.5rem;
          flex-wrap: wrap;
        }

        &__title {
          margin: 0;
          font-size: 1rem;
          font-weight: 700;
          color: var(--text-primary);
        }

        &__desc {
          margin: 0 0 1rem 0;
          font-size: 0.875rem;
          color: var(--text-secondary);
        }

        &__field {
          display: flex;
          flex-direction: column;
          gap: 0.375rem;
          max-width: 28rem;
          margin-bottom: 1rem;
        }

        &__actions {
          display: flex;
          gap: 0.75rem;
          flex-wrap: wrap;
        }
      }

      .detail-panel {
        margin-bottom: 1.5rem;
        border-left: 4px solid var(--primary, #0284c7);

        &__header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: 1rem;
          margin-bottom: 1rem;
        }

        &__title {
          margin: 0;
          font-size: 1rem;
          font-weight: 700;
        }

        &__subtitle {
          margin: 0.25rem 0 0;
          font-size: 0.8125rem;
          color: var(--text-secondary);
        }
      }

      .users-section {
        margin-bottom: 1.5rem;

        &__header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1rem;
        }

        &__title {
          font-size: 1rem;
          font-weight: 700;
          margin: 0;
          color: var(--text-primary);
        }

        &__desc {
          font-size: 0.8125rem;
          color: var(--text-secondary);
          margin: 0.25rem 0 0;
        }
      }

      .loading-box {
        padding: 2rem;
        text-align: center;
        color: var(--text-secondary);
        font-size: 0.875rem;
      }

      .user-cell {
        display: flex;
        flex-direction: column;
        gap: 0.2rem;

        &__name {
          font-weight: 600;
          color: var(--text-primary);
        }

        &__self {
          font-size: 0.75rem;
          color: var(--primary, #0284c7);
          font-weight: 700;
          margin-left: 0.25rem;
        }

        &__uid {
          font-size: 0.7rem;
          color: var(--text-secondary);
          width: fit-content;
        }
      }

      .action-buttons {
        display: flex;
        gap: 0.4rem;
        flex-wrap: wrap;
      }

      .btn--success {
        background-color: var(--success, #16a34a);
        color: #ffffff;

        &:hover:not(:disabled) {
          background-color: #15803d;
        }
      }

      .btn--danger {
        background-color: var(--danger, #dc2626);
        color: #ffffff;

        &:hover:not(:disabled) {
          background-color: #b91c1c;
        }
      }

      .users-table__row--pending {
        background-color: rgba(254, 243, 199, 0.25);
      }

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
          vertical-align: middle;
        }

        code {
          background: #f1f5f9;
          padding: 0.125rem 0.375rem;
          border-radius: 0.25rem;
          font-size: 0.75rem;
        }
      }
    `,
  ],
})
export class AdminComponent implements OnInit {
  private readonly session = inject(SessionStore);
  private readonly getUsersUseCase = inject(GetUsersUseCase);
  private readonly manageUserAccessUseCase = inject(ManageUserAccessUseCase);
  private readonly getRecentAuditLogsUseCase = inject(GetRecentAuditLogsUseCase);

  readonly currentUser = this.session.currentUser;
  readonly initTimestamp = new Date().toLocaleString();

  readonly users = signal<AppUser[]>([]);
  readonly auditLogs = signal<AuditLog[]>([]);
  readonly loading = signal(false);
  readonly processingUid = signal<string | null>(null);

  readonly searchTerm = signal('');
  readonly statusFilter = signal<'all' | UserStatus>('all');
  readonly roleFilter = signal<'all' | UserRole>('all');

  readonly selectedUser = signal<AppUser | null>(null);
  readonly pendingAction = signal<PendingAdminAction | null>(null);
  readonly selectedApprovalRole = signal<UserRole>('user');
  readonly actionReason = signal('');

  readonly feedbackType = signal<'success' | 'danger' | 'info' | 'warning'>('info');
  readonly feedbackTitle = signal('');
  readonly feedbackMessage = signal('');

  readonly stats = computed(() => calculateUserStats(this.users()));

  readonly filteredUsers = computed(() => {
    const term = this.searchTerm().trim().toLowerCase();
    const status = this.statusFilter();
    const role = this.roleFilter();

    return this.users().filter((u) => {
      const matchesTerm =
        !term ||
        u.displayName.toLowerCase().includes(term) ||
        u.email.toLowerCase().includes(term) ||
        u.uid.toLowerCase().includes(term);
      const matchesStatus = status === 'all' || u.status === status;
      const matchesRole = role === 'all' || u.role === role;
      return matchesTerm && matchesStatus && matchesRole;
    });
  });

  ngOnInit(): void {
    void this.loadData();
  }

  async loadData(): Promise<void> {
    this.loading.set(true);
    try {
      const [loadedUsers, logs] = await Promise.all([
        this.getUsersUseCase.execute(),
        this.getRecentAuditLogsUseCase.execute(15).catch(() => [] as AuditLog[]),
      ]);
      this.users.set(loadedUsers);
      this.auditLogs.set(logs);
    } catch (error) {
      this.showFeedback(
        'danger',
        'Error al cargar datos administrativos',
        error instanceof Error
          ? error.message
          : 'No fue posible consultar el listado de usuarios en Firestore.',
      );
    } finally {
      this.loading.set(false);
    }
  }

  inspectUser(user: AppUser): void {
    this.selectedUser.set(user);
  }

  promptApprove(user: AppUser): void {
    this.selectedApprovalRole.set(user.role || 'user');
    this.actionReason.set('');
    this.pendingAction.set({ type: 'approve', targetUser: user });
  }

  promptReject(user: AppUser): void {
    this.actionReason.set('');
    this.pendingAction.set({ type: 'reject', targetUser: user });
  }

  promptDisable(user: AppUser): void {
    this.actionReason.set('');
    this.pendingAction.set({ type: 'disable', targetUser: user });
  }

  promptReactivate(user: AppUser): void {
    this.actionReason.set('');
    this.pendingAction.set({ type: 'reactivate', targetUser: user });
  }

  promptToggleRole(user: AppUser): void {
    const nextRole: UserRole = user.role === 'admin' ? 'user' : 'admin';
    this.pendingAction.set({
      type: 'change_role',
      targetUser: user,
      newRole: nextRole,
    });
  }

  cancelPendingAction(): void {
    this.pendingAction.set(null);
    this.actionReason.set('');
  }

  async confirmPendingAction(): Promise<void> {
    const action = this.pendingAction();
    if (!action) {
      return;
    }

    const { targetUser, type } = action;
    this.processingUid.set(targetUser.uid);

    try {
      let updated: AppUser;

      switch (type) {
        case 'approve':
          updated = await this.manageUserAccessUseCase.approveUser(
            targetUser.uid,
            this.selectedApprovalRole(),
          );
          this.showFeedback(
            'success',
            'Cuenta aprobada',
            `El usuario ${updated.displayName} (${updated.email}) fue aprobado con rol '${this.formatRole(updated.role)}'.`,
          );
          break;

        case 'reject':
          updated = await this.manageUserAccessUseCase.rejectUser(
            targetUser.uid,
            this.actionReason(),
          );
          this.showFeedback(
            'warning',
            'Solicitud rechazada',
            `Se rechazó la solicitud de acceso de ${updated.email}.`,
          );
          break;

        case 'disable':
          updated = await this.manageUserAccessUseCase.disableUser(
            targetUser.uid,
            this.actionReason(),
          );
          this.showFeedback(
            'warning',
            'Cuenta deshabilitada',
            `La cuenta de ${updated.email} ha sido deshabilitada y su acceso a los módulos internos fue revocado.`,
          );
          break;

        case 'reactivate':
          updated = await this.manageUserAccessUseCase.reactivateUser(targetUser.uid);
          this.showFeedback(
            'success',
            'Cuenta reactivada',
            `La cuenta de ${updated.email} fue reactivada y tiene acceso nuevamente al sistema.`,
          );
          break;

        case 'change_role':
          updated = await this.manageUserAccessUseCase.changeUserRole(
            targetUser.uid,
            action.newRole ?? 'user',
          );
          this.showFeedback(
            'success',
            'Rol actualizado',
            `El rol de ${updated.email} cambió a '${this.formatRole(updated.role)}'.`,
          );
          break;
      }

      this.replaceUserInList(updated);
      if (this.selectedUser()?.uid === updated.uid) {
        this.selectedUser.set(updated);
      }
      this.pendingAction.set(null);
      this.actionReason.set('');
      const logs = await this.getRecentAuditLogsUseCase.execute(15).catch(() => [] as AuditLog[]);
      this.auditLogs.set(logs);
    } catch (error) {
      this.showFeedback(
        'danger',
        'No se pudo completar la operación',
        error instanceof Error ? error.message : 'Ocurrió un error al actualizar la cuenta.',
      );
    } finally {
      this.processingUid.set(null);
    }
  }

  getActionTitle(action: PendingAdminAction): string {
    switch (action.type) {
      case 'approve':
        return `Confirmar aprobación de ${action.targetUser.displayName}`;
      case 'reject':
        return `Confirmar rechazo de solicitud (${action.targetUser.email})`;
      case 'disable':
        return `Confirmar deshabilitación de cuenta (${action.targetUser.email})`;
      case 'reactivate':
        return `Confirmar reactivación de cuenta (${action.targetUser.email})`;
      case 'change_role':
        return `Confirmar cambio de rol para ${action.targetUser.displayName}`;
    }
  }

  getActionDescription(action: PendingAdminAction): string {
    switch (action.type) {
      case 'approve':
        return `El usuario ${action.targetUser.email} pasará al estado 'Aprobado' y podrá acceder a los módulos internos del sistema.`;
      case 'reject':
        return `La solicitud de ${action.targetUser.email} quedará marcada como 'Rechazada' y no tendrá acceso a los módulos internos.`;
      case 'disable':
        return `Se suspenderá el acceso de ${action.targetUser.email} inmediatamente, incluso si mantiene una sesión abierta en su navegador.`;
      case 'reactivate':
        return `La cuenta ${action.targetUser.email} volverá al estado 'Aprobado' con rol '${this.formatRole(action.targetUser.role)}'.`;
      case 'change_role':
        return `El usuario ${action.targetUser.email} cambiará su rol actual de '${this.formatRole(action.targetUser.role)}' a '${this.formatRole(action.newRole)}'.`;
    }
  }

  formatStatus(status: UserStatus): string {
    switch (status) {
      case 'pending':
        return 'Pendiente';
      case 'approved':
        return 'Aprobado';
      case 'rejected':
        return 'Rechazado';
      case 'disabled':
        return 'Deshabilitado';
    }
  }

  getStatusVariant(status: UserStatus): BadgeVariant {
    switch (status) {
      case 'approved':
        return 'success';
      case 'pending':
        return 'warning';
      case 'rejected':
      case 'disabled':
        return 'danger';
    }
  }

  formatRole(role?: UserRole | null): string {
    switch (role) {
      case 'admin':
        return 'Administrador';
      case 'user':
        return 'Usuario';
      case 'volunteer':
        return 'Voluntario';
      case 'authorized_staff':
        return 'Personal Autorizado';
      default:
        return 'Usuario';
    }
  }

  formatDate(iso?: string | null): string {
    if (!iso) {
      return '—';
    }
    const date = new Date(iso);
    if (Number.isNaN(date.getTime())) {
      return iso;
    }
    return date.toLocaleString('es-EC', {
      year: 'numeric',
      month: 'short',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  formatAuditAction(log: AuditLog): string {
    const op = log.details?.['operation'];
    switch (op) {
      case 'approve_user':
        return 'Aprobación de usuario';
      case 'reject_user':
        return 'Rechazo de solicitud';
      case 'disable_user':
        return 'Deshabilitación de cuenta';
      case 'reactivate_user':
        return 'Reactivación de cuenta';
      case 'change_user_role':
        return 'Cambio de rol';
      case 'bootstrap_first_admin':
        return 'Inicialización primer admin';
      default:
        return log.action;
    }
  }

  formatAuditDetails(log: AuditLog): string {
    const targetEmail = log.details?.['targetEmail'];
    const newStatus = log.details?.['newStatus'];
    const newRole = log.details?.['newRole'] || log.details?.['role'];
    const parts: string[] = [];
    if (typeof targetEmail === 'string') {
      parts.push(targetEmail);
    }
    if (typeof newStatus === 'string') {
      parts.push(`estado: ${newStatus}`);
    }
    if (typeof newRole === 'string') {
      parts.push(`rol: ${newRole}`);
    }
    return parts.join(' · ') || log.recordId || '—';
  }

  private replaceUserInList(updated: AppUser): void {
    this.users.update((list) => list.map((u) => (u.uid === updated.uid ? updated : u)));
  }

  private showFeedback(
    type: 'success' | 'danger' | 'info' | 'warning',
    title: string,
    message: string,
  ): void {
    this.feedbackType.set(type);
    this.feedbackTitle.set(title);
    this.feedbackMessage.set(message);
  }
}
