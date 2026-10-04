import { Component } from '@angular/core';
import { PageHeaderComponent } from '../../shared/components/page-header/page-header.component';
import { AlertComponent } from '../../shared/components/alert/alert.component';
import { EmptyStateComponent } from '../../shared/components/empty-state/empty-state.component';

@Component({
  selector: 'app-reports',
  standalone: true,
  imports: [PageHeaderComponent, AlertComponent, EmptyStateComponent],
  template: `
    <app-page-header
      title="Reportes e Indicadores"
      subtitle="Generación de métricas de impacto, consolidados institucionales y exportación de datos"
      badgeText="Alcance Base"
      badgeType="info"
    />

    <app-alert type="warning" title="Fórmulas de Cálculo en Proceso de Validación">
      Las fórmulas estadísticas y los criterios exactos para el cálculo de indicadores
      (como el valor aproximado de donaciones y la tasa de cobertura de beneficiarios)
      deben ser formalmente validados con la Fundación antes de generar reportes definitivos.
    </app-alert>

    <!-- Opciones de Exportación -->
    <div class="card export-formats">
      <h3 class="export-formats__title">Formatos de Exportación Identificados</h3>
      <div class="export-formats__buttons">
        <button type="button" class="btn btn--outline btn--sm" disabled>
          Exportar en PDF
        </button>
        <button type="button" class="btn btn--outline btn--sm" disabled>
          Exportar en Excel (.xlsx)
        </button>
        <button type="button" class="btn btn--outline btn--sm" disabled>
          Exportar en CSV
        </button>
      </div>
    </div>

    <!-- Estado Inicial / Vacío -->
    <app-empty-state
      title="No hay reportes generados"
      description="Los generadores de reportes y agregaciones en Firestore se activarán una vez validadas las fórmulas de cálculo con la Fundación."
    />

    <!-- Guía del Alcance Técnico -->
    <section class="card scope-guide">
      <h3 class="scope-guide__title">Indicadores Identificados en el Alcance</h3>
      <div class="scope-guide__grid">
        <div class="scope-guide__card">
          <h4>Beneficiarios Atendidos</h4>
          <p>Métrica agregada por período, sector geográfico de Quito y composición etaria.</p>
        </div>
        <div class="scope-guide__card">
          <h4>Donaciones y Valoración</h4>
          <p>Consolidado por tipo de aporte, donantes recurrentes y valor estimado referencial.</p>
        </div>
        <div class="scope-guide__card">
          <h4>Participación de Voluntarios</h4>
          <p>Horas o actividades de colaboración por voluntario y áreas de mayor demanda.</p>
        </div>
        <div class="scope-guide__card">
          <h4>Actividades Realizadas</h4>
          <p>Frecuencia de eventos sociales, campañas educativas y entregas comunitarias.</p>
        </div>
      </div>
    </section>
  `,
  styles: [`
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

    .scope-guide {
      margin-top: 2rem;

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
          grid-template-columns: repeat(2, 1fr);
        }

        @media (min-width: 1024px) {
          grid-template-columns: repeat(4, 1fr);
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
export class ReportsComponent {}
