import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { LogAuditEventUseCase } from '../../../application/use-cases/audit/log-audit-event.use-case';
import { Activity } from '../../../domain/entities/activity.entity';
import { Beneficiary } from '../../../domain/entities/beneficiary.entity';
import { FoundationDocument } from '../../../domain/entities/document.entity';
import { Donation, Donor } from '../../../domain/entities/donation.entity';
import { SupportRequest } from '../../../domain/entities/request.entity';
import { Volunteer } from '../../../domain/entities/volunteer.entity';
import {
  ActivitiesService,
  BeneficiariesService,
  DocumentsService,
  DonationsService,
  DonorsService,
  RequestsService,
  VolunteersService,
} from '../../../infrastructure/services/foundation-modules.service';
import { AlertComponent } from '../../shared/components/alert/alert.component';
import { PageHeaderComponent } from '../../shared/components/page-header/page-header.component';
import { StatCardComponent } from '../../shared/components/stat-card/stat-card.component';
import { NotificationService } from '../../shared/services/notification.service';
import { getFirebaseErrorMessage } from '../../shared/utils/firebase-error-message';

type ReportFocus = 'all' | 'beneficiaries' | 'donations' | 'volunteers' | 'activities' | 'requests';

@Component({
  selector: 'app-reports',
  standalone: true,
  imports: [FormsModule, PageHeaderComponent, AlertComponent, StatCardComponent],
  template: `
    <app-page-header
      title="Reportes e Indicadores"
      subtitle="Consolidado institucional en tiempo real desde Firestore con filtros y exportación"
      badgeText="Datos Reales"
      badgeType="success"
    >
      <button type="button" class="btn btn--outline btn--sm no-print" (click)="loadAll()">
        &#8635; Actualizar datos
      </button>
    </app-page-header>

    @if (errorMessage()) {
      <app-alert type="danger" title="Error al consolidar reportes">
        {{ errorMessage() }}
      </app-alert>
    }

    <div class="card module-filters no-print">
      <div class="filter-group">
        <label for="rep-focus" class="filter-label">Módulo a consultar:</label>
        <select
          id="rep-focus"
          class="filter-select"
          [ngModel]="focus()"
          (ngModelChange)="focus.set($event)"
        >
          <option value="all">Resumen Integral (Todos)</option>
          <option value="beneficiaries">Beneficiarios</option>
          <option value="donations">Donaciones y Donantes</option>
          <option value="volunteers">Voluntarios</option>
          <option value="activities">Actividades</option>
          <option value="requests">Solicitudes y Necesidades</option>
        </select>
      </div>
      <div class="filter-group">
        <label for="rep-from" class="filter-label">Desde:</label>
        <input
          id="rep-from"
          type="date"
          class="filter-input"
          [ngModel]="dateFrom()"
          (ngModelChange)="dateFrom.set($event)"
        />
      </div>
      <div class="filter-group">
        <label for="rep-to" class="filter-label">Hasta:</label>
        <input
          id="rep-to"
          type="date"
          class="filter-input"
          [ngModel]="dateTo()"
          (ngModelChange)="dateTo.set($event)"
        />
      </div>
    </div>

    <div class="card export-formats no-print">
      <h3 class="export-formats__title">Exportación del Reporte Filtrado</h3>
      <div class="export-formats__buttons">
        <button
          type="button"
          class="btn btn--primary btn--sm"
          [disabled]="loading()"
          (click)="printPdf()"
        >
          Imprimir / Guardar PDF
        </button>
        <button
          type="button"
          class="btn btn--outline btn--sm"
          [disabled]="loading()"
          (click)="exportExcel()"
        >
          Exportar Excel (.xls)
        </button>
        <button
          type="button"
          class="btn btn--outline btn--sm"
          [disabled]="loading()"
          (click)="exportCsv()"
        >
          Exportar CSV
        </button>
      </div>
    </div>

    @if (loading()) {
      <div class="card loading-state">Consolidando indicadores desde Firestore…</div>
    } @else {
      <section class="grid-stats" aria-label="Indicadores consolidados">
        <app-stat-card
          label="Beneficiarios"
          [value]="filteredBeneficiaries().length"
          [hint]="householdPeopleCount() + ' personas en hogares'"
          tag="Cobertura"
        />
        <app-stat-card
          label="Donaciones"
          [value]="filteredDonations().length"
          [hint]="'Valor est.: ' + formatCurrency(totalDonationValue())"
          tag="Aportes"
        />
        <app-stat-card
          label="Voluntarios Activos"
          [value]="activeVolunteersCount()"
          [hint]="'De ' + volunteers().length + ' registrados'"
          tag="Equipo"
        />
        <app-stat-card
          label="Actividades / Solicitudes"
          [value]="filteredActivities().length + ' / ' + filteredRequests().length"
          [hint]="fulfilledRequestsCount() + ' solicitudes atendidas'"
          tag="Operación"
        />
      </section>

      <div class="reports-grid">
        @if (focus() === 'all' || focus() === 'beneficiaries') {
          <section class="card">
            <h3 class="report-title">Beneficiarios por Sector y Vulnerabilidad</h3>
            @if (beneficiariesBySector().length === 0) {
              <p class="empty-note">Sin registros en el rango seleccionado.</p>
            } @else {
              <table class="data-table">
                <thead>
                  <tr>
                    <th>Sector</th>
                    <th>Beneficiarios</th>
                    <th>Integrantes</th>
                  </tr>
                </thead>
                <tbody>
                  @for (row of beneficiariesBySector(); track row.label) {
                    <tr>
                      <td>{{ row.label }}</td>
                      <td>{{ row.count }}</td>
                      <td>{{ row.extra }}</td>
                    </tr>
                  }
                </tbody>
              </table>
            }
          </section>
        }

        @if (focus() === 'all' || focus() === 'donations') {
          <section class="card">
            <h3 class="report-title">Donaciones por Tipo</h3>
            @if (donationsByType().length === 0) {
              <p class="empty-note">Sin donaciones en el rango seleccionado.</p>
            } @else {
              <table class="data-table">
                <thead>
                  <tr>
                    <th>Tipo</th>
                    <th>Registros</th>
                    <th>Valor Est.</th>
                  </tr>
                </thead>
                <tbody>
                  @for (row of donationsByType(); track row.label) {
                    <tr>
                      <td>{{ row.label }}</td>
                      <td>{{ row.count }}</td>
                      <td>{{ formatCurrency(row.extra) }}</td>
                    </tr>
                  }
                </tbody>
              </table>
            }
          </section>
        }

        @if (focus() === 'all' || focus() === 'activities') {
          <section class="card">
            <h3 class="report-title">Actividades por Estado</h3>
            <table class="data-table">
              <thead>
                <tr>
                  <th>Estado</th>
                  <th>Cantidad</th>
                  <th>Beneficiarios</th>
                </tr>
              </thead>
              <tbody>
                @for (row of activitiesByStatus(); track row.label) {
                  <tr>
                    <td>{{ row.label }}</td>
                    <td>{{ row.count }}</td>
                    <td>{{ row.extra }}</td>
                  </tr>
                }
              </tbody>
            </table>
          </section>
        }

        @if (focus() === 'all' || focus() === 'requests' || focus() === 'volunteers') {
          <section class="card">
            <h3 class="report-title">Solicitudes por Estado y Documentos</h3>
            <table class="data-table">
              <thead>
                <tr>
                  <th>Indicador</th>
                  <th>Cantidad</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Solicitudes Pendientes / En Revisión</td>
                  <td>{{ pendingRequestsCount() }}</td>
                </tr>
                <tr>
                  <td>Solicitudes Aprobadas</td>
                  <td>{{ approvedRequestsCount() }}</td>
                </tr>
                <tr>
                  <td>Solicitudes Atendidas</td>
                  <td>{{ fulfilledRequestsCount() }}</td>
                </tr>
                <tr>
                  <td>Donantes Registrados</td>
                  <td>{{ donors().length }}</td>
                </tr>
                <tr>
                  <td>Documentos Respaldados en Storage</td>
                  <td>{{ documents().length }}</td>
                </tr>
              </tbody>
            </table>
          </section>
        }
      </div>
    }
  `,
  styles: [
    `
      .export-formats {
        margin-bottom: 1.5rem;

        &__title {
          font-size: 0.9375rem;
          font-weight: 600;
          margin: 0 0 0.75rem 0;
          color: var(--text-primary);
        }

        &__buttons {
          display: flex;
          gap: 0.75rem;
          flex-wrap: wrap;
        }
      }

      .reports-grid {
        display: grid;
        grid-template-columns: 1fr;
        gap: 1.5rem;

        @media (min-width: 960px) {
          grid-template-columns: repeat(2, 1fr);
        }
      }

      .report-title {
        margin: 0 0 1rem;
        font-size: 1rem;
        font-weight: 700;
        color: var(--text-primary);
      }

      .empty-note {
        margin: 0;
        color: var(--text-secondary);
        font-size: 0.875rem;
      }
    `,
  ],
})
export class ReportsComponent implements OnInit {
  private readonly beneficiariesService = inject(BeneficiariesService);
  private readonly donationsService = inject(DonationsService);
  private readonly donorsService = inject(DonorsService);
  private readonly volunteersService = inject(VolunteersService);
  private readonly activitiesService = inject(ActivitiesService);
  private readonly requestsService = inject(RequestsService);
  private readonly documentsService = inject(DocumentsService);
  private readonly audit = inject(LogAuditEventUseCase);
  private readonly notifications = inject(NotificationService);

