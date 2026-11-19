import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Activity, ActivityStatus, ActivityType } from '../../../domain/entities/activity.entity';
import { Beneficiary } from '../../../domain/entities/beneficiary.entity';
import { Volunteer } from '../../../domain/entities/volunteer.entity';
import {
  ActivitiesService,
  BeneficiariesService,
  VolunteersService,
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

interface ActivityFormModel {
  title: string;
  type: ActivityType;
  date: string;
  startTime: string;
  location: string;
  description: string;
  status: ActivityStatus;
  responsibleName: string;
  volunteerIds: string[];
  beneficiaryIds: string[];
  beneficiariesCount: number;
  notes: string;
}

@Component({
  selector: 'app-activities',
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
      title="Módulo de Actividades y Eventos"
      subtitle="Planificación, ejecución y bitácora de jornadas sociales, educativas, comunitarias y entregas"
      badgeText="Operativo"
      badgeType="success"
    >
      <button type="button" class="btn btn--outline btn--sm" (click)="loadData()">
        &#8635; Actualizar
      </button>
      <button type="button" class="btn btn--primary" (click)="openCreateModal()">
        + Registrar Actividad
      </button>
    </app-page-header>

    @if (errorMessage()) {
      <app-alert type="danger" title="Error de carga">
        {{ errorMessage() }}
      </app-alert>
    }

    <section class="grid-stats" aria-label="Resumen de actividades">
      <app-stat-card
        label="Total Actividades"
        [value]="activities().length"
        hint="Jornadas registradas"
        tag="Agenda"
      />
      <app-stat-card
        label="Planificadas"
        [value]="plannedCount()"
        hint="Próximas por ejecutar"
        tag="Agenda"
      />
      <app-stat-card
        label="Finalizadas"
        [value]="completedCount()"
        hint="Ejecutadas con seguimiento"
        tag="Impacto"
      />
      <app-stat-card
        label="Beneficiarios Alcanzados"
        [value]="totalBeneficiariesReached()"
        hint="Participación acumulada"
        tag="Cobertura"
      />
    </section>

    <div class="card module-filters">
      <div class="filter-group">
        <label for="search-activity" class="filter-label">Buscar actividad:</label>
        <input
          id="search-activity"
          type="text"
          class="filter-input"
          placeholder="Nombre del evento, lugar o responsable..."
          [ngModel]="searchTerm()"
          (ngModelChange)="searchTerm.set($event)"
        />
      </div>
      <div class="filter-group">
        <label for="filter-activity-type" class="filter-label">Tipo:</label>
        <select
          id="filter-activity-type"
          class="filter-select"
          [ngModel]="typeFilter()"
          (ngModelChange)="typeFilter.set($event)"
        >
          <option value="all">Todos los tipos</option>
          <option value="social">Social / Asistencial</option>
          <option value="educational">Educativa / Formación</option>
          <option value="community">Comunitaria / Integración</option>
          <option value="donation_campaign">Campaña de Donación</option>
          <option value="family_support">Acompañamiento Familiar</option>
        </select>
      </div>
      <div class="filter-group">
        <label for="filter-activity-status" class="filter-label">Estado:</label>
        <select
          id="filter-activity-status"
          class="filter-select"
          [ngModel]="statusFilter()"
          (ngModelChange)="statusFilter.set($event)"
        >
          <option value="all">Todos los estados</option>
          <option value="planned">Planificada</option>
          <option value="in_progress">En curso</option>
          <option value="completed">Finalizada</option>
          <option value="cancelled">Cancelada</option>
        </select>
      </div>
    </div>

    @if (loading()) {
      <div class="card loading-state">Cargando actividades desde Firestore…</div>
    } @else if (filteredActivities().length === 0) {
      <app-empty-state
        title="No hay actividades registradas"
        description="Registra una nueva jornada o ajusta los filtros para consultar el calendario."
      />
    } @else {
      <div class="card table-card">
        <div class="table-responsive">
          <table class="data-table">
            <thead>
              <tr>
                <th>Actividad</th>
                <th>Fecha y Lugar</th>
                <th>Tipo</th>
                <th>Participación</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              @for (item of filteredActivities(); track item.id) {
                <tr>
                  <td>
                    <div class="cell-primary">{{ item.title }}</div>
                    <div class="cell-secondary">Resp.: {{ item.responsibleName }}</div>
                  </td>
                  <td>
                    <div>{{ item.date }} · {{ item.startTime }}</div>
                    <div class="cell-secondary">{{ item.location }}</div>
                  </td>
                  <td>{{ formatType(item.type) }}</td>
                  <td>
                    <div>{{ item.volunteerIds.length }} voluntarios</div>
                    <div class="cell-secondary">{{ item.beneficiariesCount }} beneficiarios</div>
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
                        (click)="selectedDetail.set(item)"
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
            <h2>{{ editingId() ? 'Editar Actividad' : 'Registrar Actividad' }}</h2>
            <button type="button" class="modal-panel__close" (click)="closeModals()">&times;</button>
          </div>
          <form (ngSubmit)="saveActivity()" #actForm="ngForm">
            <div class="modal-panel__body">
              <div class="form-grid">
                <div class="form-field form-field--full">
                  <label for="act-title">Nombre de la actividad *</label>
                  <input
                    id="act-title"
                    name="title"
                    class="form-control"
                    required
                    minlength="3"
                    [(ngModel)]="form.title"
                    placeholder="Ej. Jornada de entrega de kits escolares"
                  />
                </div>

                <div class="form-field">
                  <label for="act-type">Tipo *</label>
                  <select
                    id="act-type"
                    name="type"
                    class="form-control"
                    required
                    [(ngModel)]="form.type"
                  >
                    <option value="social">Social / Asistencial</option>
                    <option value="educational">Educativa / Formación</option>
                    <option value="community">Comunitaria / Integración</option>
                    <option value="donation_campaign">Campaña de Donación</option>
                    <option value="family_support">Acompañamiento Familiar</option>
                  </select>
                </div>

                <div class="form-field">
                  <label for="act-status">Estado *</label>
                  <select
                    id="act-status"
                    name="status"
                    class="form-control"
                    required
                    [(ngModel)]="form.status"
                  >
                    <option value="planned">Planificada</option>
                    <option value="in_progress">En curso</option>
                    <option value="completed">Finalizada</option>
                    <option value="cancelled">Cancelada</option>
                  </select>
                </div>

                <div class="form-field">
                  <label for="act-date">Fecha *</label>
                  <input
                    id="act-date"
                    name="date"
                    type="date"
                    class="form-control"
                    required
                    [(ngModel)]="form.date"
                  />
                </div>

                <div class="form-field">
                  <label for="act-time">Hora de inicio *</label>
                  <input
                    id="act-time"
                    name="startTime"
                    type="time"
                    class="form-control"
                    required
                    [(ngModel)]="form.startTime"
                  />
                </div>

                <div class="form-field">
                  <label for="act-loc">Lugar / Sector (Quito) *</label>
                  <input
                    id="act-loc"
                    name="location"
                    class="form-control"
                    required
                    [(ngModel)]="form.location"
                    placeholder="Ej. Casa Comunal Chillogallo"
                  />
                </div>

                <div class="form-field">
                  <label for="act-resp">Responsable *</label>
                  <input
                    id="act-resp"
                    name="responsibleName"
                    class="form-control"
                    required
                    [(ngModel)]="form.responsibleName"
                    placeholder="Coordinador encargado"
                  />
                </div>

                <div class="form-field">
                  <label for="act-count">N.º aproximado de beneficiarios *</label>
                  <input
                    id="act-count"
                    name="beneficiariesCount"
                    type="number"
                    min="0"
                    class="form-control"
                    required
                    [(ngModel)]="form.beneficiariesCount"
                  />
                </div>

                <div class="form-field form-field--full">
                  <label for="act-desc">Descripción *</label>
                  <textarea
                    id="act-desc"
                    name="description"
                    rows="2"
                    class="form-control"
                    required
                    [(ngModel)]="form.description"
                  ></textarea>
                </div>

                @if (volunteers().length > 0) {
                  <div class="form-field form-field--full">
                    <span class="filter-label">Voluntarios asignados</span>
                    <div class="multi-check-grid">
                      @for (v of volunteers(); track v.id) {
                        @if (v.id) {
                          <label class="check-pill">
                            <input
                              type="checkbox"
                              [checked]="form.volunteerIds.includes(v.id)"
                              (change)="toggleVolunteer(v.id)"
                            />
                            <span>{{ v.fullName }}</span>
                          </label>
                        }
                      }
                    </div>
                  </div>
                }

                @if (beneficiaries().length > 0) {
                  <div class="form-field form-field--full">
                    <span class="filter-label">Beneficiarios vinculados</span>
                    <div class="multi-check-grid">
                      @for (b of beneficiaries(); track b.id) {
                        @if (b.id) {
                          <label class="check-pill">
                            <input
                              type="checkbox"
                              [checked]="form.beneficiaryIds.includes(b.id)"
                              (change)="toggleBeneficiary(b.id)"
                            />
                            <span>{{ b.fullName }}</span>
                          </label>
                        }
                      }
                    </div>
                  </div>
                }

                <div class="form-field form-field--full">
                  <label for="act-notes">Notas y resultados</label>
                  <textarea
                    id="act-notes"
                    name="notes"
                    rows="2"
                    class="form-control"
                    [(ngModel)]="form.notes"
                  ></textarea>
                </div>
              </div>
            </div>
            <div class="modal-panel__footer">
              <button type="button" class="btn btn--outline" (click)="closeModals()">Cancelar</button>
              <button
                type="submit"
                class="btn btn--primary"
                [disabled]="saving() || actForm.invalid"
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
            <h2>Detalle de Actividad</h2>
            <button type="button" class="modal-panel__close" (click)="selectedDetail.set(null)">
              &times;
            </button>
          </div>
          <div class="modal-panel__body">
            <dl class="detail-grid">
              <div><dt>Actividad</dt><dd>{{ detail.title }}</dd></div>
              <div><dt>Tipo / Estado</dt><dd>{{ formatType(detail.type) }} · {{ formatStatus(detail.status) }}</dd></div>
              <div><dt>Fecha y hora</dt><dd>{{ detail.date }} a las {{ detail.startTime }}</dd></div>
              <div><dt>Lugar</dt><dd>{{ detail.location }}</dd></div>
              <div><dt>Responsable</dt><dd>{{ detail.responsibleName }}</dd></div>
              <div><dt>Cobertura</dt><dd>{{ detail.beneficiariesCount }} beneficiarios · {{ detail.volunteerIds.length }} voluntarios</dd></div>
              <div class="detail-full"><dt>Descripción</dt><dd>{{ detail.description }}</dd></div>
              <div class="detail-full"><dt>Notas</dt><dd>{{ detail.notes || 'Sin notas adicionales.' }}</dd></div>
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
            <h2>Archivar Actividad</h2>
            <button type="button" class="modal-panel__close" (click)="pendingDeactivate.set(null)">
              &times;
            </button>
          </div>
          <div class="modal-panel__body">
            <p class="confirm-text">
              ¿Deseas archivar la actividad <strong>{{ target.title }}</strong>?
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

      .multi-check-grid {
        display: flex;
        flex-wrap: wrap;
        gap: 0.5rem;
        max-height: 140px;
        overflow-y: auto;
        padding: 0.25rem 0;
      }

      .check-pill {
        display: inline-flex;
        align-items: center;
        gap: 0.375rem;
        padding: 0.3125rem 0.625rem;
        border: 1px solid var(--border-color);
        border-radius: 999px;
        font-size: 0.8125rem;
        background: var(--surface-bg);
        cursor: pointer;
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
        }
      }

      .detail-full {
        grid-column: 1 / -1;
      }

      .confirm-text {
        margin: 0;
        color: var(--text-secondary);
      }
    `,
  ],
})
export class ActivitiesComponent implements OnInit {
  private readonly service = inject(ActivitiesService);
  private readonly volunteersService = inject(VolunteersService);
  private readonly beneficiariesService = inject(BeneficiariesService);
  private readonly notifications = inject(NotificationService);

  readonly activities = signal<Activity[]>([]);
  readonly volunteers = signal<Volunteer[]>([]);
  readonly beneficiaries = signal<Beneficiary[]>([]);
  readonly loading = signal(true);
  readonly saving = signal(false);
  readonly errorMessage = signal('');

  readonly searchTerm = signal('');
  readonly typeFilter = signal<'all' | ActivityType>('all');
  readonly statusFilter = signal<'all' | ActivityStatus>('all');

  readonly showFormModal = signal(false);
  readonly editingId = signal<string | null>(null);
  readonly selectedDetail = signal<Activity | null>(null);
  readonly pendingDeactivate = signal<Activity | null>(null);

  form: ActivityFormModel = this.createEmptyForm();

  readonly plannedCount = computed(
    () => this.activities().filter((a) => a.status === 'planned').length,
  );
  readonly completedCount = computed(
    () => this.activities().filter((a) => a.status === 'completed').length,
  );
  readonly totalBeneficiariesReached = computed(() =>
    this.activities().reduce((sum, a) => sum + (Number(a.beneficiariesCount) || 0), 0),
  );

  readonly filteredActivities = computed(() => {
    const q = this.searchTerm().trim().toLowerCase();
    const type = this.typeFilter();
    const status = this.statusFilter();

    return this.activities().filter((a) => {
      if (type !== 'all' && a.type !== type) {
        return false;
      }
      if (status !== 'all' && a.status !== status) {
        return false;
      }
      if (!q) {
        return true;
      }
      return (
        a.title.toLowerCase().includes(q) ||
        a.location.toLowerCase().includes(q) ||
        a.responsibleName.toLowerCase().includes(q)
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
      const [acts, vols, bens] = await Promise.all([
        this.service.list(),
        this.volunteersService.list(),
        this.beneficiariesService.list(),
      ]);
      this.activities.set(acts);
      this.volunteers.set(vols);
      this.beneficiaries.set(bens);
    } catch (error) {
      this.errorMessage.set(
        getFirebaseErrorMessage(error, 'No fue posible cargar las actividades.'),
      );
    } finally {
      this.loading.set(false);
    }
  }

  toggleVolunteer(id: string): void {
    if (this.form.volunteerIds.includes(id)) {
      this.form.volunteerIds = this.form.volunteerIds.filter((v) => v !== id);
    } else {
      this.form.volunteerIds = [...this.form.volunteerIds, id];
    }
  }

  toggleBeneficiary(id: string): void {
    if (this.form.beneficiaryIds.includes(id)) {
      this.form.beneficiaryIds = this.form.beneficiaryIds.filter((b) => b !== id);
    } else {
      this.form.beneficiaryIds = [...this.form.beneficiaryIds, id];
    }
  }

  openCreateModal(): void {
    this.editingId.set(null);
    this.form = this.createEmptyForm();
    this.showFormModal.set(true);
  }

  openEditModal(item: Activity): void {
    this.editingId.set(item.id ?? null);
    this.form = {
      title: item.title,
      type: item.type,
      date: item.date,
      startTime: item.startTime,
      location: item.location,
      description: item.description,
      status: item.status,
      responsibleName: item.responsibleName,
      volunteerIds: [...(item.volunteerIds ?? [])],
      beneficiaryIds: [...(item.beneficiaryIds ?? [])],
      beneficiariesCount: item.beneficiariesCount,
      notes: item.notes ?? '',
    };
    this.showFormModal.set(true);
  }

  closeModals(): void {
    this.showFormModal.set(false);
    this.editingId.set(null);
  }

  async saveActivity(): Promise<void> {
    this.saving.set(true);
    try {
      const payload = {
        ...this.form,
        title: this.form.title.trim(),
        location: this.form.location.trim(),
        description: this.form.description.trim(),
        responsibleName: this.form.responsibleName.trim(),
        beneficiariesCount: Math.max(
          Number(this.form.beneficiariesCount) || 0,
          this.form.beneficiaryIds.length,
        ),
        notes: this.form.notes.trim(),
      };

      const id = this.editingId();
      if (id) {
        await this.service.update(id, payload, payload.title);
        this.notifications.success('Actividad actualizada', `Se actualizó "${payload.title}".`);
      } else {
        await this.service.create(payload, payload.title);
        this.notifications.success('Actividad registrada', `Se registró "${payload.title}".`);
      }

      this.closeModals();
      await this.loadData();
    } catch (error) {
      this.notifications.error(
        'Error al guardar',
        getFirebaseErrorMessage(error, 'No fue posible guardar la actividad.'),
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
      await this.service.deactivate(target.id, target.title);
      this.pendingDeactivate.set(null);
      this.notifications.info('Actividad archivada', `Se archivó "${target.title}".`);
      await this.loadData();
    } catch (error) {
      this.notifications.error(
        'Error al archivar',
        getFirebaseErrorMessage(error, 'No fue posible archivar la actividad.'),
      );
    } finally {
      this.saving.set(false);
    }
  }

  formatType(type: ActivityType): string {
    switch (type) {
      case 'social':
        return 'Social / Asistencial';
      case 'educational':
        return 'Educativa / Formación';
      case 'community':
        return 'Comunitaria';
      case 'donation_campaign':
        return 'Campaña de Donación';
      case 'family_support':
        return 'Acompañamiento Familiar';
    }
  }

  formatStatus(status: ActivityStatus): string {
    switch (status) {
      case 'planned':
        return 'Planificada';
      case 'in_progress':
        return 'En curso';
      case 'completed':
        return 'Finalizada';
      case 'cancelled':
        return 'Cancelada';
    }
  }

  statusVariant(status: ActivityStatus): BadgeVariant {
    switch (status) {
      case 'planned':
        return 'info';
      case 'in_progress':
        return 'warning';
      case 'completed':
        return 'success';
      case 'cancelled':
        return 'danger';
    }
  }

  private createEmptyForm(): ActivityFormModel {
    return {
      title: '',
      type: 'social',
      date: new Date().toISOString().slice(0, 10),
      startTime: '09:00',
      location: '',
      description: '',
      status: 'planned',
      responsibleName: '',
      volunteerIds: [],
      beneficiaryIds: [],
      beneficiariesCount: 0,
      notes: '',
    };
  }
}
