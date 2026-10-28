import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { PageHeaderComponent } from '../../shared/components/page-header/page-header.component';
import { StatCardComponent } from '../../shared/components/stat-card/stat-card.component';
import { AlertComponent } from '../../shared/components/alert/alert.component';
import { StatusBadgeComponent } from '../../shared/components/status-badge/status-badge.component';

interface ModuleCard {
  title: string;
  description: string;
  route: string;
  scopeItems: string[];
  status: 'base' | 'pending';
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
      badgeText="Fase 1: Base Técnica"
      badgeType="info"
    />

    <!-- Alerta Institucional de Arquitectura y Alcance -->
    <app-alert type="info" title="Estado de la Base Técnica">
      El sistema se encuentra en fase inicial de bootstrap. Los módulos funcionales están
      estructurados de acuerdo con los requerimientos base. Las funcionalidades de expansión
      (proyectos/programas, aliados y el proyecto <em>'Emprendiendo e Innovando Desde Casa'</em>)
      se encuentran documentadas y reservadas para validación previa a su incremento.
    </app-alert>

    <!-- Indicadores Preliminares (Métricas Conceptuales) -->
    <section class="grid-stats" aria-label="Indicadores del sistema">
      <app-stat-card
        label="Beneficiarios"
        value="0"
        hint="Registro y seguimiento familiar"
        tag="Alcance Base"
      />
      <app-stat-card
        label="Donaciones"
        value="0"
        hint="Respaldo físico y digital"
        tag="Alcance Base"
      />
      <app-stat-card
        label="Voluntarios"
        value="0"
        hint="Participación y disponibilidad"
        tag="Alcance Base"
      />
      <app-stat-card
        label="Actividades"
        value="0"
        hint="Eventos comunitarios y sociales"
        tag="Alcance Base"
      />
    </section>

    <!-- Accesos Rápidos a Módulos del Sistema -->
    <section class="dashboard-modules">
      <h2 class="dashboard-modules__title">Módulos del Sistema de Gestión</h2>
      <p class="dashboard-modules__desc">
        Centralización de información para eliminar dispersión documental, duplicados y falta de trazabilidad.
      </p>

      <div class="grid-cards">
        @for (card of modules; track card.route) {
          <article class="card module-card">
            <div class="module-card__header">
              <h3 class="module-card__title">{{ card.title }}</h3>
              <app-status-badge
                [text]="card.status === 'base' ? 'Alcance Base' : 'Por Validar'"
                [variant]="card.status === 'base' ? 'info' : 'warning'"
              />
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

    <!-- Sección de Transparencia de Requerimientos y Pendientes -->
    <section class="pending-section card">
      <h3 class="pending-section__title">Gobernanza del Proyecto y Reglas de Desarrollo</h3>
      <p class="pending-section__desc">
        Conforme al marco del proyecto de titulación, este software se rige por las siguientes pautas:
      </p>
      <div class="pending-grid">
        <div class="pending-item">
          <strong>Cero Invención de Datos:</strong>
          <span>No se inyectan registros ficticios haciéndolos pasar por datos reales de la Fundación.</span>
        </div>
        <div class="pending-item">
          <strong>Límites del Alcance:</strong>
          <span>No se implementan módulos contables, facturación electrónica, nómina ni pasarelas de pago.</span>
        </div>
        <div class="pending-item">
          <strong>Seguridad y Roles:</strong>
          <span>La distinción entre roles y permisos granulares de 'Personal Autorizado' se mantiene en validación formal.</span>
        </div>
        <div class="pending-item">
          <strong>Trazabilidad Obligatoria:</strong>
          <span>Toda modificación requiere identificación del usuario autenticado y auditoría inmutable.</span>
        </div>
      </div>
    </section>
  `,
  styles: [`
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

    .pending-section {
      background: #fafaf9;
      border-left: 4px solid var(--secondary);

      &__title {
        font-size: 1.125rem;
        font-weight: 700;
        margin: 0 0 0.5rem 0;
        color: var(--text-primary);
      }

      &__desc {
        font-size: 0.875rem;
        color: var(--text-secondary);
        margin: 0 0 1.25rem 0;
      }
    }

    .pending-grid {
      display: grid;
      grid-template-columns: 1fr;
      gap: 1rem;

      @media (min-width: 640px) {
        grid-template-columns: repeat(2, 1fr);
      }
    }

    .pending-item {
      display: flex;
      flex-direction: column;
      gap: 0.25rem;
      font-size: 0.8125rem;

      strong {
        color: var(--text-primary);
      }

      span {
        color: var(--text-secondary);
        line-height: 1.4;
      }
    }
  `],
})
export class DashboardComponent {
  readonly modules: ModuleCard[] = [
    {
      title: 'Beneficiarios',
      description: 'Gestión centralizada de personas y grupos familiares asistidos por la Fundación.',
      route: '/beneficiaries',
      scopeItems: [
        'Registro y datos de contacto',
        'Información socioeconómica y grupo familiar',
        'Necesidades específicas y programas',
        'Seguimiento, fechas de atención y fotografías',
      ],
      status: 'base',
    },
    {
      title: 'Donaciones',
      description: 'Control de donaciones recibidas con respaldo físico y digital.',
      route: '/donations',
      scopeItems: [
        'Registro de donante y fecha',
        'Tipo, cantidad y valor aproximado',
        'Destino y beneficiario asociado',
        'Documentos de respaldo y comprobantes',
      ],
      status: 'base',
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
      status: 'base',
    },
    {
      title: 'Actividades',
      description: 'Coordinación y evidencia de eventos comunitarios, educativos y de entrega.',
      route: '/activities',
      scopeItems: [
        'Actividades sociales, comunitarias y educativas',
        'Entrega de donaciones y acompañamiento',
        'Relación con beneficiarios y voluntarios',
        'Evidencias fotográficas y documentos',
      ],
      status: 'base',
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
      status: 'base',
    },
    {
      title: 'Reportes e Indicadores',
      description: 'Métricas institucionales y generación de reportes periódicos.',
      route: '/reports',
      scopeItems: [
        'Reportes de beneficiarios y ayudas',
        'Estadísticas de donaciones y voluntarios',
        'Exportación en PDF, Excel y CSV',
        'Fórmulas de indicadores en validación',
      ],
      status: 'base',
    },
  ];
}