  readonly loading = signal(true);
  readonly errorMessage = signal('');

  readonly focus = signal<ReportFocus>('all');
  readonly dateFrom = signal('');
  readonly dateTo = signal('');

  readonly beneficiaries = signal<Beneficiary[]>([]);
  readonly donations = signal<Donation[]>([]);
  readonly donors = signal<Donor[]>([]);
  readonly volunteers = signal<Volunteer[]>([]);
  readonly activities = signal<Activity[]>([]);
  readonly requests = signal<SupportRequest[]>([]);
  readonly documents = signal<FoundationDocument[]>([]);

  readonly filteredBeneficiaries = computed(() =>
    this.beneficiaries().filter((b) => this.inDateRange(b.createdAt?.slice(0, 10))),
  );
  readonly filteredDonations = computed(() =>
    this.donations().filter((d) => this.inDateRange(d.receivedDate)),
  );
  readonly filteredActivities = computed(() =>
    this.activities().filter((a) => this.inDateRange(a.date)),
  );
  readonly filteredRequests = computed(() =>
    this.requests().filter((r) => this.inDateRange(r.requestDate)),
  );

  readonly householdPeopleCount = computed(() =>
    this.filteredBeneficiaries().reduce((sum, b) => sum + (Number(b.householdSize) || 0), 0),
  );
  readonly totalDonationValue = computed(() =>
    this.filteredDonations().reduce((sum, d) => sum + (Number(d.estimatedValue) || 0), 0),
  );
  readonly activeVolunteersCount = computed(
    () => this.volunteers().filter((v) => v.status === 'active').length,
  );
  readonly pendingRequestsCount = computed(
    () =>
      this.filteredRequests().filter((r) => r.status === 'pending' || r.status === 'in_review')
        .length,
  );
  readonly approvedRequestsCount = computed(
    () => this.filteredRequests().filter((r) => r.status === 'approved').length,
  );
  readonly fulfilledRequestsCount = computed(
    () => this.filteredRequests().filter((r) => r.status === 'fulfilled').length,
  );

