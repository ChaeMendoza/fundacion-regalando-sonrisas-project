import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import {
  DocumentModule,
  DocumentType,
  FoundationDocument,
} from '../../../domain/entities/document.entity';
import { DocumentsService } from '../../../infrastructure/services/foundation-modules.service';
import { AlertComponent } from '../../shared/components/alert/alert.component';
import { EmptyStateComponent } from '../../shared/components/empty-state/empty-state.component';
import { PageHeaderComponent } from '../../shared/components/page-header/page-header.component';
import { StatCardComponent } from '../../shared/components/stat-card/stat-card.component';
import { StatusBadgeComponent } from '../../shared/components/status-badge/status-badge.component';
import { NotificationService } from '../../shared/services/notification.service';
import { getFirebaseErrorMessage } from '../../shared/utils/firebase-error-message';

interface DocumentUploadForm {
  title: string;
  module: DocumentModule;
  recordId: string;
  recordLabel: string;
  docType: DocumentType;
  description: string;
}

const ALLOWED_MIME_TYPES = new Set([
  'application/pdf',
  'image/jpeg',
  'image/png',
  'image/webp',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
]);

@Component({
  selector: 'app-documents',
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
      title="Gestión Documental"
      subtitle="Repositorio centralizado de identificaciones, comprobantes, informes y evidencias fotográficas"
      badgeText="Cloud Storage"
      badgeType="success"
    >
      <button type="button" class="btn btn--outline btn--sm" (click)="loadDocuments()">
        &#8635; Actualizar
      </button>
      <button type="button" class="btn btn--primary" (click)="openUploadModal()">
        + Subir Documento
      </button>
    </app-page-header>

    @if (errorMessage()) {
      <app-alert type="danger" title="Error de carga">
        {{ errorMessage() }}
      </app-alert>
    }

    <section class="grid-stats" aria-label="Resumen documental">
      <app-stat-card
        label="Documentos Activos"
        [value]="documents().length"
        hint="Archivos indexados en Firestore"
        tag="Repositorio"
      />
      <app-stat-card
        label="Respaldos y Comprobantes"
        [value]="receiptsCount()"
        hint="Actas y recibos de donación"
        tag="Trazabilidad"
      />
      <app-stat-card
        label="Evidencias"
        [value]="evidenceCount()"
        hint="Fotografías y soportes"
        tag="Actividades"
      />
      <app-stat-card
        label="Almacenamiento Usado"
        [value]="formatSize(totalBytes())"
        hint="Cuota controlada (máx. 10 MB/archivo)"
        tag="Storage"
      />
    </section>

    <div class="card module-filters">
      <div class="filter-group">
        <label for="search-doc" class="filter-label">Buscar documento:</label>
        <input
          id="search-doc"
          type="text"
          class="filter-input"
          placeholder="Título, archivo o referencia..."
          [ngModel]="searchTerm()"
          (ngModelChange)="searchTerm.set($event)"
        />
      </div>
      <div class="filter-group">
        <label for="filter-category" class="filter-label">Módulo Asociado:</label>
        <select
          id="filter-category"
          class="filter-select"
          [ngModel]="moduleFilter()"
          (ngModelChange)="moduleFilter.set($event)"
        >
          <option value="all">Todos los módulos</option>
          <option value="beneficiaries">Beneficiarios</option>
          <option value="donations">Donaciones</option>
          <option value="volunteers">Voluntarios</option>
          <option value="activities">Actividades</option>
          <option value="requests">Solicitudes</option>
          <option value="institutional">Institucional</option>
        </select>
      </div>
      <div class="filter-group">
        <label for="filter-doc-type" class="filter-label">Tipo de Documento:</label>
        <select
          id="filter-doc-type"
          class="filter-select"
          [ngModel]="typeFilter()"
          (ngModelChange)="typeFilter.set($event)"
        >
          <option value="all">Todos los tipos</option>
          <option value="identification">Identificaciones / Cédulas</option>
          <option value="receipt">Comprobantes / Recibos</option>
          <option value="report">Informes Técnicos</option>
          <option value="evidence">Fotografías y Evidencias</option>
          <option value="certificate">Certificados</option>
          <option value="other">Otros</option>
        </select>
      </div>
    </div>

    @if (loading()) {
      <div class="card loading-state">Cargando repositorio documental desde Firestore…</div>
    } @else if (filteredDocuments().length === 0) {
      <app-empty-state
        title="No hay documentos almacenados"
        description="Sube un documento de respaldo o ajusta los filtros de búsqueda."
      />
    } @else {
      <div class="card table-card">
        <div class="table-responsive">
          <table class="data-table">
            <thead>
              <tr>
                <th>Documento</th>
                <th>Módulo</th>
                <th>Tipo</th>
                <th>Referencia</th>
                <th>Tamaño</th>
                <th>Subido por</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              @for (doc of filteredDocuments(); track doc.id) {
                <tr>
                  <td>
                    <div class="cell-primary">{{ doc.title }}</div>
                    <div class="cell-secondary">{{ doc.fileName }}</div>
                  </td>
                  <td>
                    <app-status-badge [text]="formatModule(doc.module)" variant="info" />
                  </td>
                  <td>{{ formatType(doc.docType) }}</td>
                  <td>{{ doc.recordLabel || doc.recordId }}</td>
                  <td>{{ formatSize(doc.size) }}</td>
                  <td>
                    <div>{{ doc.uploadedByName }}</div>
                    <div class="cell-secondary">{{ formatDate(doc.createdAt) }}</div>
                  </td>
                  <td>
                    <div class="table-actions">
                      <a
                        [href]="doc.downloadUrl"
                        target="_blank"
                        rel="noopener noreferrer"
                        class="btn btn--outline btn--sm"
                      >
                        Abrir
                      </a>
                      <button
                        type="button"
                        class="btn btn--ghost btn--sm"
                        (click)="pendingDeactivate.set(doc)"
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

    @if (showUploadModal()) {
      <div class="modal-backdrop" role="dialog" aria-modal="true">
        <div class="modal-panel">
          <div class="modal-panel__header">
            <h2>Subir Documento</h2>
            <button type="button" class="modal-panel__close" (click)="closeUploadModal()">
              &times;
            </button>
          </div>
          <form (ngSubmit)="uploadDocument()" #docForm="ngForm">
            <div class="modal-panel__body">
              <div class="form-grid">
                <div class="form-field form-field--full">
                  <label for="doc-title">Título del documento *</label>
                  <input
                    id="doc-title"
                    name="title"
                    class="form-control"
                    required
                    minlength="3"
                    [(ngModel)]="form.title"
                    placeholder="Ej. Acta de entrega de víveres - Chillogallo"
                  />
                </div>

                <div class="form-field">
                  <label for="doc-module">Módulo asociado *</label>
                  <select
                    id="doc-module"
                    name="module"
                    class="form-control"
                    required
                    [(ngModel)]="form.module"
                  >
                    <option value="beneficiaries">Beneficiarios</option>
                    <option value="donations">Donaciones</option>
                    <option value="volunteers">Voluntarios</option>
                    <option value="activities">Actividades</option>
                    <option value="requests">Solicitudes</option>
                    <option value="institutional">Institucional</option>
                  </select>
                </div>

                <div class="form-field">
                  <label for="doc-type">Tipo de documento *</label>
                  <select
                    id="doc-type"
                    name="docType"
                    class="form-control"
                    required
                    [(ngModel)]="form.docType"
                  >
                    <option value="identification">Identificación / Cédula</option>
                    <option value="receipt">Comprobante / Recibo</option>
                    <option value="report">Informe Técnico</option>
                    <option value="evidence">Fotografía / Evidencia</option>
                    <option value="certificate">Certificado</option>
                    <option value="other">Otro</option>
                  </select>
                </div>

                <div class="form-field">
                  <label for="doc-ref">Referencia o persona/evento *</label>
                  <input
                    id="doc-ref"
                    name="recordLabel"
                    class="form-control"
                    required
                    [(ngModel)]="form.recordLabel"
                    placeholder="Ej. DON-2026-0001 o Familia Pérez"
                  />
                </div>

                <div class="form-field">
                  <label for="doc-file">Archivo (PDF, Imagen, Word, Excel · máx. 10 MB) *</label>
                  <input
                    id="doc-file"
                    type="file"
                    class="form-control"
                    accept=".pdf,.jpg,.jpeg,.png,.webp,.doc,.docx,.xls,.xlsx"
                    (change)="onFileSelected($event)"
                  />
                </div>

                <div class="form-field form-field--full">
                  <label for="doc-desc">Descripción / Observaciones</label>
                  <textarea
                    id="doc-desc"
                    name="description"
                    rows="2"
                    class="form-control"
                    [(ngModel)]="form.description"
                  ></textarea>
                </div>
              </div>
            </div>

            <div class="modal-panel__footer">
              <button type="button" class="btn btn--outline" (click)="closeUploadModal()">
                Cancelar
              </button>
              <button
                type="submit"
                class="btn btn--primary"
                [disabled]="uploading() || docForm.invalid || !selectedFile"
              >
                {{ uploading() ? 'Subiendo archivo…' : 'Subir y Guardar' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    }

    @if (pendingDeactivate(); as target) {
      <div class="modal-backdrop" role="dialog" aria-modal="true">
        <div class="modal-panel modal-panel--sm">
          <div class="modal-panel__header">
            <h2>Archivar Documento</h2>
            <button type="button" class="modal-panel__close" (click)="pendingDeactivate.set(null)">
              &times;
            </button>
          </div>
          <div class="modal-panel__body">
            <p class="confirm-text">
              ¿Deseas archivar el documento <strong>{{ target.title }}</strong>?
            </p>
          </div>
          <div class="modal-panel__footer">
            <button type="button" class="btn btn--outline" (click)="pendingDeactivate.set(null)">
              Cancelar
            </button>
            <button
              type="button"
              class="btn btn--danger"
              [disabled]="uploading()"
              (click)="executeDeactivate()"
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
export class DocumentsComponent implements OnInit {
  private readonly service = inject(DocumentsService);
  private readonly notifications = inject(NotificationService);

  readonly documents = signal<FoundationDocument[]>([]);
  readonly loading = signal(true);
  readonly uploading = signal(false);
  readonly errorMessage = signal('');

  readonly searchTerm = signal('');
  readonly moduleFilter = signal<'all' | DocumentModule>('all');
  readonly typeFilter = signal<'all' | DocumentType>('all');

  readonly showUploadModal = signal(false);
  readonly pendingDeactivate = signal<FoundationDocument | null>(null);

  selectedFile: File | null = null;
  form: DocumentUploadForm = this.createEmptyForm();

  readonly receiptsCount = computed(
    () => this.documents().filter((d) => d.docType === 'receipt').length,
  );
  readonly evidenceCount = computed(
    () => this.documents().filter((d) => d.docType === 'evidence').length,
  );
  readonly totalBytes = computed(() =>
    this.documents().reduce((sum, d) => sum + (Number(d.size) || 0), 0),
  );

  readonly filteredDocuments = computed(() => {
    const q = this.searchTerm().trim().toLowerCase();
    const mod = this.moduleFilter();
    const type = this.typeFilter();

    return this.documents().filter((doc) => {
      if (mod !== 'all' && doc.module !== mod) {
        return false;
      }
      if (type !== 'all' && doc.docType !== type) {
        return false;
      }
      if (!q) {
        return true;
      }
      return (
        doc.title.toLowerCase().includes(q) ||
        doc.fileName.toLowerCase().includes(q) ||
        doc.recordLabel.toLowerCase().includes(q)
      );
    });
  });

  ngOnInit(): void {
    void this.loadDocuments();
  }

  async loadDocuments(): Promise<void> {
    this.loading.set(true);
    this.errorMessage.set('');
    try {
      const items = await this.service.list();
      this.documents.set(items);
    } catch (error) {
      this.errorMessage.set(
        getFirebaseErrorMessage(error, 'No fue posible cargar los documentos.'),
      );
    } finally {
      this.loading.set(false);
    }
  }

  openUploadModal(): void {
    this.selectedFile = null;
    this.form = this.createEmptyForm();
    this.showUploadModal.set(true);
  }

  closeUploadModal(): void {
    this.showUploadModal.set(false);
    this.selectedFile = null;
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0] ?? null;
    if (!file) {
      this.selectedFile = null;
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      this.notifications.error('Archivo muy grande', 'El tamaño máximo permitido es de 10 MB.');
      input.value = '';
      this.selectedFile = null;
      return;
    }

    if (file.type && !ALLOWED_MIME_TYPES.has(file.type)) {
      this.notifications.error(
        'Formato no permitido',
        'Solo se permiten archivos PDF, imágenes (JPG/PNG/WEBP), Word o Excel.',
      );
      input.value = '';
      this.selectedFile = null;
      return;
    }

    this.selectedFile = file;
  }

  async uploadDocument(): Promise<void> {
    if (!this.selectedFile) {
      return;
    }

    this.uploading.set(true);
    try {
      const slug = this.form.recordLabel
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .slice(0, 32);

      await this.service.uploadFileAndCreate(this.selectedFile, {
        title: this.form.title.trim(),
        module: this.form.module,
        recordId: slug || 'general',
        recordLabel: this.form.recordLabel.trim(),
        docType: this.form.docType,
        description: this.form.description.trim(),
      });

      this.notifications.success('Documento subido', `Se almacenó "${this.form.title.trim()}".`);
      this.closeUploadModal();
      await this.loadDocuments();
    } catch (error) {
      this.notifications.error(
        'Error al subir archivo',
        getFirebaseErrorMessage(error, 'No fue posible subir el documento.'),
      );
    } finally {
      this.uploading.set(false);
    }
  }

  async executeDeactivate(): Promise<void> {
    const target = this.pendingDeactivate();
    if (!target?.id) {
      return;
    }
    this.uploading.set(true);
    try {
      await this.service.deactivate(target.id, target.title);
      this.pendingDeactivate.set(null);
      this.notifications.info('Documento archivado', `Se archivó "${target.title}".`);
      await this.loadDocuments();
    } catch (error) {
      this.notifications.error(
        'Error al archivar',
        getFirebaseErrorMessage(error, 'No fue posible archivar el documento.'),
      );
    } finally {
      this.uploading.set(false);
    }
  }

  formatModule(mod: DocumentModule): string {
    switch (mod) {
      case 'beneficiaries':
        return 'Beneficiarios';
      case 'donations':
        return 'Donaciones';
      case 'volunteers':
        return 'Voluntarios';
      case 'activities':
        return 'Actividades';
      case 'requests':
        return 'Solicitudes';
      case 'institutional':
        return 'Institucional';
    }
  }

  formatType(type: DocumentType): string {
    switch (type) {
      case 'identification':
        return 'Identificación';
      case 'receipt':
        return 'Comprobante';
      case 'report':
        return 'Informe';
      case 'evidence':
        return 'Evidencia';
      case 'certificate':
        return 'Certificado';
      case 'other':
        return 'Otro';
    }
  }

  formatSize(bytes: number): string {
    if (!bytes) {
      return '0 KB';
    }
    if (bytes < 1024 * 1024) {
      return `${Math.max(1, Math.round(bytes / 1024))} KB`;
    }
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  }

  formatDate(iso?: string): string {
    if (!iso) {
      return '—';
    }
    return new Date(iso).toLocaleDateString('es-EC');
  }

  private createEmptyForm(): DocumentUploadForm {
    return {
      title: '',
      module: 'institutional',
      recordId: '',
      recordLabel: '',
      docType: 'evidence',
      description: '',
    };
  }
}
