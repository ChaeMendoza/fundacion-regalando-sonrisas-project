import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Beneficiary } from '../../../domain/entities/beneficiary.entity';
import {
  Donation,
  DonationStatus,
  DonationType,
  Donor,
  DonorType,
} from '../../../domain/entities/donation.entity';
import { StorageService } from '../../../infrastructure/firebase/storage.service';
import {
  BeneficiariesService,
  DonationsService,
  DonorsService,
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

interface DonationFormModel {
  code: string;
  donorId: string;
  donorName: string;
  donorContact: string;
  type: DonationType;
  description: string;
  quantity: number;
  unit: string;
  estimatedValue: number;
  receivedDate: string;
  status: DonationStatus;
  destination: string;
  beneficiaryId: string;
  notes: string;
}

interface DonorFormModel {
  name: string;
  documentId: string;
  donorType: DonorType;
  email: string;
  phone: string;
  address: string;
  notes: string;
}

@Component({
  selector: 'app-donations',
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
      title="Donaciones y Donantes"
      subtitle="Registro y trazabilidad de aportes solidarios, donantes, destino de la ayuda y respaldos"
      badgeText="Operativo"
      badgeType="success"
    >
      <button type="button" class="btn btn--outline btn--sm" (click)="loadData()">
        &#8635; Actualizar
      </button>
      @if (activeTab() === 'donations') {
        <button type="button" class="btn btn--primary" (click)="openCreateDonation()">
          + Registrar Donación
        </button>
      } @else {
        <button type="button" class="btn btn--primary" (click)="openCreateDonor()">
          + Registrar Donante
        </button>
      }
    </app-page-header>

    @if (errorMessage()) {
      <app-alert type="danger" title="Error de carga">
        {{ errorMessage() }}
      </app-alert>
    }

    <section class="grid-stats" aria-label="Indicadores de donaciones">
      <app-stat-card
        label="Donaciones Registradas"
        [value]="donations().length"
        hint="Total de aportes en Firestore"
        tag="Aportes"
      />
      <app-stat-card
        label="Valor Estimado Total"
        [value]="formatCurrency(totalEstimatedValue())"
        hint="Valoración referencial acumulada"
        tag="Referencial"
      />
      <app-stat-card
        label="Entregadas"
        [value]="deliveredCount()"
        hint="Aportes entregados a destino"
        tag="Trazabilidad"
      />
      <app-stat-card
        label="Donantes Activos"
        [value]="donors().length"
        hint="Personas y organizaciones"
        tag="Donantes"
      />
    </section>

    <div class="tabs-bar" role="tablist">
      <button
        type="button"
        role="tab"
        class="tab-btn"
        [class.tab-btn--active]="activeTab() === 'donations'"
        (click)="activeTab.set('donations')"
      >
        Donaciones ({{ donations().length }})
      </button>
      <button
        type="button"
        role="tab"
        class="tab-btn"
        [class.tab-btn--active]="activeTab() === 'donors'"
        (click)="activeTab.set('donors')"
      >
        Donantes ({{ donors().length }})
      </button>
    </div>

    @if (activeTab() === 'donations') {
      <div class="card module-filters">
        <div class="filter-group">
          <label for="search-donor" class="filter-label">Buscar donación:</label>
          <input
            id="search-donor"
            type="text"
            class="filter-input"
            placeholder="Código, donante o descripción..."
            [ngModel]="donationSearch()"
            (ngModelChange)="donationSearch.set($event)"
          />
        </div>
        <div class="filter-group">
          <label for="filter-type" class="filter-label">Tipo:</label>
          <select
            id="filter-type"
            class="filter-select"
            [ngModel]="typeFilter()"
            (ngModelChange)="typeFilter.set($event)"
          >
            <option value="all">Todos los tipos</option>
            <option value="food">Alimentos / Víveres</option>
            <option value="clothing">Prendas / Enseres</option>
            <option value="monetary">Monetaria directa</option>
            <option value="education">Material educativo</option>
            <option value="medical">Salud / Insumos</option>
            <option value="other">Otros</option>
          </select>
        </div>
        <div class="filter-group">
          <label for="filter-don-status" class="filter-label">Estado:</label>
          <select
            id="filter-don-status"
            class="filter-select"
            [ngModel]="statusFilter()"
            (ngModelChange)="statusFilter.set($event)"
          >
            <option value="all">Todos los estados</option>
            <option value="registered">Registrada</option>
            <option value="in_distribution">En distribución</option>
            <option value="delivered">Entregada</option>
          </select>
        </div>
      </div>

      @if (loading()) {
        <div class="card loading-state">Cargando donaciones desde Firestore…</div>
      } @else if (filteredDonations().length === 0) {
        <app-empty-state
          title="No se encontraron donaciones"
          description="Registra una nueva donación o ajusta los filtros para consultar los aportes."
        />
      } @else {
        <div class="card table-card">
          <div class="table-responsive">
            <table class="data-table">
              <thead>
                <tr>
                  <th>Código / Fecha</th>
                  <th>Donante</th>
                  <th>Tipo y Detalle</th>
                  <th>Valor Est.</th>
                  <th>Destino</th>
                  <th>Estado</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                @for (item of filteredDonations(); track item.id) {
                  <tr>
                    <td>
                      <div class="cell-primary">{{ item.code }}</div>
                      <div class="cell-secondary">{{ item.receivedDate }}</div>
                    </td>
                    <td>
                      <div class="cell-primary">{{ item.donorName }}</div>
                      <div class="cell-secondary">{{ item.donorContact || 'Sin contacto' }}</div>
                    </td>
                    <td>
                      <div>{{ formatType(item.type) }} ({{ item.quantity }} {{ item.unit }})</div>
                      <div class="cell-secondary">{{ item.description }}</div>
                    </td>
                    <td>{{ formatCurrency(item.estimatedValue) }}</td>
                    <td>
                      <div>{{ item.destination }}</div>
                      @if (item.beneficiaryName) {
                        <div class="cell-secondary">Benef.: {{ item.beneficiaryName }}</div>
                      }
                    </td>
                    <td>
                      <app-status-badge
                        [text]="formatStatus(item.status)"
                        [variant]="statusVariant(item.status)"
                      />
                    </td>
                    <td>
                      <div class="table-actions">
                        @if (item.receiptUrl) {
                          <a
                            [href]="item.receiptUrl"
                            target="_blank"
                            rel="noopener noreferrer"
                            class="btn btn--outline btn--sm"
                          >
                            Respaldo
                          </a>
                        }
                        <button
                          type="button"
                          class="btn btn--outline btn--sm"
                          (click)="openEditDonation(item)"
                        >
                          Editar
                        </button>
                        <button
                          type="button"
                          class="btn btn--ghost btn--sm"
                          (click)="pendingDeactivateDonation.set(item)"
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
    } @else {
      <div class="card module-filters">
        <div class="filter-group">
          <label for="search-donors" class="filter-label">Buscar donante:</label>
          <input
            id="search-donors"
            type="text"
            class="filter-input"
            placeholder="Nombre, cédula/RUC o teléfono..."
            [ngModel]="donorSearch()"
            (ngModelChange)="donorSearch.set($event)"
          />
        </div>
      </div>

      @if (loading()) {
        <div class="card loading-state">Cargando donantes desde Firestore…</div>
      } @else if (filteredDonors().length === 0) {
        <app-empty-state
          title="No hay donantes registrados"
          description="Registra personas, empresas u organizaciones donantes para asociar sus aportaciones."
        />
      } @else {
        <div class="card table-card">
          <div class="table-responsive">
            <table class="data-table">
              <thead>
                <tr>
                  <th>Donante</th>
                  <th>Cédula / RUC</th>
                  <th>Tipo</th>
                  <th>Contacto</th>
                  <th>Aportaciones</th>
                  <th>Valor Estimado</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                @for (donor of filteredDonors(); track donor.id) {
                  <tr>
                    <td class="cell-primary">{{ donor.name }}</td>
                    <td>{{ donor.documentId }}</td>
                    <td>{{ formatDonorType(donor.donorType) }}</td>
                    <td>
                      <div>{{ donor.phone }}</div>
                      <div class="cell-secondary">{{ donor.email || 'Sin correo' }}</div>
                    </td>
                    <td>{{ donorStats(donor).count }}</td>
                    <td>{{ formatCurrency(donorStats(donor).totalValue) }}</td>
                    <td>
                      <div class="table-actions">
                        <button
                          type="button"
                          class="btn btn--outline btn--sm"
                          (click)="openEditDonor(donor)"
                        >
                          Editar
                        </button>
                        <button
                          type="button"
                          class="btn btn--ghost btn--sm"
                          (click)="pendingDeactivateDonor.set(donor)"
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
    }

    @if (showDonationModal()) {
      <div class="modal-backdrop" role="dialog" aria-modal="true">
        <div class="modal-panel">
          <div class="modal-panel__header">
            <h2>{{ editingDonationId() ? 'Editar Donación' : 'Registrar Donación' }}</h2>
            <button type="button" class="modal-panel__close" (click)="closeDonationModal()">
              &times;
            </button>
          </div>

          <form (ngSubmit)="saveDonation()" #donForm="ngForm">
            <div class="modal-panel__body">
              <div class="form-grid">
                <div class="form-field">
                  <label for="don-code">Código de registro *</label>
                  <input
                    id="don-code"
                    name="code"
                    class="form-control"
                    required
                    [(ngModel)]="donationForm.code"
                  />
                </div>

                <div class="form-field">
                  <label for="don-date">Fecha de recepción *</label>
                  <input
                    id="don-date"
                    name="receivedDate"
                    type="date"
                    class="form-control"
                    required
                    [(ngModel)]="donationForm.receivedDate"
                  />
                </div>

                <div class="form-field">
                  <label for="don-donor-select">Donante registrado (opcional)</label>
                  <select
                    id="don-donor-select"
                    name="donorId"
                    class="form-control"
                    [ngModel]="donationForm.donorId"
                    (ngModelChange)="onDonorSelected($event)"
                  >
                    <option value="">-- Ingreso manual / Donante ocasional --</option>
                    @for (d of donors(); track d.id) {
                      <option [value]="d.id">{{ d.name }} ({{ d.documentId }})</option>
                    }
                  </select>
                </div>

                <div class="form-field">
                  <label for="don-donor-name">Nombre del donante *</label>
                  <input
                    id="don-donor-name"
                    name="donorName"
                    class="form-control"
                    required
                    [(ngModel)]="donationForm.donorName"
                    placeholder="Nombre o razón social"
                  />
                </div>

                <div class="form-field">
                  <label for="don-contact">Contacto del donante</label>
                  <input
                    id="don-contact"
                    name="donorContact"
                    class="form-control"
                    [(ngModel)]="donationForm.donorContact"
                    placeholder="Teléfono o correo"
                  />
                </div>

                <div class="form-field">
                  <label for="don-type">Tipo de donación *</label>
                  <select
                    id="don-type"
                    name="type"
                    class="form-control"
                    required
                    [(ngModel)]="donationForm.type"
                  >
                    <option value="food">Alimentos / Víveres</option>
                    <option value="clothing">Prendas de vestir / Enseres</option>
                    <option value="monetary">Monetaria directa (Transferencia/Depósito)</option>
                    <option value="education">Materiales educativos</option>
                    <option value="medical">Insumos médicos</option>
                    <option value="other">Otros</option>
                  </select>
                </div>

                <div class="form-field">
                  <label for="don-qty">Cantidad *</label>
                  <input
                    id="don-qty"
                    name="quantity"
                    type="number"
                    min="1"
                    class="form-control"
                    required
                    [(ngModel)]="donationForm.quantity"
                  />
                </div>

                <div class="form-field">
                  <label for="don-unit">Unidad *</label>
                  <input
                    id="don-unit"
                    name="unit"
                    class="form-control"
                    required
                    [(ngModel)]="donationForm.unit"
                    placeholder="kits, cajas, USD, prendas..."
                  />
                </div>

                <div class="form-field">
                  <label for="don-val">Valor estimado (USD) *</label>
                  <input
                    id="don-val"
                    name="estimatedValue"
                    type="number"
                    min="0"
                    step="0.01"
                    class="form-control"
                    required
                    [(ngModel)]="donationForm.estimatedValue"
                  />
                </div>

                <div class="form-field">
                  <label for="don-status">Estado *</label>
                  <select
                    id="don-status"
                    name="status"
                    class="form-control"
                    required
                    [(ngModel)]="donationForm.status"
                  >
                    <option value="registered">Registrada</option>
                    <option value="in_distribution">En distribución</option>
                    <option value="delivered">Entregada</option>
                  </select>
                </div>

                <div class="form-field">
                  <label for="don-dest">Destino / Campaña *</label>
                  <input
                    id="don-dest"
                    name="destination"
                    class="form-control"
                    required
                    [(ngModel)]="donationForm.destination"
                    placeholder="Ej. Entrega sector Sur, Stock general"
                  />
                </div>

                <div class="form-field">
                  <label for="don-ben">Beneficiario asociado (opcional)</label>
                  <select
                    id="don-ben"
                    name="beneficiaryId"
                    class="form-control"
                    [(ngModel)]="donationForm.beneficiaryId"
                  >
                    <option value="">-- Sin beneficiario específico --</option>
                    @for (b of beneficiaries(); track b.id) {
                      <option [value]="b.id">{{ b.fullName }} ({{ b.sector }})</option>
                    }
                  </select>
                </div>

                <div class="form-field form-field--full">
                  <label for="don-desc">Descripción detallada *</label>
                  <textarea
                    id="don-desc"
                    name="description"
                    rows="2"
                    class="form-control"
                    required
                    [(ngModel)]="donationForm.description"
                    placeholder="Detalle de bienes o aporte recibido..."
                  ></textarea>
                </div>

                <div class="form-field form-field--full">
                  <label for="don-file">Comprobante o acta de respaldo (opcional, máx. 10 MB)</label>
                  <input
                    id="don-file"
                    type="file"
                    class="form-control"
                    accept=".pdf,.jpg,.jpeg,.png,.webp"
                    (change)="onReceiptSelected($event)"
                  />
                </div>
              </div>
            </div>

            <div class="modal-panel__footer">
              <button type="button" class="btn btn--outline" (click)="closeDonationModal()">
                Cancelar
              </button>
              <button
                type="submit"
                class="btn btn--primary"
                [disabled]="saving() || donForm.invalid"
              >
                {{ saving() ? 'Guardando…' : editingDonationId() ? 'Guardar cambios' : 'Registrar' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    }

    @if (showDonorModal()) {
      <div class="modal-backdrop" role="dialog" aria-modal="true">
        <div class="modal-panel">
          <div class="modal-panel__header">
            <h2>{{ editingDonorId() ? 'Editar Donante' : 'Registrar Donante' }}</h2>
            <button type="button" class="modal-panel__close" (click)="closeDonorModal()">
              &times;
            </button>
          </div>
          <form (ngSubmit)="saveDonor()" #donorNgForm="ngForm">
            <div class="modal-panel__body">
              <div class="form-grid">
                <div class="form-field">
                  <label for="dn-name">Nombre o Razón Social *</label>
                  <input
                    id="dn-name"
                    name="name"
                    class="form-control"
                    required
                    [(ngModel)]="donorForm.name"
                  />
                </div>
                <div class="form-field">
                  <label for="dn-doc">Cédula / RUC *</label>
                  <input
                    id="dn-doc"
                    name="documentId"
                    class="form-control"
                    required
                    [(ngModel)]="donorForm.documentId"
                  />
                </div>
                <div class="form-field">
                  <label for="dn-type">Tipo de donante *</label>
                  <select
                    id="dn-type"
                    name="donorType"
                    class="form-control"
                    required
                    [(ngModel)]="donorForm.donorType"
                  >
                    <option value="individual">Persona Natural</option>
                    <option value="company">Empresa</option>
                    <option value="organization">Organización / Colectivo</option>
                  </select>
                </div>
                <div class="form-field">
                  <label for="dn-phone">Teléfono *</label>
                  <input
                    id="dn-phone"
                    name="phone"
                    class="form-control"
                    required
                    [(ngModel)]="donorForm.phone"
                  />
                </div>
                <div class="form-field">
                  <label for="dn-email">Correo electrónico</label>
                  <input
                    id="dn-email"
                    name="email"
                    type="email"
                    class="form-control"
                    [(ngModel)]="donorForm.email"
                  />
                </div>
                <div class="form-field">
                  <label for="dn-address">Dirección / Ciudad</label>
                  <input
                    id="dn-address"
                    name="address"
                    class="form-control"
                    [(ngModel)]="donorForm.address"
                  />
                </div>
                <div class="form-field form-field--full">
                  <label for="dn-notes">Notas</label>
                  <textarea
                    id="dn-notes"
                    name="notes"
                    rows="2"
                    class="form-control"
                    [(ngModel)]="donorForm.notes"
                  ></textarea>
                </div>
              </div>
            </div>
            <div class="modal-panel__footer">
              <button type="button" class="btn btn--outline" (click)="closeDonorModal()">
                Cancelar
              </button>
              <button
                type="submit"
                class="btn btn--primary"
                [disabled]="saving() || donorNgForm.invalid"
              >
                {{ saving() ? 'Guardando…' : editingDonorId() ? 'Guardar cambios' : 'Registrar' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    }

    @if (pendingDeactivateDonation(); as target) {
      <div class="modal-backdrop" role="dialog" aria-modal="true">
        <div class="modal-panel modal-panel--sm">
          <div class="modal-panel__header">
            <h2>Archivar Donación</h2>
            <button
              type="button"
              class="modal-panel__close"
              (click)="pendingDeactivateDonation.set(null)"
            >
              &times;
            </button>
          </div>
          <div class="modal-panel__body">
            <p class="confirm-text">
              ¿Deseas archivar la donación <strong>{{ target.code }}</strong>?
            </p>
          </div>
          <div class="modal-panel__footer">
            <button
              type="button"
              class="btn btn--outline"
              (click)="pendingDeactivateDonation.set(null)"
            >
              Cancelar
            </button>
            <button
              type="button"
              class="btn btn--danger"
              [disabled]="saving()"
              (click)="executeDeactivateDonation()"
            >
              Confirmar archivo
            </button>
          </div>
        </div>
      </div>
    }

    @if (pendingDeactivateDonor(); as target) {
      <div class="modal-backdrop" role="dialog" aria-modal="true">
        <div class="modal-panel modal-panel--sm">
          <div class="modal-panel__header">
            <h2>Archivar Donante</h2>
            <button
              type="button"
              class="modal-panel__close"
              (click)="pendingDeactivateDonor.set(null)"
            >
              &times;
            </button>
          </div>
          <div class="modal-panel__body">
            <p class="confirm-text">
              ¿Deseas archivar al donante <strong>{{ target.name }}</strong>?
            </p>
          </div>
          <div class="modal-panel__footer">
            <button
              type="button"
              class="btn btn--outline"
              (click)="pendingDeactivateDonor.set(null)"
            >
              Cancelar
            </button>
            <button
              type="button"
              class="btn btn--danger"
              [disabled]="saving()"
              (click)="executeDeactivateDonor()"
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
export class DonationsComponent implements OnInit {
  private readonly donationsService = inject(DonationsService);
  private readonly donorsService = inject(DonorsService);
  private readonly beneficiariesService = inject(BeneficiariesService);
  private readonly storage = inject(StorageService);
  private readonly notifications = inject(NotificationService);

  readonly activeTab = signal<'donations' | 'donors'>('donations');
  readonly donations = signal<Donation[]>([]);
  readonly donors = signal<Donor[]>([]);
  readonly beneficiaries = signal<Beneficiary[]>([]);
  readonly loading = signal(true);
  readonly saving = signal(false);
  readonly errorMessage = signal('');

  readonly donationSearch = signal('');
  readonly typeFilter = signal<'all' | DonationType>('all');
  readonly statusFilter = signal<'all' | DonationStatus>('all');
  readonly donorSearch = signal('');

  readonly showDonationModal = signal(false);
  readonly editingDonationId = signal<string | null>(null);
  readonly pendingDeactivateDonation = signal<Donation | null>(null);

  readonly showDonorModal = signal(false);
  readonly editingDonorId = signal<string | null>(null);
  readonly pendingDeactivateDonor = signal<Donor | null>(null);

  private selectedReceiptFile: File | null = null;

  donationForm: DonationFormModel = this.createEmptyDonationForm();
  donorForm: DonorFormModel = this.createEmptyDonorForm();

  readonly totalEstimatedValue = computed(() =>
    this.donations().reduce((sum, d) => sum + (Number(d.estimatedValue) || 0), 0),
  );
  readonly deliveredCount = computed(
    () => this.donations().filter((d) => d.status === 'delivered').length,
  );

  readonly filteredDonations = computed(() => {
    const q = this.donationSearch().trim().toLowerCase();
    const type = this.typeFilter();
    const status = this.statusFilter();

    return this.donations().filter((d) => {
      if (type !== 'all' && d.type !== type) {
        return false;
      }
      if (status !== 'all' && d.status !== status) {
        return false;
      }
      if (!q) {
        return true;
      }
      return (
        d.code.toLowerCase().includes(q) ||
        d.donorName.toLowerCase().includes(q) ||
        d.description.toLowerCase().includes(q) ||
        d.destination.toLowerCase().includes(q)
      );
    });
  });

  readonly filteredDonors = computed(() => {
    const q = this.donorSearch().trim().toLowerCase();
    if (!q) {
      return this.donors();
    }
    return this.donors().filter(
      (d) =>
        d.name.toLowerCase().includes(q) ||
        d.documentId.toLowerCase().includes(q) ||
        d.phone.toLowerCase().includes(q),
    );
  });

  ngOnInit(): void {
    void this.loadData();
  }

  async loadData(): Promise<void> {
    this.loading.set(true);
    this.errorMessage.set('');
    try {
      const [dons, donorList, bens] = await Promise.all([
        this.donationsService.list(),
        this.donorsService.list(),
        this.beneficiariesService.list(),
      ]);
      this.donations.set(dons);
      this.donors.set(donorList);
      this.beneficiaries.set(bens);
    } catch (error) {
      this.errorMessage.set(
        getFirebaseErrorMessage(error, 'No fue posible cargar las donaciones.'),
      );
    } finally {
      this.loading.set(false);
    }
  }

  donorStats(donor: Donor): { count: number; totalValue: number } {
    const matching = this.donations().filter(
      (d) => d.donorId === donor.id || d.donorName.toLowerCase() === donor.name.toLowerCase(),
    );
    return {
      count: matching.length,
      totalValue: matching.reduce((sum, d) => sum + (Number(d.estimatedValue) || 0), 0),
    };
  }

  onDonorSelected(donorId: string): void {
    this.donationForm.donorId = donorId;
    const found = this.donors().find((d) => d.id === donorId);
    if (found) {
      this.donationForm.donorName = found.name;
      this.donationForm.donorContact = found.phone || found.email || '';
    }
  }

  onReceiptSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0] ?? null;
    if (file && file.size > 10 * 1024 * 1024) {
      this.notifications.error('Archivo demasiado grande', 'El respaldo no puede superar 10 MB.');
      input.value = '';
      this.selectedReceiptFile = null;
      return;
    }
    this.selectedReceiptFile = file;
  }

  openCreateDonation(): void {
    this.editingDonationId.set(null);
    this.selectedReceiptFile = null;
    this.donationForm = this.createEmptyDonationForm();
    this.showDonationModal.set(true);
  }

  openEditDonation(item: Donation): void {
    this.editingDonationId.set(item.id ?? null);
    this.selectedReceiptFile = null;
    this.donationForm = {
      code: item.code,
      donorId: item.donorId ?? '',
      donorName: item.donorName,
      donorContact: item.donorContact ?? '',
      type: item.type,
      description: item.description,
      quantity: item.quantity,
      unit: item.unit,
      estimatedValue: item.estimatedValue,
      receivedDate: item.receivedDate,
      status: item.status,
      destination: item.destination,
      beneficiaryId: item.beneficiaryId ?? '',
      notes: item.notes ?? '',
    };
    this.showDonationModal.set(true);
  }

  closeDonationModal(): void {
    this.showDonationModal.set(false);
    this.editingDonationId.set(null);
    this.selectedReceiptFile = null;
  }

  async saveDonation(): Promise<void> {
    this.saving.set(true);
    try {
      const beneficiary = this.beneficiaries().find(
        (b) => b.id === this.donationForm.beneficiaryId,
      );

      let receiptUrl: string | undefined;
      let receiptPath: string | undefined;
      if (this.selectedReceiptFile) {
        const upload = await this.storage.uploadFile(
          'donations',
          this.donationForm.code.trim() || 'general',
          this.selectedReceiptFile,
        );
        receiptUrl = upload.downloadUrl;
        receiptPath = upload.path;
      }

      const payload: Omit<
        Donation,
        'id' | 'createdAt' | 'updatedAt' | 'createdBy' | 'updatedBy' | 'isActive'
      > = {
        code: this.donationForm.code.trim(),
        donorId: this.donationForm.donorId || undefined,
        donorName: this.donationForm.donorName.trim(),
        donorContact: this.donationForm.donorContact.trim(),
        type: this.donationForm.type,
        description: this.donationForm.description.trim(),
        quantity: Number(this.donationForm.quantity) || 1,
        unit: this.donationForm.unit.trim(),
        estimatedValue: Number(this.donationForm.estimatedValue) || 0,
        receivedDate: this.donationForm.receivedDate,
        status: this.donationForm.status,
        destination: this.donationForm.destination.trim(),
        beneficiaryId: beneficiary?.id,
        beneficiaryName: beneficiary?.fullName,
        notes: this.donationForm.notes.trim(),
      };

      if (receiptUrl && receiptPath) {
        payload.receiptUrl = receiptUrl;
        payload.receiptPath = receiptPath;
      }

      const id = this.editingDonationId();
      if (id) {
        await this.donationsService.update(id, payload, payload.code);
        this.notifications.success('Donación actualizada', `Se actualizó ${payload.code}.`);
      } else {
        await this.donationsService.create(payload, payload.code);
        this.notifications.success('Donación registrada', `Se registró ${payload.code}.`);
      }

      this.closeDonationModal();
      await this.loadData();
    } catch (error) {
      this.notifications.error(
        'Error al guardar',
        getFirebaseErrorMessage(error, 'No fue posible guardar la donación.'),
      );
    } finally {
      this.saving.set(false);
    }
  }

  async executeDeactivateDonation(): Promise<void> {
    const target = this.pendingDeactivateDonation();
    if (!target?.id) {
      return;
    }
    this.saving.set(true);
    try {
      await this.donationsService.deactivate(target.id, target.code);
      this.pendingDeactivateDonation.set(null);
      this.notifications.info('Donación archivada', `Se archivó ${target.code}.`);
      await this.loadData();
    } catch (error) {
      this.notifications.error(
        'Error al archivar',
        getFirebaseErrorMessage(error, 'No fue posible archivar la donación.'),
      );
    } finally {
      this.saving.set(false);
    }
  }

  openCreateDonor(): void {
    this.editingDonorId.set(null);
    this.donorForm = this.createEmptyDonorForm();
    this.showDonorModal.set(true);
  }

  openEditDonor(donor: Donor): void {
    this.editingDonorId.set(donor.id ?? null);
    this.donorForm = {
      name: donor.name,
      documentId: donor.documentId,
      donorType: donor.donorType,
      email: donor.email ?? '',
      phone: donor.phone,
      address: donor.address ?? '',
      notes: donor.notes ?? '',
    };
    this.showDonorModal.set(true);
  }

  closeDonorModal(): void {
    this.showDonorModal.set(false);
    this.editingDonorId.set(null);
  }

  async saveDonor(): Promise<void> {
    this.saving.set(true);
    try {
      const payload = {
        name: this.donorForm.name.trim(),
        documentId: this.donorForm.documentId.trim(),
        donorType: this.donorForm.donorType,
        email: this.donorForm.email.trim(),
        phone: this.donorForm.phone.trim(),
        address: this.donorForm.address.trim(),
        notes: this.donorForm.notes.trim(),
      };
      const id = this.editingDonorId();
      if (id) {
        await this.donorsService.update(id, payload, payload.name);
        this.notifications.success('Donante actualizado', `Se actualizó a ${payload.name}.`);
      } else {
        await this.donorsService.create(payload, payload.name);
        this.notifications.success('Donante registrado', `Se registró a ${payload.name}.`);
      }
      this.closeDonorModal();
      await this.loadData();
    } catch (error) {
      this.notifications.error(
        'Error al guardar donante',
        getFirebaseErrorMessage(error, 'No fue posible guardar el donante.'),
      );
    } finally {
      this.saving.set(false);
    }
  }

  async executeDeactivateDonor(): Promise<void> {
    const target = this.pendingDeactivateDonor();
    if (!target?.id) {
      return;
    }
    this.saving.set(true);
    try {
      await this.donorsService.deactivate(target.id, target.name);
      this.pendingDeactivateDonor.set(null);
      this.notifications.info('Donante archivado', `Se archivó a ${target.name}.`);
      await this.loadData();
    } catch (error) {
      this.notifications.error(
        'Error al archivar',
        getFirebaseErrorMessage(error, 'No fue posible archivar al donante.'),
      );
    } finally {
      this.saving.set(false);
    }
  }

  formatCurrency(value: number): string {
    return new Intl.NumberFormat('es-EC', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 2,
    }).format(value || 0);
  }

  formatType(type: DonationType): string {
    switch (type) {
      case 'food':
        return 'Alimentos / Víveres';
      case 'clothing':
        return 'Prendas / Enseres';
      case 'monetary':
        return 'Monetaria directa';
      case 'education':
        return 'Material educativo';
      case 'medical':
        return 'Insumos médicos';
      case 'other':
        return 'Otros';
    }
  }

  formatDonorType(type: DonorType): string {
    switch (type) {
      case 'individual':
        return 'Persona Natural';
      case 'company':
        return 'Empresa';
      case 'organization':
        return 'Organización';
    }
  }

  formatStatus(status: DonationStatus): string {
    switch (status) {
      case 'registered':
        return 'Registrada';
      case 'in_distribution':
        return 'En distribución';
      case 'delivered':
        return 'Entregada';
    }
  }

  statusVariant(status: DonationStatus): BadgeVariant {
    switch (status) {
      case 'registered':
        return 'info';
      case 'in_distribution':
        return 'warning';
      case 'delivered':
        return 'success';
    }
  }

  private createEmptyDonationForm(): DonationFormModel {
    const seq = String(this.donations().length + 1).padStart(4, '0');
    return {
      code: `DON-${new Date().getFullYear()}-${seq}`,
      donorId: '',
      donorName: '',
      donorContact: '',
      type: 'food',
      description: '',
      quantity: 1,
      unit: 'kits',
      estimatedValue: 0,
      receivedDate: new Date().toISOString().slice(0, 10),
      status: 'registered',
      destination: '',
      beneficiaryId: '',
      notes: '',
    };
  }

  private createEmptyDonorForm(): DonorFormModel {
    return {
      name: '',
      documentId: '',
      donorType: 'individual',
      email: '',
      phone: '',
      address: '',
      notes: '',
    };
  }
}
