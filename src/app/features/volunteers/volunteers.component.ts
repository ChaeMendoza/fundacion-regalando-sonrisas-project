import { Component } from '@angular/core';
import { PageHeaderComponent } from '../../shared/components/page-header/page-header.component';
import { AlertComponent } from '../../shared/components/alert/alert.component';
import { EmptyStateComponent } from '../../shared/components/empty-state/empty-state.component';

@Component({
  selector: 'app-volunteers',
  standalone: true,
  imports: [PageHeaderComponent, AlertComponent, EmptyStateComponent],
  template: `
    <app-page-header
      title="Módulo de Voluntarios"
      subtitle="Registro, disponibilidad, áreas de colaboración, habilidades y participación en actividades"
      badgeText="Alcance Base"
      badgeType="info"
    >
      <button type="button" class="btn btn--primary" disabled title="Módulo en fase de inicialización">
        + Registrar Voluntario
      </button>
    </app-page-header>

    <app-alert type="warning" title="Campos Sensibles y Disponibilidad">
      La lista definitiva de campos de contacto de emergencia, habilidades específicas y disponibilidad horaria
      debe ser convalidada con la coordinación de voluntariado de la Fundación Regalando Sonrisas.
    </app-alert>

    <!-- Filtros de Voluntarios -->
    <div class="card module-filters">
      <div class="filter-group">
        <label for="search-volunteer" class="filter-label">Buscar voluntario:</label>
        <input
          id="search-volunteer"
          type="text"
          class="filter-input"
          placeholder="Nombre, cédula o habilidad..."
          disabled
        />
      </div>
      <div class="filter-group">
        <label for="filter-status" class="filter-label">Estado:</label>
        <select id="filter-status" class="filter-select" disabled>
          <option>Todos los estados</option>
          <option>Activo</option>
          <option>Inactivo / En pausa</option>
        </select>
      </div>
    </div>

    <!-- Estado Inicial / Vacío -->
    <app-empty-state
      title="No hay voluntarios registrados"
      description="El padrón de voluntarios y su historial de participación se activarán en el siguiente incremento técnico."
    />

    <!-- Guía del Alcance Técnico -->
    <section class="card scope-guide">
      <h3 class="scope-guide__title">Estructura del Registro de Voluntarios</h3>
      <div class="scope-guide__grid">
        <div class="scope-guide__card">
          <h4>Datos Personales y Contacto</h4>
          <p>Nombres, identificación, dirección de domicilio en Quito, teléfono y correo electrónico.</p>
        </div>
        <div class="scope-guide__card">
          <h4>Disponibilidad y Áreas</h4>
          <p>Días y horarios disponibles, áreas de apoyo (social, logística, educativa o administrativa).</p>
        </div>
        <div class="scope-guide__card">
          <h4>Habilidades y Emergencia</h4>
          <p>Competencias destacadas y contacto familiar inmediato ante cualquier eventualidad.</p>
        </div>
        <div class="scope-guide__card">
          <h4>Historial de Participación</h4>
          <p>Registro automático de asistencia y apoyo brindado en cada actividad o evento institucional.</p>
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
export class VolunteersComponent {}
