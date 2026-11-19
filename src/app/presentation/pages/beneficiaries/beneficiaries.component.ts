import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import {
  Beneficiary,
  BeneficiaryStatus,
  VulnerabilityLevel,
} from '../../../domain/entities/beneficiary.entity';
import { BeneficiariesService } from '../../../infrastructure/services/foundation-modules.service';
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

interface BeneficiaryFormModel {
  fullName: string;
  documentId: string;
  phone: string;
  email: string;
  sector: string;
  address: string;
  householdSize: number;
  dependentsCount: number;
  monthlyIncomeRange: string;
  housingCondition: string;
  vulnerabilityLevel: VulnerabilityLevel;
  needs: string;
  program: string;
  status: BeneficiaryStatus;
  lastAttentionDate: string;
  notes: string;
}

@Component({
  selector: 'app-beneficiaries',
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
      title="Módulo de Beneficiarios"
      subtitle="Registro, seguimiento integral, información socioeconómica y grupo familiar"
      badgeText="Operativo"
      badgeType="success"
    >
      <button type="button" class="btn btn--outline btn--sm" (click)="loadBeneficiaries()">
        &#8635; Actualizar
      </button>
      <button type="button" class="btn btn--primary" (click)="openCreateModal()">
        + Registrar Beneficiario
      </button>
    </app-page-header>

    @if (errorMessage()) {
      <app-alert type="danger" title="Error de carga">
        {{ errorMessage() }}
      </app-alert>
    }

    <section class="grid-stats" aria-label="Resumen de beneficiarios">
      <app-stat-card
        label="Total Registrados"
        [value]="beneficiaries().length"
        hint="Fichas activas en Firestore"
        tag="Padrón"
      />
      <app-stat-card
        label="En Seguimiento Activo"
        [value]="activeCount()"
        hint="Requieren atención continua"
        tag="Activos"
      />
      <app-stat-card
        label="Atendidos"
        [value]="assistedCount()"
        hint="Con entrega o asistencia reciente"
        tag="Cobertura"
      />
      <app-stat-card
        label="Personas en Hogares"
        [value]="totalHouseholdMembers()"
        hint="Cobertura familiar estimada"
        tag="Impacto"
      />
    </section>

    <div class="card module-filters">
      <div class="filter-group">
        <label for="search-beneficiary" class="filter-label">Buscar beneficiario:</label>
        <input
          id="search-beneficiary"
          type="text"
          class="filter-input"
          placeholder="Nombre, cédula o sector..."
          [ngModel]="searchTerm()"
          (ngModelChange)="searchTerm.set($event)"
        />
      </div>
      <div class="filter-group">
        <label for="filter-status" class="filter-label">Estado:</label>
        <select
          id="filter-status"
          class="filter-select"
          [ngModel]="statusFilter()"
          (ngModelChange)="statusFilter.set($event)"
        >
          <option value="all">Todos los estados</option>
          <option value="active">Activo</option>
          <option value="assisted">Atendido</option>
          <option value="inactive">Inactivo</option>
        </select>
      </div>
      <div class="filter-group">
        <label for="filter-vulnerability" class="filter-label">Vulnerabilidad:</label>
        <select
          id="filter-vulnerability"
          class="filter-select"
          [ngModel]="vulnerabilityFilter()"
          (ngModelChange)="vulnerabilityFilter.set($event)"
        >
          <option value="all">Todos los niveles</option>
          <option value="critical">Crítica</option>
          <option value="high">Alta</option>
          <option value="medium">Media</option>
          <option value="low">Baja</option>
        </select>
      </div>
    </div>

    @if (loading()) {
      <div class="card loading-state">Cargando padrón de beneficiarios desde Firestore…</div>
    } @else if (filteredBeneficiaries().length === 0) {
      <app-empty-state
        title="No se encontraron beneficiarios"
        description="Registra un nuevo beneficiario o ajusta los filtros de búsqueda para consultar los registros existentes."
      />
    } @else {
      <div class="card table-card">
        <div class="table-responsive">
          <table class="data-table">
            <thead>
              <tr>
                <th>Beneficiario</th>
                <th>Cédula / ID</th>
                <th>Sector (Quito)</th>
                <th>Hogar</th>
                <th>Vulnerabilidad</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              @for (item of filteredBeneficiaries(); track item.id) {
                <tr>
                  <td>
                    <div class="cell-primary">{{ item.fullName }}</div>
                    <div class="cell-secondary">{{ item.phone || 'Sin teléfono' }}</div>
                  </td>
                  <td>{{ item.documentId }}</td>
                  <td>{{ item.sector }}</td>
                  <td>{{ item.householdSize }} pers. ({{ item.dependentsCount }} dep.)</td>
                  <td>
                    <app-status-badge
                      [text]="formatVulnerability(item.vulnerabilityLevel)"
                      [variant]="vulnerabilityVariant(item.vulnerabilityLevel)"
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
                        (click)="openDetailModal(item)"
                      >
                        Ver
                      </button>
                      <button
                        type="button"
                        class="btn btn--outline btn--sm"
                        (click)="openEditModal(item)"
                      >
                        Editar
                      </button>
                      <button
                        type="button"
                        class="btn btn--ghost btn--sm"
                        (click)="confirmDeactivate(item)"
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
      <div class="modal-backdrop" role="dialog" aria-modal="true" aria-labelledby="ben-modal-title">
        <div class="modal-panel">
          <div class="modal-panel__header">
            <h2 id="ben-modal-title">
              {{ editingId() ? 'Editar Beneficiario' : 'Registrar Beneficiario' }}
            </h2>
            <button
              type="button"
              class="modal-panel__close"
              aria-label="Cerrar modal"
              (click)="closeModals()"
            >
              &times;
            </button>
          </div>

          <form (ngSubmit)="saveBeneficiary()" #benForm="ngForm">
            <div class="modal-panel__body">
              <div class="form-grid">
                <div class="form-field">
                  <label for="ben-name">Nombre completo *</label>
                  <input
                    id="ben-name"
                    name="fullName"
                    class="form-control"
                    required
                    minlength="3"
                    [(ngModel)]="form.fullName"
                    placeholder="Ej. Rosa Elena Guayasamín"
                  />
                </div>

                <div class="form-field">
                  <label for="ben-doc">Cédula / Documento *</label>
                  <input
                    id="ben-doc"
                    name="documentId"
                    class="form-control"
                    required
                    minlength="6"
                    maxlength="20"
                    [(ngModel)]="form.documentId"
                    placeholder="Ej. 1712345678"
                  />
                </div>

                <div class="form-field">
                  <label for="ben-phone">Teléfono *</label>
                  <input
                    id="ben-phone"
                    name="phone"
                    class="form-control"
                    required
                    [(ngModel)]="form.phone"
                    placeholder="Ej. 0987654321"
                  />
                </div>

                <div class="form-field">
                  <label for="ben-email">Correo electrónico</label>
                  <input
                    id="ben-email"
                    name="email"
                    type="email"
                    class="form-control"
                    [(ngModel)]="form.email"
                    placeholder="opcional@correo.com"
                  />
                </div>

                <div class="form-field">
                  <label for="ben-sector">Sector / Parroquia *</label>
                  <input
                    id="ben-sector"
                    name="sector"
                    class="form-control"
                    required
                    [(ngModel)]="form.sector"
                    placeholder="Ej. Chillogallo, Calderón, Centro Histórico"
                  />
                </div>

                <div class="form-field">
                  <label for="ben-address">Dirección domiciliaria *</label>
                  <input
                    id="ben-address"
                    name="address"
                    class="form-control"
                    required
                    [(ngModel)]="form.address"
                    placeholder="Calle principal y referencia"
                  />
                </div>

                <div class="form-field">
                  <label for="ben-household">Integrantes del hogar *</label>
                  <input
                    id="ben-household"
                    name="householdSize"
                    type="number"
                    min="1"
                    max="30"
                    class="form-control"
                    required
                    [(ngModel)]="form.householdSize"
                  />
                </div>

                <div class="form-field">
                  <label for="ben-dependents">Cargas / Dependientes *</label>
                  <input
                    id="ben-dependents"
                    name="dependentsCount"
                    type="number"
                    min="0"
                    max="25"
                    class="form-control"
                    required
                    [(ngModel)]="form.dependentsCount"
                  />
                </div>

                <div class="form-field">
                  <label for="ben-income">Rango de ingresos mensuales</label>
                  <select
                    id="ben-income"
                    name="monthlyIncomeRange"
                    class="form-control"
                    [(ngModel)]="form.monthlyIncomeRange"
                  >
                    <option value="Sin ingresos fijos">Sin ingresos fijos</option>
                    <option value="Menor a $200">Menor a $200</option>
                    <option value="$200 - $460">$200 - $460</option>
                    <option value="Mayor a $460">Mayor a $460</option>
                  </select>
                </div>

                <div class="form-field">
                  <label for="ben-housing">Condición habitacional</label>
                  <select
                    id="ben-housing"
                    name="housingCondition"
                    class="form-control"
                    [(ngModel)]="form.housingCondition"
                  >
                    <option value="Arrendada">Arrendada</option>
                    <option value="Propia">Propia</option>
                    <option value="Prestada / Acogida">Prestada / Acogida</option>
                    <option value="Situación precaria">Situación precaria</option>
                  </select>
                </div>

                <div class="form-field">
                  <label for="ben-vuln">Nivel de vulnerabilidad *</label>
                  <select
                    id="ben-vuln"
                    name="vulnerabilityLevel"
                    class="form-control"
                    required
                    [(ngModel)]="form.vulnerabilityLevel"
                  >
                    <option value="low">Baja</option>
                    <option value="medium">Media</option>
                    <option value="high">Alta</option>
                    <option value="critical">Crítica</option>
                  </select>
                </div>

                <div class="form-field">
                  <label for="ben-status">Estado *</label>
                  <select
                    id="ben-status"
                    name="status"
                    class="form-control"
                    required
                    [(ngModel)]="form.status"
                  >
                    <option value="active">Activo</option>
                    <option value="assisted">Atendido</option>
                    <option value="inactive">Inactivo</option>
                  </select>
                </div>

                <div class="form-field">
                  <label for="ben-program">Programa de apoyo</label>
                  <input
                    id="ben-program"
                    name="program"
                    class="form-control"
                    [(ngModel)]="form.program"
                    placeholder="Ej. Asistencia Alimentaria, Niñez"
                  />
                </div>

                <div class="form-field">
                  <label for="ben-date">Última fecha de atención</label>
                  <input
                    id="ben-date"
                    name="lastAttentionDate"
                    type="date"
                    class="form-control"
                    [(ngModel)]="form.lastAttentionDate"
                  />
                </div>

                <div class="form-field form-field--full">
                  <label for="ben-needs">Necesidades prioritarias *</label>
                  <textarea
                    id="ben-needs"
                    name="needs"
                    rows="2"
                    class="form-control"
                    required
                    [(ngModel)]="form.needs"
                    placeholder="Alimentos, útiles escolares, medicinas, vestimenta..."
                  ></textarea>
                </div>

                <div class="form-field form-field--full">
                  <label for="ben-notes">Observaciones de seguimiento</label>
                  <textarea
                    id="ben-notes"
                    name="notes"
                    rows="2"
                    class="form-control"
                    [(ngModel)]="form.notes"
                    placeholder="Notas relevantes de visitas o entregas..."
                  ></textarea>
                </div>
              </div>
            </div>

            <div class="modal-panel__footer">
              <button type="button" class="btn btn--outline" (click)="closeModals()">
                Cancelar
              </button>
              <button
                type="submit"
                class="btn btn--primary"
                [disabled]="saving() || benForm.invalid"
              >
                {{ saving() ? 'Guardando…' : editingId() ? 'Guardar cambios' : 'Registrar' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    }

    @if (selectedDetail(); as detail) {
      <div class="modal-backdrop" role="dialog" aria-modal="true">
        <div class="modal-panel">
          <div class="modal-panel__header">
            <h2>Ficha del Beneficiario</h2>
            <button type="button" class="modal-panel__close" (click)="selectedDetail.set(null)">
              &times;
            </button>
          </div>
          <div class="modal-panel__body">
            <dl class="detail-grid">
              <div><dt>Nombre completo</dt><dd>{{ detail.fullName }}</dd></div>
              <div><dt>Cédula / ID</dt><dd>{{ detail.documentId }}</dd></div>
              <div><dt>Teléfono</dt><dd>{{ detail.phone }}</dd></div>
              <div><dt>Correo</dt><dd>{{ detail.email || 'No registrado' }}</dd></div>
              <div><dt>Sector</dt><dd>{{ detail.sector }}</dd></div>
              <div><dt>Dirección</dt><dd>{{ detail.address }}</dd></div>
              <div><dt>Tamaño del hogar</dt><dd>{{ detail.householdSize }} personas ({{ detail.dependentsCount }} dependientes)</dd></div>
              <div><dt>Ingresos / Vivienda</dt><dd>{{ detail.monthlyIncomeRange }} · {{ detail.housingCondition }}</dd></div>
              <div><dt>Vulnerabilidad</dt><dd>{{ formatVulnerability(detail.vulnerabilityLevel) }}</dd></div>
              <div><dt>Estado</dt><dd>{{ formatStatus(detail.status) }}</dd></div>
              <div class="detail-full"><dt>Necesidades</dt><dd>{{ detail.needs }}</dd></div>
              <div class="detail-full"><dt>Observaciones</dt><dd>{{ detail.notes || 'Sin observaciones adicionales.' }}</dd></div>
            </dl>
          </div>
          <div class="modal-panel__footer">
            <button type="button" class="btn btn--primary" (click)="selectedDetail.set(null)">
              Cerrar
            </button>
          </div>
        </div>
      </div>
    }

    @if (pendingDeactivate(); as target) {
      <div class="modal-backdrop" role="dialog" aria-modal="true">
        <div class="modal-panel modal-panel--sm">
          <div class="modal-panel__header">
            <h2>Archivar Beneficiario</h2>
            <button type="button" class="modal-panel__close" (click)="pendingDeactivate.set(null)">
              &times;
            </button>
          </div>
          <div class="modal-panel__body">
            <p class="confirm-text">
              ¿Deseas archivar la ficha de <strong>{{ target.fullName }}</strong>? El registro se
              desactivará lógicamente conservando el historial en Firestore.
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
              {{ saving() ? 'Archivando…' : 'Confirmar archivo' }}
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
        color: var(--text-primary);
      }

      .cell-secondary {
        font-size: 0.75rem;
        color: var(--text-secondary);
      }

      .detail-grid {
        display: grid;
        grid-template-columns: 1fr;
        gap: 1rem;
        margin: 0;

        @media (min-width: 640px) {
          grid-template-columns: repeat(2, 1fr);
        }

        dt {
          font-size: 0.75rem;
          font-weight: 600;
          color: var(--text-muted);
          text-transform: uppercase;
        }

        dd {
          margin: 0.25rem 0 0;
          font-size: 0.875rem;
          color: var(--text-primary);
        }
      }

      .detail-full {
        grid-column: 1 / -1;
      }

      .confirm-text {
        margin: 0;
        font-size: 0.9375rem;
        color: var(--text-secondary);
        line-height: 1.5;
      }
    `,
  ],
})
export class BeneficiariesComponent implements OnInit {
  private readonly service = inject(BeneficiariesService);
  private readonly notifications = inject(NotificationService);

  readonly beneficiaries = signal<Beneficiary[]>([]);
  readonly loading = signal(true);
  readonly saving = signal(false);
  readonly errorMessage = signal('');

  readonly searchTerm = signal('');
  readonly statusFilter = signal<'all' | BeneficiaryStatus>('all');
  readonly vulnerabilityFilter = signal<'all' | VulnerabilityLevel>('all');

  readonly showFormModal = signal(false);
  readonly editingId = signal<string | null>(null);
  readonly selectedDetail = signal<Beneficiary | null>(null);
  readonly pendingDeactivate = signal<Beneficiary | null>(null);

  form: BeneficiaryFormModel = this.createEmptyForm();

  readonly activeCount = computed(
    () => this.beneficiaries().filter((b) => b.status === 'active').length,
  );
  readonly assistedCount = computed(
    () => this.beneficiaries().filter((b) => b.status === 'assisted').length,
  );
  readonly totalHouseholdMembers = computed(() =>
    this.beneficiaries().reduce((sum, b) => sum + (Number(b.householdSize) || 0), 0),
  );

  readonly filteredBeneficiaries = computed(() => {
    const query = this.searchTerm().trim().toLowerCase();
    const status = this.statusFilter();
    const vuln = this.vulnerabilityFilter();

    return this.beneficiaries().filter((item) => {
      if (status !== 'all' && item.status !== status) {
        return false;
      }
      if (vuln !== 'all' && item.vulnerabilityLevel !== vuln) {
        return false;
      }
      if (!query) {
        return true;
      }
      return (
        item.fullName.toLowerCase().includes(query) ||
        item.documentId.toLowerCase().includes(query) ||
        item.sector.toLowerCase().includes(query)
      );
    });
  });

  ngOnInit(): void {
    void this.loadBeneficiaries();
  }

  async loadBeneficiaries(): Promise<void> {
    this.loading.set(true);
    this.errorMessage.set('');
    try {
      const items = await this.service.list();
      this.beneficiaries.set(items);
    } catch (error) {
      this.errorMessage.set(
        getFirebaseErrorMessage(error, 'No fue posible cargar los beneficiarios.'),
      );
    } finally {
      this.loading.set(false);
    }
  }

  openCreateModal(): void {
    this.editingId.set(null);
    this.form = this.createEmptyForm();
    this.showFormModal.set(true);
  }

  openEditModal(item: Beneficiary): void {
    this.editingId.set(item.id ?? null);
    this.form = {
      fullName: item.fullName,
      documentId: item.documentId,
      phone: item.phone,
      email: item.email ?? '',
      sector: item.sector,
      address: item.address,
      householdSize: item.householdSize,
      dependentsCount: item.dependentsCount,
      monthlyIncomeRange: item.monthlyIncomeRange,
      housingCondition: item.housingCondition,
      vulnerabilityLevel: item.vulnerabilityLevel,
      needs: item.needs,
      program: item.program ?? '',
      status: item.status,
      lastAttentionDate: item.lastAttentionDate ?? '',
      notes: item.notes ?? '',
    };
    this.showFormModal.set(true);
  }

  openDetailModal(item: Beneficiary): void {
    this.selectedDetail.set(item);
  }

  confirmDeactivate(item: Beneficiary): void {
    this.pendingDeactivate.set(item);
  }

  closeModals(): void {
    this.showFormModal.set(false);
    this.editingId.set(null);
  }

  async saveBeneficiary(): Promise<void> {
    this.saving.set(true);
    try {
      const payload = {
        ...this.form,
        fullName: this.form.fullName.trim(),
        documentId: this.form.documentId.trim(),
        phone: this.form.phone.trim(),
        email: this.form.email.trim(),
        sector: this.form.sector.trim(),
        address: this.form.address.trim(),
        needs: this.form.needs.trim(),
        program: this.form.program.trim(),
        notes: this.form.notes.trim(),
      };

      const id = this.editingId();
      if (id) {
        await this.service.update(id, payload, payload.fullName);
        this.notifications.success(
          'Beneficiario actualizado',
          `Se actualizó la ficha de ${payload.fullName}.`,
        );
      } else {
        await this.service.create(payload, payload.fullName);
        this.notifications.success(
          'Beneficiario registrado',
          `Se registró correctamente a ${payload.fullName}.`,
        );
      }

      this.closeModals();
      await this.loadBeneficiaries();
    } catch (error) {
      const msg = getFirebaseErrorMessage(error, 'No fue posible guardar el beneficiario.');
      this.notifications.error('Error al guardar', msg);
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
      await this.service.deactivate(target.id, target.fullName);
      this.pendingDeactivate.set(null);
      this.notifications.info(
        'Beneficiario archivado',
        `La ficha de ${target.fullName} fue archivada.`,
      );
      await this.loadBeneficiaries();
    } catch (error) {
      const msg = getFirebaseErrorMessage(error, 'No fue posible archivar el beneficiario.');
      this.notifications.error('Error al archivar', msg);
    } finally {
      this.saving.set(false);
    }
  }

  formatStatus(status: BeneficiaryStatus): string {
    switch (status) {
      case 'active':
        return 'Activo';
      case 'assisted':
        return 'Atendido';
      case 'inactive':
        return 'Inactivo';
    }
  }

  statusVariant(status: BeneficiaryStatus): BadgeVariant {
    switch (status) {
      case 'active':
        return 'info';
      case 'assisted':
        return 'success';
      case 'inactive':
        return 'neutral';
    }
  }

  formatVulnerability(level: VulnerabilityLevel): string {
    switch (level) {
      case 'critical':
        return 'Crítica';
      case 'high':
        return 'Alta';
      case 'medium':
        return 'Media';
      case 'low':
        return 'Baja';
    }
  }

  vulnerabilityVariant(level: VulnerabilityLevel): BadgeVariant {
    switch (level) {
      case 'critical':
        return 'danger';
      case 'high':
        return 'warning';
      case 'medium':
        return 'info';
      case 'low':
        return 'success';
    }
  }

  private createEmptyForm(): BeneficiaryFormModel {
    return {
      fullName: '',
      documentId: '',
      phone: '',
      email: '',
      sector: '',
      address: '',
      householdSize: 1,
      dependentsCount: 0,
      monthlyIncomeRange: 'Sin ingresos fijos',
      housingCondition: 'Arrendada',
      vulnerabilityLevel: 'medium',
      needs: '',
      program: '',
      status: 'active',
      lastAttentionDate: new Date().toISOString().slice(0, 10),
      notes: '',
    };
  }
}
