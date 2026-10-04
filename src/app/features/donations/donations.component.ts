import { Component } from '@angular/core';
import { PageHeaderComponent } from '../../shared/components/page-header/page-header.component';
import { AlertComponent } from '../../shared/components/alert/alert.component';
import { EmptyStateComponent } from '../../shared/components/empty-state/empty-state.component';

@Component({
  selector: 'app-donations',
  standalone: true,
  imports: [PageHeaderComponent, AlertComponent, EmptyStateComponent],
  template: `
    <app-page-header
      title="Módulo de Donaciones"
      subtitle="Registro y control de aportes, donantes, destino de la ayuda y comprobantes de respaldo"
      badgeText="Alcance Base"
      badgeType="info"
    >
      <button type="button" class="btn btn--primary" disabled title="Módulo en fase de inicialización">
        + Registrar Donación
      </button>
    </app-page-header>

    <app-alert type="info" title="Límites Normativos del Módulo">
      Conforme a las reglas fundamentales del proyecto: Este módulo tiene fines de registro y trazabilidad
      operativa e institucional. <strong>NO constituye un módulo contable, NO incluye facturación electrónica
      y NO implementa pasarelas de pago electrónicas.</strong>
    </app-alert>

    <!-- Filtros de Donaciones -->
    <div class="card module-filters">
      <div class="filter-group">
        <label for="search-donor" class="filter-label">Buscar por donante:</label>
        <input
          id="search-donor"
          type="text"
          class="filter-input"
          placeholder="Nombre del donante o código..."
          disabled
        />
      </div>
      <div class="filter-group">
        <label for="filter-type" class="filter-label">Tipo de Donación:</label>
        <select id="filter-type" class="filter-select" disabled>
          <option>Todos los tipos</option>
          <option>Especies / Alimentos</option>
          <option>Prendas de vestir / Enseres</option>
          <option>Monetaria directa (Transferencia / Depósito)</option>
          <option>Materiales educativos</option>
        </select>
      </div>
    </div>

    <!-- Estado Inicial / Vacío -->
    <app-empty-state
      title="No hay donaciones registradas"
      description="El registro de donaciones con comprobante de respaldo y destino asignado estará disponible en el siguiente incremento."
    />

    <!-- Guía del Alcance Técnico -->
    <section class="card scope-guide">
      <h3 class="scope-guide__title">Estructura del Registro de Donaciones</h3>
      <div class="scope-guide__grid">
        <div class="scope-guide__card">
          <h4>Datos del Donante</h4>
          <p>Identificación o razón social, contacto y procedencia del aporte solidario.</p>
        </div>
        <div class="scope-guide__card">
          <h4>Detalle y Valoración</h4>
          <p>Descripción detallada de bienes, cantidad y estimación de valor aproximado referencial.</p>
        </div>
        <div class="scope-guide__card">
          <h4>Destino y Asignación</h4>
          <p>Vinculación con actividades comunitarias o beneficiarios específicos receptores.</p>
        </div>
        <div class="scope-guide__card">
          <h4>Soporte y Trazabilidad</h4>
          <p>Adjunto de comprobantes o actas de entrega, fecha y usuario responsable del ingreso.</p>
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
export class DonationsComponent {}
