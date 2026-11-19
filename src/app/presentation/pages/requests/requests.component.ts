import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Beneficiary } from '../../../domain/entities/beneficiary.entity';
import {
  RequestCategory,
  RequestPriority,
  RequestStatus,
  SupportRequest,
} from '../../../domain/entities/request.entity';
import {
  BeneficiariesService,
  RequestsService,
} from '../../../infrastructure/services/foundation-modules.service';
import { AlertComponent } from '../../shared/components/alert/alert.component';
import { EmptyStateComponent } from '../../shared/components/empty-state/empty-state.component';
import { PageHeaderComponent } from '../../shared/components/page-header/page-header.component';
import { StatCardComponent } from '../../shared/components/stat-card/stat-card.component';
import {
  BadgeVariant,
  StatusBadgeComponent,
} from '../../shared/components/status-badge/status-badge.component';
import { NotificationService } from '../../shared/services/notification.service';
import { getFirebaseErrorMessage } from '../../shared/utils/firebase-error-message';

interface RequestFormModel {
  code: string;
  title: string;
  category: RequestCategory;
  priority: RequestPriority;
  status: RequestStatus;
  beneficiaryId: string;
  beneficiaryName: string;
  requesterPhone: string;
  sector: string;
  description: string;
  requestDate: string;
  resolutionNotes: string;
}

