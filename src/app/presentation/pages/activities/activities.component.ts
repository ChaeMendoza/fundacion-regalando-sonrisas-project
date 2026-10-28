import { Component } from '@angular/core';
import { PageHeaderComponent } from '../../shared/components/page-header/page-header.component';
import { AlertComponent } from '../../shared/components/alert/alert.component';
import { EmptyStateComponent } from '../../shared/components/empty-state/empty-state.component';

@Component({
  selector: 'app-activities',
  standalone: true,
  imports: [PageHeaderComponent, AlertComponent, EmptyStateComponent],
  template: `
    <app-page-header
      title="Módulo de Actividades"
      subtitle="Coordinación y bitácora de eventos sociales, educativos, comunitarios y entregas"
      badgeText="Alcance Base"
      badgeType="info"
    >
      <button type="button" class="btn btn--primary" disabled title="Módulo en fase de inicialización">
        + Registrar Actividad
      </button>
    </app-page-header>

    <app-alert type="info" title="Vinculación Relacional">
      Las actividades constituyen el eje articulador operativo: vinculan a los <strong>voluntarios</strong>
      participantes, los <strong>beneficiarios</strong> atendidos y las <strong>donaciones</strong> entregadas.
    </app-alert>

    <!-- Filtros de Actividades -->
    <div class="card module-filters">
      <div class="filter-group">
        <label for="search-activity" class="filter-label">Buscar actividad:</label>
        <input
          id="search-activity"
          type="text"
          class="filter-input"
          placeholder="Nombre del evento o lugar..."
          disabled
        />
      </div>
      <div class="filter-group">
        <label for="filter-activity-type" class="filter-label">Tipo de Actividad:</label>
        <select id="filter-activity-type" class="filter-select" disabled>
          <option>Todos los tipos</option>
          <option>Social / Asistencial</option>
          <option>Educativa / Formación</option>
          <option>Comunitaria / Integración</option>
          <option>Campaña de Donación</option>
          <option>Acompañamiento Familiar</option>
        </select>
      </div>
    </div>

    <!-- Estado Inicial / Vacío -->
    <app-empty-state
      title="No hay actividades registradas"
      description="La planificación y registro de actividades con evidencias fotográficas se habilitará en el siguiente incremento."
    />

    <!-- Guía del Alcance Técnico -->
    <section class="card scope-guide">
      <h3 class="scope-guide__title">Estructura del Registro de Actividades</h3>
      <div class="scope-guide__grid">
        <div class="scope-guide__card">
          <h4>Datos del Evento</h4>
          <p>Nombre, tipo, fecha, lugar específico en Quito, duración y usuario responsable.</p>
        </div>
        <div class="scope-guide__card">
          <h4>Beneficiarios Atendidos</h4>
          <p>Nómina de personas o familias asistentes con registro de recepción de ayuda.</p>
        </div>
        <div class="scope-guide__card">
          <h4>Voluntarios Participantes</h4>
          <p>Registro de asistencia y rol desempeñado durante la jornada solidaria.</p>
        </div>
        <div class="scope-guide__card">
          <h4>Evidencias y Documentos</h4>
          <p>Fotografías y actas de entrega almacenadas de forma segura en Cloud Storage.</p>
        </div>
      </div>
    </section>
  `,
  styles: [`
    .module-filters {
      display: flex;
      flex-direction: column;
      gap: 1rem;
      margin-bottom: 1.5rem;

      @media (min-width: 640px) {
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

    .filter-input, .filter-select {
      padding: 0.5rem 0.75rem;
      border: 1px solid var(--border-color);
      border-radius: 0.375rem;
      font-size: 0.875rem;
      background: var(--surface-bg);
      color: var(--text-muted);
      cursor: not-allowed;
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
export class ActivitiesComponent {}
