import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Activity } from '../../../domain/entities/activity.entity';
import { Volunteer, VolunteerStatus } from '../../../domain/entities/volunteer.entity';
import {
  ActivitiesService,
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

const COLLABORATION_AREAS = [
  'Asistencia Social',
  'Logística y Entregas',
  'Educación y Talleres',
  'Salud y Bienestar',
  'Administración y Gestión',
  'Comunicación y Eventos',
];

interface VolunteerFormModel {
  fullName: string;
  documentId: string;
  email: string;
  phone: string;
  sector: string;
  address: string;
  availability: string;
  areas: string[];
  skills: string;
  emergencyContactName: string;
  emergencyContactPhone: string;
  status: VolunteerStatus;
  joinedDate: string;
  notes: string;
}

@Component({
  selector: 'app-volunteers',
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
      title="Módulo de Voluntarios"
      subtitle="Registro, disponibilidad, áreas de colaboración, habilidades y participación en actividades"
      badgeText="Operativo"
      badgeType="success"
    >
      <button type="button" class="btn btn--outline btn--sm" (click)="loadData()">
        &#8635; Actualizar
      </button>
      <button type="button" class="btn btn--primary" (click)="openCreateModal()">
        + Registrar Voluntario
      </button>
    </app-page-header>

    @if (errorMessage()) {
      <app-alert type="danger" title="Error de carga">
        {{ errorMessage() }}
      </app-alert>
    }

    <section class="grid-stats" aria-label="Resumen de voluntarios">
      <app-stat-card
        label="Total Voluntarios"
        [value]="volunteers().length"
        hint="Padrón institucional"
        tag="Equipo"
      />
      <app-stat-card
        label="Activos"
        [value]="activeCount()"
        hint="Disponibles para jornadas"
        tag="Disponibles"
      />
      <app-stat-card
        label="En Pausa"
        [value]="pausedCount()"
        hint="Disponibilidad temporalmente pausada"
        tag="Seguimiento"
      />
      <app-stat-card
        label="Participaciones"
        [value]="totalParticipations()"
        hint="Asignaciones en actividades"
        tag="Actividad"
      />
    </section>

    <div class="card module-filters">
      <div class="filter-group">
        <label for="search-volunteer" class="filter-label">Buscar voluntario:</label>
        <input
          id="search-volunteer"
          type="text"
          class="filter-input"
          placeholder="Nombre, cédula, habilidad o sector..."
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
          <option value="paused">En pausa</option>
          <option value="inactive">Inactivo</option>
        </select>
      </div>
    </div>

    @if (loading()) {
      <div class="card loading-state">Cargando padrón de voluntarios desde Firestore…</div>
    } @else if (filteredVolunteers().length === 0) {
      <app-empty-state
        title="No hay voluntarios que coincidan"
        description="Registra un nuevo voluntario o ajusta los filtros de búsqueda para consultar el padrón."
      />
    } @else {
      <div class="card table-card">
        <div class="table-responsive">
          <table class="data-table">
            <thead>
              <tr>
                <th>Voluntario</th>
                <th>Cédula</th>
                <th>Disponibilidad</th>
                <th>Áreas</th>
                <th>Actividades</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              @for (item of filteredVolunteers(); track item.id) {
                <tr>
                  <td>
                    <div class="cell-primary">{{ item.fullName }}</div>
                    <div class="cell-secondary">{{ item.phone }} · {{ item.email }}</div>
                  </td>
                  <td>{{ item.documentId }}</td>
                  <td>{{ item.availability }}</td>
                  <td>
                    <div class="areas-list">{{ item.areas.join(', ') || 'General' }}</div>
                  </td>
                  <td>{{ activityCountFor(item.id) }}</td>
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
      <div class="modal-backdrop" role="dialog" aria-modal="true" aria-labelledby="vol-modal-title">
        <div class="modal-panel">
          <div class="modal-panel__header">
            <h2 id="vol-modal-title">
              {{ editingId() ? 'Editar Voluntario' : 'Registrar Voluntario' }}
            </h2>
            <button type="button" class="modal-panel__close" (click)="closeModals()">&times;</button>
          </div>

          <form (ngSubmit)="saveVolunteer()" #volForm="ngForm">
            <div class="modal-panel__body">
              <div class="form-grid">
                <div class="form-field">
                  <label for="vol-name">Nombre completo *</label>
                  <input
                    id="vol-name"
                    name="fullName"
                    class="form-control"
                    required
                    minlength="3"
                    [(ngModel)]="form.fullName"
                    placeholder="Ej. Carlos Andrés Mejía"
                  />
                </div>

                <div class="form-field">
                  <label for="vol-doc">Cédula / Documento *</label>
                  <input
                    id="vol-doc"
                    name="documentId"
                    class="form-control"
                    required
                    minlength="6"
                    [(ngModel)]="form.documentId"
                    placeholder="Ej. 1723456789"
                  />
                </div>

                <div class="form-field">
                  <label for="vol-email">Correo electrónico *</label>
                  <input
                    id="vol-email"
                    name="email"
                    type="email"
                    class="form-control"
                    required
                    [(ngModel)]="form.email"
                    placeholder="correo@ejemplo.com"
                  />
                </div>

                <div class="form-field">
                  <label for="vol-phone">Teléfono *</label>
                  <input
                    id="vol-phone"
                    name="phone"
                    class="form-control"
                    required
                    [(ngModel)]="form.phone"
                    placeholder="0991234567"
                  />
                </div>

                <div class="form-field">
                  <label for="vol-sector">Sector *</label>
                  <input
                    id="vol-sector"
                    name="sector"
                    class="form-control"
                    required
                    [(ngModel)]="form.sector"
                    placeholder="Ej. La Magdalena, Norte"
                  />
                </div>

                <div class="form-field">
                  <label for="vol-address">Dirección *</label>
                  <input
                    id="vol-address"
                    name="address"
                    class="form-control"
                    required
                    [(ngModel)]="form.address"
                    placeholder="Dirección domiciliaria"
                  />
                </div>

                <div class="form-field">
                  <label for="vol-avail">Disponibilidad horaria *</label>
                  <input
                    id="vol-avail"
                    name="availability"
                    class="form-control"
                    required
                    [(ngModel)]="form.availability"
                    placeholder="Ej. Fines de semana, mañanas"
                  />
                </div>

                <div class="form-field">
                  <label for="vol-status">Estado *</label>
                  <select
                    id="vol-status"
                    name="status"
                    class="form-control"
                    required
                    [(ngModel)]="form.status"
                  >
                    <option value="active">Activo</option>
                    <option value="paused">En pausa</option>
                    <option value="inactive">Inactivo</option>
                  </select>
                </div>

                <div class="form-field form-field--full">
                  <span class="filter-label">Áreas de colaboración</span>
                  <div class="areas-checks">
                    @for (area of availableAreas; track area) {
                      <label class="check-pill">
                        <input
                          type="checkbox"
                          [checked]="form.areas.includes(area)"
                          (change)="toggleArea(area)"
                        />
                        <span>{{ area }}</span>
                      </label>
                    }
                  </div>
                </div>

                <div class="form-field form-field--full">
                  <label for="vol-skills">Habilidades y competencias *</label>
                  <input
                    id="vol-skills"
                    name="skills"
                    class="form-control"
                    required
                    [(ngModel)]="form.skills"
                    placeholder="Ej. Logística, docencia, primeros auxilios, conducción"
                  />
                </div>

                <div class="form-field">
                  <label for="vol-em-name">Contacto de emergencia *</label>
                  <input
                    id="vol-em-name"
                    name="emergencyContactName"
                    class="form-control"
                    required
                    [(ngModel)]="form.emergencyContactName"
                    placeholder="Nombre del familiar o contacto"
                  />
                </div>

                <div class="form-field">
                  <label for="vol-em-phone">Teléfono de emergencia *</label>
                  <input
                    id="vol-em-phone"
                    name="emergencyContactPhone"
                    class="form-control"
                    required
                    [(ngModel)]="form.emergencyContactPhone"
                    placeholder="0990001122"
                  />
                </div>

                <div class="form-field">
                  <label for="vol-joined">Fecha de ingreso</label>
                  <input
                    id="vol-joined"
                    name="joinedDate"
                    type="date"
                    class="form-control"
                    [(ngModel)]="form.joinedDate"
                  />
                </div>

                <div class="form-field form-field--full">
                  <label for="vol-notes">Observaciones</label>
                  <textarea
                    id="vol-notes"
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
                [disabled]="saving() || volForm.invalid"
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
            <h2>Perfil del Voluntario</h2>
            <button type="button" class="modal-panel__close" (click)="selectedDetail.set(null)">
              &times;
            </button>
          </div>
          <div class="modal-panel__body">
            <dl class="detail-grid">
              <div><dt>Nombre</dt><dd>{{ detail.fullName }}</dd></div>
              <div><dt>Cédula</dt><dd>{{ detail.documentId }}</dd></div>
              <div><dt>Correo</dt><dd>{{ detail.email }}</dd></div>
              <div><dt>Teléfono</dt><dd>{{ detail.phone }}</dd></div>
              <div><dt>Sector / Dirección</dt><dd>{{ detail.sector }} · {{ detail.address }}</dd></div>
              <div><dt>Disponibilidad</dt><dd>{{ detail.availability }}</dd></div>
              <div><dt>Habilidades</dt><dd>{{ detail.skills }}</dd></div>
              <div><dt>Contacto de emergencia</dt><dd>{{ detail.emergencyContactName }} ({{ detail.emergencyContactPhone }})</dd></div>
              <div class="detail-full">
                <dt>Historial de actividades ({{ activitiesFor(detail.id).length }})</dt>
                <dd>
                  @if (activitiesFor(detail.id).length === 0) {
                    Sin actividades vinculadas todavía.
                  } @else {
                    <ul class="history-list">
                      @for (act of activitiesFor(detail.id); track act.id) {
                        <li>{{ act.date }} — {{ act.title }} ({{ act.location }})</li>
                      }
                    </ul>
                  }
                </dd>
              </div>
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
            <h2>Archivar Voluntario</h2>
            <button type="button" class="modal-panel__close" (click)="pendingDeactivate.set(null)">
              &times;
            </button>
          </div>
          <div class="modal-panel__body">
            <p class="confirm-text">
              ¿Deseas archivar a <strong>{{ target.fullName }}</strong>? El historial de participación
              se conservará en Firestore.
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
      }

      .cell-secondary {
        font-size: 0.75rem;
        color: var(--text-secondary);
      }

      .areas-list {
        max-width: 220px;
        font-size: 0.8125rem;
        color: var(--text-secondary);
      }

      .areas-checks {
        display: flex;
        flex-wrap: wrap;
        gap: 0.5rem;
      }

      .check-pill {
        display: inline-flex;
        align-items: center;
        gap: 0.375rem;
        padding: 0.375rem 0.625rem;
        border: 1px solid var(--border-color);
        border-radius: 999px;
        font-size: 0.8125rem;
        cursor: pointer;
        background: var(--surface-bg);
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

      .history-list {
        margin: 0.375rem 0 0;
        padding-left: 1.25rem;
      }

      .confirm-text {
        margin: 0;
        color: var(--text-secondary);
      }
    `,
  ],
})
export class VolunteersComponent implements OnInit {
  private readonly service = inject(VolunteersService);
  private readonly activitiesService = inject(ActivitiesService);
  private readonly notifications = inject(NotificationService);

  readonly availableAreas = COLLABORATION_AREAS;
  readonly volunteers = signal<Volunteer[]>([]);
  readonly activities = signal<Activity[]>([]);
  readonly loading = signal(true);
  readonly saving = signal(false);
  readonly errorMessage = signal('');

  readonly searchTerm = signal('');
  readonly statusFilter = signal<'all' | VolunteerStatus>('all');

  readonly showFormModal = signal(false);
  readonly editingId = signal<string | null>(null);
  readonly selectedDetail = signal<Volunteer | null>(null);
  readonly pendingDeactivate = signal<Volunteer | null>(null);

  form: VolunteerFormModel = this.createEmptyForm();

  readonly activeCount = computed(
    () => this.volunteers().filter((v) => v.status === 'active').length,
  );
  readonly pausedCount = computed(
    () => this.volunteers().filter((v) => v.status === 'paused').length,
  );
  readonly totalParticipations = computed(() =>
    this.activities().reduce((sum, act) => sum + (act.volunteerIds?.length ?? 0), 0),
  );

  readonly filteredVolunteers = computed(() => {
    const query = this.searchTerm().trim().toLowerCase();
    const status = this.statusFilter();

    return this.volunteers().filter((item) => {
      if (status !== 'all' && item.status !== status) {
        return false;
      }
      if (!query) {
        return true;
      }
      return (
        item.fullName.toLowerCase().includes(query) ||
        item.documentId.toLowerCase().includes(query) ||
        item.skills.toLowerCase().includes(query) ||
        item.sector.toLowerCase().includes(query)
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
      const [vols, acts] = await Promise.all([this.service.list(), this.activitiesService.list()]);
      this.volunteers.set(vols);
      this.activities.set(acts);
    } catch (error) {
      this.errorMessage.set(
        getFirebaseErrorMessage(error, 'No fue posible cargar los voluntarios.'),
      );
    } finally {
      this.loading.set(false);
    }
  }

  activitiesFor(volunteerId?: string): Activity[] {
    if (!volunteerId) {
      return [];
    }
    return this.activities().filter((act) => act.volunteerIds?.includes(volunteerId));
  }

  activityCountFor(volunteerId?: string): number {
    return this.activitiesFor(volunteerId).length;
  }

  toggleArea(area: string): void {
    if (this.form.areas.includes(area)) {
      this.form.areas = this.form.areas.filter((a) => a !== area);
    } else {
      this.form.areas = [...this.form.areas, area];
    }
  }

  openCreateModal(): void {
    this.editingId.set(null);
    this.form = this.createEmptyForm();
    this.showFormModal.set(true);
  }

  openEditModal(item: Volunteer): void {
    this.editingId.set(item.id ?? null);
    this.form = {
      fullName: item.fullName,
      documentId: item.documentId,
      email: item.email,
      phone: item.phone,
      sector: item.sector,
      address: item.address,
      availability: item.availability,
      areas: [...(item.areas ?? [])],
      skills: item.skills,
      emergencyContactName: item.emergencyContactName,
      emergencyContactPhone: item.emergencyContactPhone,
      status: item.status,
      joinedDate: item.joinedDate,
      notes: item.notes ?? '',
    };
    this.showFormModal.set(true);
  }

  openDetailModal(item: Volunteer): void {
    this.selectedDetail.set(item);
  }

  closeModals(): void {
    this.showFormModal.set(false);
    this.editingId.set(null);
  }

  async saveVolunteer(): Promise<void> {
    this.saving.set(true);
    try {
      const payload = {
        ...this.form,
        fullName: this.form.fullName.trim(),
        documentId: this.form.documentId.trim(),
        email: this.form.email.trim(),
        phone: this.form.phone.trim(),
        sector: this.form.sector.trim(),
        address: this.form.address.trim(),
        availability: this.form.availability.trim(),
        skills: this.form.skills.trim(),
        emergencyContactName: this.form.emergencyContactName.trim(),
        emergencyContactPhone: this.form.emergencyContactPhone.trim(),
        notes: this.form.notes.trim(),
      };

      const id = this.editingId();
      if (id) {
        await this.service.update(id, payload, payload.fullName);
        this.notifications.success(
          'Voluntario actualizado',
          `Se actualizó el perfil de ${payload.fullName}.`,
        );
      } else {
        await this.service.create(payload, payload.fullName);
        this.notifications.success(
          'Voluntario registrado',
          `Se registró correctamente a ${payload.fullName}.`,
        );
      }

      this.closeModals();
      await this.loadData();
    } catch (error) {
      const msg = getFirebaseErrorMessage(error, 'No fue posible guardar el voluntario.');
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
      this.notifications.info('Voluntario archivado', `${target.fullName} fue archivado.`);
      await this.loadData();
    } catch (error) {
      this.notifications.error(
        'Error al archivar',
        getFirebaseErrorMessage(error, 'No fue posible archivar el voluntario.'),
      );
    } finally {
      this.saving.set(false);
    }
  }

  formatStatus(status: VolunteerStatus): string {
    switch (status) {
      case 'active':
        return 'Activo';
      case 'paused':
        return 'En pausa';
      case 'inactive':
        return 'Inactivo';
    }
  }

  statusVariant(status: VolunteerStatus): BadgeVariant {
    switch (status) {
      case 'active':
        return 'success';
      case 'paused':
        return 'warning';
      case 'inactive':
        return 'neutral';
    }
  }

  private createEmptyForm(): VolunteerFormModel {
    return {
      fullName: '',
      documentId: '',
      email: '',
      phone: '',
      sector: '',
      address: '',
      availability: '',
      areas: [],
      skills: '',
      emergencyContactName: '',
      emergencyContactPhone: '',
      status: 'active',
      joinedDate: new Date().toISOString().slice(0, 10),
      notes: '',
    };
  }
}