@Component({
  selector: 'app-requests',
  standalone: true,
  imports: [
    FormsModule,
    PageHeaderComponent,
    AlertComponent,
    EmptyStateComponent,
    StatCardComponent,
    StatusBadgeComponent,
  ],
  template: `
    <app-page-header
      title="Solicitudes y Necesidades"
      subtitle="Registro, priorización y seguimiento de requerimientos de ayuda recibidos por la Fundación"
      badgeText="Operativo"
      badgeType="success"
    >
      <button type="button" class="btn btn--outline btn--sm" (click)="loadData()">
        &#8635; Actualizar
      </button>
      <button type="button" class="btn btn--primary" (click)="openCreateModal()">
        + Nueva Solicitud
      </button>
    </app-page-header>

    @if (errorMessage()) {
      <app-alert type="danger" title="Error de carga">
        {{ errorMessage() }}
      </app-alert>
    }

    <section class="grid-stats" aria-label="Indicadores de solicitudes">
      <app-stat-card
        label="Total Solicitudes"
        [value]="requests().length"
        hint="Requerimientos registrados"
        tag="Gestión"
      />
      <app-stat-card
        label="Pendientes / En Revisión"
        [value]="pendingCount()"
        hint="Requieren evaluación"
        tag="Prioridad"
      />
      <app-stat-card
        label="Aprobadas"
        [value]="approvedCount()"
        hint="Listas para atención"
        tag="En curso"
      />
      <app-stat-card
        label="Atendidas"
        [value]="fulfilledCount()"
        hint="Necesidades cubiertas"
        tag="Cerradas"
      />
    </section>

    <div class="card module-filters">
      <div class="filter-group">
        <label for="search-req" class="filter-label">Buscar solicitud:</label>
        <input
          id="search-req"
          type="text"
          class="filter-input"
          placeholder="Código, título, solicitante o sector..."
          [ngModel]="searchTerm()"
          (ngModelChange)="searchTerm.set($event)"
        />
      </div>
      <div class="filter-group">
        <label for="filter-req-cat" class="filter-label">Categoría:</label>
        <select
          id="filter-req-cat"
          class="filter-select"
          [ngModel]="categoryFilter()"
          (ngModelChange)="categoryFilter.set($event)"
        >
          <option value="all">Todas las categorías</option>
          <option value="food">Alimentación</option>
          <option value="health">Salud / Medicinas</option>
          <option value="education">Educación</option>
          <option value="housing">Vivienda / Enseres</option>
          <option value="clothing">Vestimenta</option>
          <option value="other">Otro</option>
        </select>
      </div>
      <div class="filter-group">
        <label for="filter-req-status" class="filter-label">Estado:</label>
        <select
          id="filter-req-status"
          class="filter-select"
          [ngModel]="statusFilter()"
          (ngModelChange)="statusFilter.set($event)"
        >
          <option value="all">Todos los estados</option>
          <option value="pending">Pendiente</option>
          <option value="in_review">En revisión</option>
          <option value="approved">Aprobada</option>
          <option value="fulfilled">Atendida</option>
          <option value="rejected">No procedente</option>
        </select>
      </div>
    </div>

    @if (loading()) {
      <div class="card loading-state">Cargando solicitudes desde Firestore…</div>
    } @else if (filteredRequests().length === 0) {
      <app-empty-state
        title="No se encontraron solicitudes"
        description="Registra una nueva solicitud de ayuda o ajusta los filtros de consulta."
      />
    } @else {
      <div class="card table-card">
        <div class="table-responsive">
          <table class="data-table">
            <thead>
              <tr>
                <th>Código / Fecha</th>
                <th>Solicitud</th>
                <th>Solicitante / Sector</th>
                <th>Prioridad</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              @for (item of filteredRequests(); track item.id) {
                <tr>
                  <td>
                    <div class="cell-primary">{{ item.code }}</div>
                    <div class="cell-secondary">{{ item.requestDate }}</div>
                  </td>
                  <td>
                    <div class="cell-primary">{{ item.title }}</div>
                    <div class="cell-secondary">{{ formatCategory(item.category) }}</div>
                  </td>
                  <td>
                    <div>{{ item.beneficiaryName }}</div>
                    <div class="cell-secondary">{{ item.sector }} · {{ item.requesterPhone }}</div>
                  </td>
                  <td>
                    <app-status-badge
                      [text]="formatPriority(item.priority)"
                      [variant]="priorityVariant(item.priority)"
                    />
                  </td>
                  <td>
                    <app-status-badge
                      [text]="formatStatus(item.status)"
                      [variant]="statusVariant(item.status)"
                    />
                  </td>
                  <td>
                    <div class="table-actions">
                      <button
                        type="button"
                        class="btn btn--outline btn--sm"
                        (click)="openEditModal(item)"
                      >
                        Gestionar
                      </button>
                      <button
                        type="button"
                        class="btn btn--ghost btn--sm"
                        (click)="pendingDeactivate.set(item)"
                      >
                        Archivar
                      </button>
                    </div>
                  </td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      </div>
    }

    @if (showFormModal()) {
      <div class="modal-backdrop" role="dialog" aria-modal="true">
        <div class="modal-panel">
          <div class="modal-panel__header">
            <h2>{{ editingId() ? 'Gestionar Solicitud' : 'Nueva Solicitud de Ayuda' }}</h2>
            <button type="button" class="modal-panel__close" (click)="closeModals()">&times;</button>
          </div>
          <form (ngSubmit)="saveRequest()" #reqForm="ngForm">
            <div class="modal-panel__body">
              <div class="form-grid">
                <div class="form-field">
                  <label for="req-code">Código *</label>
                  <input
                    id="req-code"
                    name="code"
                    class="form-control"
                    required
                    [(ngModel)]="form.code"
                  />
                </div>

                <div class="form-field">
                  <label for="req-date">Fecha de solicitud *</label>
                  <input
                    id="req-date"
                    name="requestDate"
                    type="date"
                    class="form-control"
                    required
                    [(ngModel)]="form.requestDate"
                  />
                </div>

                <div class="form-field form-field--full">
                  <label for="req-title">Título o necesidad principal *</label>
                  <input
                    id="req-title"
                    name="title"
                    class="form-control"
                    required
                    [(ngModel)]="form.title"
                    placeholder="Ej. Kit alimenticio mensual para familia con 3 niños"
                  />
                </div>

                <div class="form-field">
                  <label for="req-cat">Categoría *</label>
                  <select
                    id="req-cat"
                    name="category"
                    class="form-control"
                    required
                    [(ngModel)]="form.category"
                  >
                    <option value="food">Alimentación</option>
                    <option value="health">Salud / Medicinas</option>
                    <option value="education">Educación</option>
                    <option value="housing">Vivienda / Enseres</option>
                    <option value="clothing">Vestimenta</option>
                    <option value="other">Otro</option>
                  </select>
                </div>

                <div class="form-field">
                  <label for="req-prio">Prioridad *</label>
                  <select
                    id="req-prio"
                    name="priority"
                    class="form-control"
                    required
                    [(ngModel)]="form.priority"
                  >
                    <option value="low">Baja</option>
                    <option value="medium">Media</option>
                    <option value="high">Alta</option>
                    <option value="urgent">Urgente</option>
                  </select>
                </div>

                <div class="form-field">
                  <label for="req-ben-select">Beneficiario registrado (opcional)</label>
                  <select
                    id="req-ben-select"
                    name="beneficiaryId"
                    class="form-control"
                    [ngModel]="form.beneficiaryId"
                    (ngModelChange)="onBeneficiarySelected($event)"
                  >
                    <option value="">-- Solicitante nuevo / externo --</option>
                    @for (b of beneficiaries(); track b.id) {
                      <option [value]="b.id">{{ b.fullName }} ({{ b.sector }})</option>
                    }
                  </select>
                </div>

                <div class="form-field">
                  <label for="req-ben-name">Nombre del solicitante / beneficiario *</label>
                  <input
                    id="req-ben-name"
                    name="beneficiaryName"
                    class="form-control"
                    required
                    [(ngModel)]="form.beneficiaryName"
                  />
                </div>

                <div class="form-field">
                  <label for="req-phone">Teléfono de contacto *</label>
                  <input
                    id="req-phone"
                    name="requesterPhone"
                    class="form-control"
                    required
                    [(ngModel)]="form.requesterPhone"
                  />
                </div>

                <div class="form-field">
                  <label for="req-sector">Sector (Quito) *</label>
                  <input
                    id="req-sector"
                    name="sector"
                    class="form-control"
                    required
                    [(ngModel)]="form.sector"
                  />
                </div>

                <div class="form-field">
                  <label for="req-status">Estado de atención *</label>
                  <select
                    id="req-status"
                    name="status"
                    class="form-control"
                    required
                    [(ngModel)]="form.status"
                  >
                    <option value="pending">Pendiente</option>
                    <option value="in_review">En revisión</option>
                    <option value="approved">Aprobada</option>
                    <option value="fulfilled">Atendida</option>
                    <option value="rejected">No procedente</option>
                  </select>
                </div>

                <div class="form-field form-field--full">
                  <label for="req-desc">Descripción de la necesidad *</label>
                  <textarea
                    id="req-desc"
                    name="description"
                    rows="2"
                    class="form-control"
                    required
                    [(ngModel)]="form.description"
                  ></textarea>
                </div>

                <div class="form-field form-field--full">
                  <label for="req-res">Notas de evaluación / resolución</label>
                  <textarea
                    id="req-res"
                    name="resolutionNotes"
                    rows="2"
                    class="form-control"
                    [(ngModel)]="form.resolutionNotes"
                    placeholder="Detalle de la verificación o ayuda entregada..."
                  ></textarea>
                </div>
              </div>
            </div>
            <div class="modal-panel__footer">
              <button type="button" class="btn btn--outline" (click)="closeModals()">Cancelar</button>
              <button
                type="submit"
                class="btn btn--primary"
                [disabled]="saving() || reqForm.invalid"
              >
                {{ saving() ? 'Guardando…' : editingId() ? 'Actualizar' : 'Registrar' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    }

    @if (pendingDeactivate(); as target) {
      <div class="modal-backdrop" role="dialog" aria-modal="true">
        <div class="modal-panel modal-panel--sm">
          <div class="modal-panel__header">
            <h2>Archivar Solicitud</h2>
            <button type="button" class="modal-panel__close" (click)="pendingDeactivate.set(null)">
              &times;
            </button>
          </div>
          <div class="modal-panel__body">
            <p class="confirm-text">
              ¿Deseas archivar la solicitud <strong>{{ target.code }}</strong>?
            </p>
          </div>
          <div class="modal-panel__footer">
            <button type="button" class="btn btn--outline" (click)="pendingDeactivate.set(null)">
              Cancelar
            </button>
            <button
              type="button"
              class="btn btn--danger"
              [disabled]="saving()"
              (click)="executeDeactivate()"
            >
              Confirmar archivo
            </button>
          </div>
        </div>
      </div>
    }
  `,
  styles: [
    `
      .cell-primary {
        font-weight: 600;
      }

      .cell-secondary {
        font-size: 0.75rem;
        color: var(--text-secondary);
      }

      .confirm-text {
        margin: 0;
        color: var(--text-secondary);
      }
    `,
  ],
})
export class RequestsComponent implements OnInit {
  private readonly service = inject(RequestsService);
  private readonly beneficiariesService = inject(BeneficiariesService);
  private readonly notifications = inject(NotificationService);

