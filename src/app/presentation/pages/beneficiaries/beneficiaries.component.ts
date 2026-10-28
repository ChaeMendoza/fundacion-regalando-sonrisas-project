import { Component } from '@angular/core';
import { PageHeaderComponent } from '../../shared/components/page-header/page-header.component';
import { AlertComponent } from '../../shared/components/alert/alert.component';
import { EmptyStateComponent } from '../../shared/components/empty-state/empty-state.component';

@Component({
  selector: 'app-beneficiaries',
  standalone: true,
  imports: [PageHeaderComponent, AlertComponent, EmptyStateComponent],
  template: `
    <app-page-header
      title="Módulo de Beneficiarios"
      subtitle="Registro, seguimiento integral, información socioeconómica y grupo familiar"
      badgeText="Alcance Base"
      badgeType="info"
    >
      <button type="button" class="btn btn--primary" disabled title="Módulo en fase de inicialización">
        + Registrar Beneficiario
      </button>
    </app-page-header>

    <app-alert type="warning" title="Campos y Requisitos en Validación">
      Los campos obligatorios de la ficha socioeconómica, composición familiar y necesidades específicas
      se encuentran en proceso de validación técnica y documental con la Fundación.
      No se forzarán campos restrictivos hasta contar con la especificación confirmada.
    </app-alert>

    <!-- Barra de búsqueda y filtros preliminares -->
    <div class="card module-filters">
      <div class="filter-group">
        <label for="search-beneficiary" class="filter-label">Buscar beneficiario:</label>
        <input
          id="search-beneficiary"
          type="text"
          class="filter-input"
          placeholder="Nombre, cédula o sector..."
          disabled
        />
      </div>
      <div class="filter-group">
        <label for="filter-program" class="filter-label">Programa / Estado:</label>
        <select id="filter-program" class="filter-select" disabled>
          <option>Todos los estados</option>
          <option>Activo</option>
          <option>Inactivo / Atendido</option>
        </select>
      </div>
    </div>

    <!-- Estado Inicial / Vacío -->
    <app-empty-state
      title="No hay beneficiarios registrados"
      description="El registro de beneficiarios se habilitará en el siguiente incremento conforme al modelo de datos aprobado por la Fundación Regalando Sonrisas."
    />

    <!-- Guía del Alcance Técnico -->
    <section class="card scope-guide">
      <h3 class="scope-guide__title">Capacidades Planificadas para este Módulo</h3>
      <div class="scope-guide__grid">
        <div class="scope-guide__card">
          <h4>Datos Personales y Contacto</h4>
          <p>Identificación oficial, nombres, datos de localización en Quito y medios de contacto.</p>
        </div>
        <div class="scope-guide__card">
          <h4>Ficha Socioeconómica</h4>
          <p>Condición habitacional, ingresos aproximados, número de dependientes y vulnerabilidades.</p>
        </div>
        <div class="scope-guide__card">
          <h4>Composición Familiar</h4>
          <p>Registro de cargas familiares, niños, adultos mayores y personas con discapacidad.</p>
        </div>
        <div class="scope-guide__card">
          <h4>Historial y Seguimiento</h4>
          <p>Bitácora de atenciones, entregas recibidas, visitas realizadas y usuario responsable.</p>
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
export class BeneficiariesComponent {}
