import { Component, OnInit, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import {
  ActivitiesService,
  BeneficiariesService,
  DocumentsService,
  DonationsService,
  RequestsService,
  VolunteersService,
} from '../../../infrastructure/services/foundation-modules.service';
import { AlertComponent } from '../../shared/components/alert/alert.component';
import { PageHeaderComponent } from '../../shared/components/page-header/page-header.component';
import { StatCardComponent } from '../../shared/components/stat-card/stat-card.component';
import { StatusBadgeComponent } from '../../shared/components/status-badge/status-badge.component';
import { getFirebaseErrorMessage } from '../../shared/utils/firebase-error-message';

interface ModuleCard {
  title: string;
  description: string;
  route: string;
  scopeItems: string[];
  badge: string;
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    RouterLink,
    PageHeaderComponent,
    StatCardComponent,
    AlertComponent,
    StatusBadgeComponent,
  ],
  template: `
    <app-page-header
      title="Panel de Control y Resumen"
      subtitle="Sistema de Gestión Integral — Fundación Regalando Sonrisas (Quito, Ecuador)"
      badgeText="Versión Beta"
      badgeType="success"
    >
      <button type="button" class="btn btn--outline btn--sm" (click)="loadMetrics()">
        &#8635; Actualizar resumen
      </button>
    </app-page-header>

    @if (errorMessage()) {
      <app-alert type="warning" title="No se pudieron actualizar algunos indicadores">
        {{ errorMessage() }}
      </app-alert>
    }

    <!-- Indicadores Operativos en Tiempo Real desde Firestore -->
    <section class="grid-stats" aria-label="Indicadores del sistema">
      <app-stat-card
        label="Beneficiarios"
        [value]="loading() ? '…' : beneficiariesCount()"
        hint="Familias y personas registradas"
        tag="Firestore"
      />
      <app-stat-card
        label="Donaciones"
        [value]="loading() ? '…' : donationsCount()"
        [hint]="'Valor est.: ' + formattedDonationsValue()"
        tag="Aportes"
      />
      <app-stat-card
        label="Voluntarios"
        [value]="loading() ? '…' : volunteersCount()"
        hint="Equipo de voluntariado activo"
        tag="Equipo"
      />
      <app-stat-card
        label="Actividades"
        [value]="loading() ? '…' : activitiesCount()"
        [hint]="requestsCount() + ' solicitudes · ' + documentsCount() + ' docs'"
        tag="Operación"
      />
    </section>

    <!-- Accesos Rápidos a Módulos del Sistema -->
    <section class="dashboard-modules">
      <h2 class="dashboard-modules__title">Módulos del Sistema de Gestión</h2>
      <p class="dashboard-modules__desc">
        Accede directamente a cada área operativa para registrar, consultar y dar seguimiento a la
        gestión institucional.
      </p>

      <div class="grid-cards">
        @for (card of modules; track card.route) {
          <article class="card module-card">
            <div class="module-card__header">
              <h3 class="module-card__title">{{ card.title }}</h3>
              <app-status-badge [text]="card.badge" variant="success" />
            </div>
            <p class="module-card__description">{{ card.description }}</p>
            <ul class="module-card__items">
              @for (item of card.scopeItems; track item) {
                <li>{{ item }}</li>
              }
            </ul>
            <div class="module-card__footer">
              <a [routerLink]="card.route" class="btn btn--primary btn--sm">
                Acceder al Módulo &rarr;
              </a>
            </div>
          </article>
        }
      </div>
    </section>
  `,
  styles: [
    `
      .dashboard-modules {
        margin-bottom: 2rem;

        &__title {
          font-size: 1.25rem;
          font-weight: 700;
          color: var(--text-primary);
          margin: 0 0 0.25rem 0;
        }

        &__desc {
          font-size: 0.875rem;
          color: var(--text-secondary);
          margin: 0 0 1.25rem 0;
        }
      }

      .module-card {
        display: flex;
        flex-direction: column;
        justify-content: space-between;

        &__header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: 0.5rem;
          margin-bottom: 0.75rem;
        }

        &__title {
          font-size: 1.125rem;
          font-weight: 600;
          color: var(--text-primary);
          margin: 0;
        }

        &__description {
          font-size: 0.875rem;
          color: var(--text-secondary);
          margin: 0 0 1rem 0;
          line-height: 1.45;
        }

        &__items {
          margin: 0 0 1.5rem 0;
          padding-left: 1.25rem;
          font-size: 0.8125rem;
          color: var(--text-secondary);
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
        }

        &__footer {
          padding-top: 1rem;
          border-top: 1px solid var(--border-color);
        }
      }
    `,
  ],
})
export class DashboardComponent implements OnInit {
  private readonly beneficiariesService = inject(BeneficiariesService);
  private readonly donationsService = inject(DonationsService);
  private readonly volunteersService = inject(VolunteersService);
  private readonly activitiesService = inject(ActivitiesService);
  private readonly requestsService = inject(RequestsService);
  private readonly documentsService = inject(DocumentsService);