  readonly requests = signal<SupportRequest[]>([]);
  readonly beneficiaries = signal<Beneficiary[]>([]);
  readonly loading = signal(true);
  readonly saving = signal(false);
  readonly errorMessage = signal('');

  readonly searchTerm = signal('');
  readonly categoryFilter = signal<'all' | RequestCategory>('all');
  readonly statusFilter = signal<'all' | RequestStatus>('all');

  readonly showFormModal = signal(false);
  readonly editingId = signal<string | null>(null);
  readonly pendingDeactivate = signal<SupportRequest | null>(null);

  form: RequestFormModel = this.createEmptyForm();

  readonly pendingCount = computed(
    () => this.requests().filter((r) => r.status === 'pending' || r.status === 'in_review').length,
  );
  readonly approvedCount = computed(
    () => this.requests().filter((r) => r.status === 'approved').length,
  );
  readonly fulfilledCount = computed(
    () => this.requests().filter((r) => r.status === 'fulfilled').length,
  );

  readonly filteredRequests = computed(() => {
    const q = this.searchTerm().trim().toLowerCase();
    const cat = this.categoryFilter();
    const status = this.statusFilter();

    return this.requests().filter((r) => {
      if (cat !== 'all' && r.category !== cat) {
        return false;
      }
      if (status !== 'all' && r.status !== status) {
        return false;
      }
      if (!q) {
        return true;
      }
      return (
        r.code.toLowerCase().includes(q) ||
        r.title.toLowerCase().includes(q) ||
        r.beneficiaryName.toLowerCase().includes(q) ||
        r.sector.toLowerCase().includes(q)
      );
    });
  });

