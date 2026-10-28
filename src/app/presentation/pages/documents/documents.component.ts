import { Component } from '@angular/core';
import { PageHeaderComponent } from '../../shared/components/page-header/page-header.component';
import { AlertComponent } from '../../shared/components/alert/alert.component';
import { EmptyStateComponent } from '../../shared/components/empty-state/empty-state.component';

@Component({
  selector: 'app-documents',
  standalone: true,
  imports: [PageHeaderComponent, AlertComponent, EmptyStateComponent],
  template: `
    <app-page-header
      title="Gestión Documental"
      subtitle="Repositorio centralizado de identificaciones, comprobantes, informes y evidencias fotográficas"
      badgeText="Alcance Base"
      badgeType="info"
    >
      <button type="button" class="btn btn--primary" disabled title="Módulo en fase de inicialización">
        + Subir Documento
      </button>
    </app-page-header>

    <app-alert type="warning" title="Protección de Datos Personales">
      Los documentos que contienen datos sensibles (como copias de cédula o fichas socioeconómicas)
      se almacenan con reglas de seguridad estrictas en Cloud Storage y
      <strong>no poseen acceso público indiscriminado</strong>.
    </app-alert>

    <!-- Filtros por módulo -->
    <div class="card module-filters">
      <div class="filter-group">
        <label for="filter-category" class="filter-label">Módulo Asociado:</label>
        <select id="filter-category" class="filter-select" disabled>
          <option>Todos los módulos</option>
          <option>Beneficiarios</option>
          <option>Voluntarios</option>
          <option>Donaciones</option>
          <option>Actividades</option>
        </select>
      </div>
      <div class="filter-group">
        <label for="filter-doc-type" class="filter-label">Tipo de Documento:</label>
        <select id="filter-doc-type" class="filter-select" disabled>
          <option>Todos los tipos</option>
          <option>Identificaciones / Cédulas</option>
          <option>Comprobantes / Recibos</option>
          <option>Informes Técnicos</option>
          <option>Fotografías y Evidencias</option>
          <option>Certificados</option>
        </select>
      </div>
    </div>

    <!-- Estado Inicial / Vacío -->
    <app-empty-state
      title="No hay documentos almacenados"
      description="El visor de documentos y la integración directa con Cloud Storage se habilitarán en el incremento correspondiente."
    />

    <!-- Guía del Alcance Técnico -->
    <section class="card scope-guide">
      <h3 class="scope-guide__title">Criterios de Seguridad y Organización Documental</h3>
      <div class="scope-guide__grid">
        <div class="scope-guide__card">
          <h4>Estructura de Almacenamiento</h4>
          <p>Organización por carpeta modular (<code>/modulo/id_registro/nombre_archivo</code>).</p>
        </div>
        <div class="scope-guide__card">
          <h4>Control de Acceso</h4>
          <p>Verificación obligatoria de autenticación y permisos según el tipo de archivo.</p>
        </div>
        <div class="scope-guide__card">
          <h4>Metadatos y Auditoría</h4>
          <p>Registro de usuario que subió el archivo, fecha, tamaño y tipo de contenido.</p>
        </div>
        <div class="scope-guide__card">
          <h4>Integridad de Archivos</h4>
          <p>Límites de tamaño por archivo (10 MB) y tipos MIME autorizados (PDF, JPEG, PNG).</p>
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
export class DocumentsComponent {}