  readonly loading = signal(true);
  readonly errorMessage = signal('');

  readonly beneficiariesCount = signal(0);
  readonly donationsCount = signal(0);
  readonly donationsTotalValue = signal(0);
  readonly volunteersCount = signal(0);
  readonly activitiesCount = signal(0);
  readonly requestsCount = signal(0);
  readonly documentsCount = signal(0);

  readonly modules: ModuleCard[] = [
    {
      title: 'Beneficiarios',
      description:
        'Gestión centralizada de personas y grupos familiares asistidos por la Fundación.',
      route: '/beneficiaries',
      scopeItems: [
        'Registro y datos de contacto',
        'Ficha socioeconómica y vulnerabilidad',
        'Necesidades específicas y programas',
        'Seguimiento y archivo histórico',
      ],
      badge: 'Activo',
    },
    {
      title: 'Donaciones y Donantes',
      description: 'Control de donaciones recibidas, donantes y comprobantes de respaldo.',
      route: '/donations',
      scopeItems: [
        'Registro de donantes y aportaciones',
        'Tipo, cantidad y valor estimado',
        'Destino y beneficiario asociado',
        'Adjunto de comprobantes en Storage',
      ],
      badge: 'Activo',
    },
    {
      title: 'Voluntarios',
      description: 'Administración del equipo de voluntariado institucional.',
      route: '/volunteers',
      scopeItems: [
        'Registro y datos de contacto',
        'Disponibilidad y áreas de colaboración',
        'Habilidades y contacto de emergencia',
        'Historial de participación en actividades',
      ],
      badge: 'Activo',
    },
    {
      title: 'Actividades y Solicitudes',
      description: 'Coordinación de eventos comunitarios y atención de solicitudes de ayuda.',
      route: '/activities',
      scopeItems: [
        'Actividades sociales, educativas y entregas',
        'Vinculación con voluntarios y beneficiarios',
        'Seguimiento de solicitudes prioritarias',
        'Control de estados y resultados',
      ],
      badge: 'Activo',
    },
    {
      title: 'Gestión Documental',
      description: 'Repositorio centralizado de archivos, identificaciones y evidencias.',
      route: '/documents',
      scopeItems: [
        'Identificaciones, informes y comprobantes',
        'Fotografías y certificados institucionales',
        'Almacenamiento seguro en Cloud Storage',
        'Control de acceso y trazabilidad',
      ],
      badge: 'Activo',
    },
    {
      title: 'Reportes e Indicadores',
      description: 'Métricas institucionales consolidadas y exportación de reportes.',
      route: '/reports',
      scopeItems: [
        'Consolidado real desde Firestore',
        'Filtros por módulo y rango de fechas',
        'Exportación en PDF, Excel (.xls) y CSV',
        'Indicadores de cobertura e impacto',
      ],
      badge: 'Activo',
    },
  ];

  ngOnInit(): void {
    void this.loadMetrics();
  }

  formattedDonationsValue(): string {
    return new Intl.NumberFormat('es-EC', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0,
    }).format(this.donationsTotalValue());
  }

  async loadMetrics(): Promise<void> {
    this.loading.set(true);
    this.errorMessage.set('');
    try {
      const [bens, dons, vols, acts, reqs, docs] = await Promise.all([
        this.beneficiariesService.list(),
        this.donationsService.list(),
        this.volunteersService.list(),
        this.activitiesService.list(),
        this.requestsService.list(),
        this.documentsService.list(),
      ]);

      this.beneficiariesCount.set(bens.length);
      this.donationsCount.set(dons.length);
      this.donationsTotalValue.set(
        dons.reduce((sum, d) => sum + (Number(d.estimatedValue) || 0), 0),
      );
      this.volunteersCount.set(vols.length);
      this.activitiesCount.set(acts.length);
      this.requestsCount.set(reqs.length);
      this.documentsCount.set(docs.length);
    } catch (error) {
      this.errorMessage.set(
        getFirebaseErrorMessage(error, 'Error al consultar las métricas en Firestore.'),
      );
    } finally {
      this.loading.set(false);
    }
  }
}