  readonly beneficiariesBySector = computed(() => {
    const map = new Map<string, { count: number; extra: number }>();
    for (const b of this.filteredBeneficiaries()) {
      const key = b.sector || 'Sin sector';
      const current = map.get(key) ?? { count: 0, extra: 0 };
      map.set(key, {
        count: current.count + 1,
        extra: current.extra + (Number(b.householdSize) || 0),
      });
    }
    return Array.from(map.entries()).map(([label, val]) => ({ label, ...val }));
  });

  readonly donationsByType = computed(() => {
    const labels: Record<string, string> = {
      food: 'Alimentos / Víveres',
      clothing: 'Prendas / Enseres',
      monetary: 'Monetaria directa',
      education: 'Material educativo',
      medical: 'Insumos médicos',
      other: 'Otros',
    };
    const map = new Map<string, { count: number; extra: number }>();
    for (const d of this.filteredDonations()) {
      const key = labels[d.type] ?? d.type;
      const current = map.get(key) ?? { count: 0, extra: 0 };
      map.set(key, {
        count: current.count + 1,
        extra: current.extra + (Number(d.estimatedValue) || 0),
      });
    }
    return Array.from(map.entries()).map(([label, val]) => ({ label, ...val }));
  });

  readonly activitiesByStatus = computed(() => {
    const labels: Record<string, string> = {
      planned: 'Planificadas',
      in_progress: 'En curso',
      completed: 'Finalizadas',
      cancelled: 'Canceladas',
    };
    const map = new Map<string, { count: number; extra: number }>();
    for (const a of this.filteredActivities()) {
      const key = labels[a.status] ?? a.status;
      const current = map.get(key) ?? { count: 0, extra: 0 };
      map.set(key, {
        count: current.count + 1,
        extra: current.extra + (Number(a.beneficiariesCount) || 0),
      });
    }
    return Array.from(map.entries()).map(([label, val]) => ({ label, ...val }));
  });