  ngOnInit(): void {
    void this.loadData();
  }

  async loadData(): Promise<void> {
    this.loading.set(true);
    this.errorMessage.set('');
    try {
      const [reqs, bens] = await Promise.all([
        this.service.list(),
        this.beneficiariesService.list(),
      ]);
      this.requests.set(reqs);
      this.beneficiaries.set(bens);
    } catch (error) {
      this.errorMessage.set(
        getFirebaseErrorMessage(error, 'No fue posible cargar las solicitudes.'),
      );
    } finally {
      this.loading.set(false);
    }
  }

  onBeneficiarySelected(beneficiaryId: string): void {
    this.form.beneficiaryId = beneficiaryId;
    const found = this.beneficiaries().find((b) => b.id === beneficiaryId);
    if (found) {
      this.form.beneficiaryName = found.fullName;
      this.form.requesterPhone = found.phone;
      this.form.sector = found.sector;
    }
  }

  openCreateModal(): void {
    this.editingId.set(null);
    this.form = this.createEmptyForm();
    this.showFormModal.set(true);
  }

  openEditModal(item: SupportRequest): void {
    this.editingId.set(item.id ?? null);
    this.form = {
      code: item.code,
      title: item.title,
      category: item.category,
      priority: item.priority,
      status: item.status,
      beneficiaryId: item.beneficiaryId ?? '',
      beneficiaryName: item.beneficiaryName,
      requesterPhone: item.requesterPhone,
      sector: item.sector,
      description: item.description,
      requestDate: item.requestDate,
      resolutionNotes: item.resolutionNotes ?? '',
    };
    this.showFormModal.set(true);
  }

  closeModals(): void {
    this.showFormModal.set(false);
    this.editingId.set(null);
  }