  ngOnInit(): void {
    void this.loadAll();
  }

  async loadAll(): Promise<void> {
    this.loading.set(true);
    this.errorMessage.set('');
    try {
      const [bens, dons, donorList, vols, acts, reqs, docs] = await Promise.all([
        this.beneficiariesService.list(),
        this.donationsService.list(),
        this.donorsService.list(),
        this.volunteersService.list(),
        this.activitiesService.list(),
        this.requestsService.list(),
        this.documentsService.list(),
      ]);
      this.beneficiaries.set(bens);
      this.donations.set(dons);
      this.donors.set(donorList);
      this.volunteers.set(vols);
      this.activities.set(acts);
      this.requests.set(reqs);
      this.documents.set(docs);
    } catch (error) {
      this.errorMessage.set(
        getFirebaseErrorMessage(error, 'No fue posible consolidar los reportes.'),
      );
    } finally {
      this.loading.set(false);
    }
  }

  printPdf(): void {
    void this.audit.execute('export', 'reports', { format: 'pdf', focus: this.focus() });
    window.print();
  }

  exportCsv(): void {
    const rows = this.buildExportRows();
    const csvContent =
      '\uFEFF' + rows.map((row) => row.map((cell) => this.escapeCsv(cell)).join(',')).join('\n');
    this.downloadBlob(
      csvContent,
      'text/csv;charset=utf-8;',
      `reporte-regalando-sonrisas-${new Date().toISOString().slice(0, 10)}.csv`,
    );
    void this.audit.execute('export', 'reports', { format: 'csv', focus: this.focus() });
    this.notifications.success('CSV exportado', 'El archivo CSV se descargó correctamente.');
  }

  exportExcel(): void {
    const rows = this.buildExportRows();
    const tableRows = rows
      .map(
        (row, idx) =>
          `<tr>${row
            .map((cell) => (idx === 0 ? `<th>${cell}</th>` : `<td>${cell}</td>`))
            .join('')}</tr>`,
      )
      .join('');
    const html = `<html><head><meta charset="UTF-8"></head><body><table border="1">${tableRows}</table></body></html>`;
    this.downloadBlob(
      html,
      'application/vnd.ms-excel;charset=utf-8;',
      `reporte-regalando-sonrisas-${new Date().toISOString().slice(0, 10)}.xls`,
    );
    void this.audit.execute('export', 'reports', { format: 'excel', focus: this.focus() });
    this.notifications.success('Excel exportado', 'El archivo Excel (.xls) se descargó.');
  }

  formatCurrency(value: number): string {
    return new Intl.NumberFormat('es-EC', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 2,
    }).format(value || 0);
  }

  private inDateRange(dateStr?: string): boolean {
    const from = this.dateFrom();
    const to = this.dateTo();
    if (!from && !to) {
      return true;
    }
    if (!dateStr) {
      return false;
    }
    if (from && dateStr < from) {
      return false;
    }
    if (to && dateStr > to) {
      return false;
    }
    return true;
  }

  private buildExportRows(): string[][] {
    const rows: string[][] = [['Módulo', 'Indicador / Detalle', 'Cantidad', 'Referencia / Valor']];

    for (const s of this.beneficiariesBySector()) {
      rows.push(['Beneficiarios', `Sector: ${s.label}`, String(s.count), `${s.extra} personas`]);
    }
    for (const d of this.donationsByType()) {
      rows.push(['Donaciones', `Tipo: ${d.label}`, String(d.count), this.formatCurrency(d.extra)]);
    }
    for (const a of this.activitiesByStatus()) {
      rows.push(['Actividades', `Estado: ${a.label}`, String(a.count), `${a.extra} beneficiarios`]);
    }
    rows.push(['Voluntarios', 'Voluntarios activos', String(this.activeVolunteersCount()), 'Equipo']);
    rows.push(['Solicitudes', 'Pendientes / En revisión', String(this.pendingRequestsCount()), 'Por atender']);
    rows.push(['Solicitudes', 'Atendidas', String(this.fulfilledRequestsCount()), 'Completadas']);
    rows.push(['Documentos', 'Archivos en repositorio', String(this.documents().length), 'Storage']);
    return rows;
  }

  private escapeCsv(value: string): string {
    const safe = String(value ?? '').replace(/"/g, '""');
    return `"${safe}"`;
  }

  private downloadBlob(content: string, mimeType: string, filename: string): void {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }
}