  async saveRequest(): Promise<void> {
    this.saving.set(true);
    try {
      const payload = {
        code: this.form.code.trim(),
        title: this.form.title.trim(),
        category: this.form.category,
        priority: this.form.priority,
        status: this.form.status,
        beneficiaryId: this.form.beneficiaryId || undefined,
        beneficiaryName: this.form.beneficiaryName.trim(),
        requesterPhone: this.form.requesterPhone.trim(),
        sector: this.form.sector.trim(),
        description: this.form.description.trim(),
        requestDate: this.form.requestDate,
        resolvedDate:
          this.form.status === 'fulfilled' || this.form.status === 'rejected'
            ? new Date().toISOString().slice(0, 10)
            : undefined,
        resolutionNotes: this.form.resolutionNotes.trim(),
      };

      const id = this.editingId();
      if (id) {
        await this.service.update(id, payload, payload.code);
        this.notifications.success('Solicitud actualizada', `Se actualizó ${payload.code}.`);
      } else {
        await this.service.create(payload, payload.code);
        this.notifications.success('Solicitud registrada', `Se registró ${payload.code}.`);
      }

      this.closeModals();
      await this.loadData();
    } catch (error) {
      this.notifications.error(
        'Error al guardar',
        getFirebaseErrorMessage(error, 'No fue posible guardar la solicitud.'),
      );
    } finally {
      this.saving.set(false);
    }
  }

  async executeDeactivate(): Promise<void> {
    const target = this.pendingDeactivate();
    if (!target?.id) {
      return;
    }
    this.saving.set(true);
    try {
      await this.service.deactivate(target.id, target.code);
      this.pendingDeactivate.set(null);
      this.notifications.info('Solicitud archivada', `Se archivó ${target.code}.`);
      await this.loadData();
    } catch (error) {
      this.notifications.error(
        'Error al archivar',
        getFirebaseErrorMessage(error, 'No fue posible archivar la solicitud.'),
      );
    } finally {
      this.saving.set(false);
    }
  }

  formatCategory(cat: RequestCategory): string {
    switch (cat) {
      case 'food':
        return 'Alimentación';
      case 'health':
        return 'Salud / Medicinas';
      case 'education':
        return 'Educación';
      case 'housing':
        return 'Vivienda / Enseres';
      case 'clothing':
        return 'Vestimenta';
      case 'other':
        return 'Otro';
    }
  }

  formatPriority(priority: RequestPriority): string {
    switch (priority) {
      case 'low':
        return 'Baja';
      case 'medium':
        return 'Media';
      case 'high':
        return 'Alta';
      case 'urgent':
        return 'Urgente';
    }
  }

  priorityVariant(priority: RequestPriority): BadgeVariant {
    switch (priority) {
      case 'low':
        return 'neutral';
      case 'medium':
        return 'info';
      case 'high':
        return 'warning';
      case 'urgent':
        return 'danger';
    }
  }

  formatStatus(status: RequestStatus): string {
    switch (status) {
      case 'pending':
        return 'Pendiente';
      case 'in_review':
        return 'En revisión';
      case 'approved':
        return 'Aprobada';
      case 'fulfilled':
        return 'Atendida';
      case 'rejected':
        return 'No procedente';
    }
  }

  statusVariant(status: RequestStatus): BadgeVariant {
    switch (status) {
      case 'pending':
        return 'warning';
      case 'in_review':
        return 'info';
      case 'approved':
        return 'info';
      case 'fulfilled':
        return 'success';
      case 'rejected':
        return 'danger';
    }
  }

  private createEmptyForm(): RequestFormModel {
    const seq = String(this.requests().length + 1).padStart(4, '0');
    return {
      code: `SOL-${new Date().getFullYear()}-${seq}`,
      title: '',
      category: 'food',
      priority: 'medium',
      status: 'pending',
      beneficiaryId: '',
      beneficiaryName: '',
      requesterPhone: '',
      sector: '',
      description: '',
      requestDate: new Date().toISOString().slice(0, 10),
      resolutionNotes: '',
    };
  }
}
