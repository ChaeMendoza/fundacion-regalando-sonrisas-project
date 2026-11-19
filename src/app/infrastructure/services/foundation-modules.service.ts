import { Injectable, inject } from '@angular/core';
import { LogAuditEventUseCase } from '../../application/use-cases/audit/log-audit-event.use-case';
import { Activity } from '../../domain/entities/activity.entity';
import { AuditModule } from '../../domain/entities/audit-log.entity';
import { Beneficiary } from '../../domain/entities/beneficiary.entity';
import { FoundationDocument } from '../../domain/entities/document.entity';
import { Donation, Donor } from '../../domain/entities/donation.entity';
import { SupportRequest } from '../../domain/entities/request.entity';
import { Volunteer } from '../../domain/entities/volunteer.entity';
import { AuthRepository } from '../../domain/repositories/auth.repository';
import { BaseEntity, FirestoreService } from '../firebase/firestore.service';
import { StorageService, StorageUploadResult } from '../firebase/storage.service';

export type NewEntityPayload<T extends BaseEntity> = Omit<
  T,
  'id' | 'createdAt' | 'updatedAt' | 'createdBy' | 'updatedBy' | 'isActive'
>;

export abstract class BaseCrudFirestoreService<T extends BaseEntity> {
  protected readonly firestore = inject(FirestoreService);
  protected readonly audit = inject(LogAuditEventUseCase);

  constructor(
    protected readonly collectionName: string,
    protected readonly auditModule: AuditModule,
  ) {}

  async list(includeInactive = false): Promise<T[]> {
    const items = await this.firestore.getCollection<T>(this.collectionName);
    const filtered = includeInactive ? items : items.filter((item) => item.isActive !== false);
    return filtered.sort((a, b) => (b.createdAt ?? '').localeCompare(a.createdAt ?? ''));
  }

  async getById(id: string): Promise<T | null> {
    return this.firestore.getDocument<T>(this.collectionName, id);
  }

  async create(data: NewEntityPayload<T>, summaryLabel?: string): Promise<string> {
    const id = await this.firestore.createDocument<T>(this.collectionName, data);
    await this.audit.execute(
      'create',
      this.auditModule,
      {
        collection: this.collectionName,
        label: summaryLabel ?? id,
      },
      id,
    );
    return id;
  }

  async update(id: string, data: Partial<T>, summaryLabel?: string): Promise<void> {
    await this.firestore.updateDocument<T>(this.collectionName, id, data);
    await this.audit.execute(
      'update',
      this.auditModule,
      {
        collection: this.collectionName,
        label: summaryLabel ?? id,
      },
      id,
    );
  }

  async deactivate(id: string, summaryLabel?: string): Promise<void> {
    await this.firestore.deactivateDocument(this.collectionName, id);
    await this.audit.execute(
      'deactivate',
      this.auditModule,
      {
        collection: this.collectionName,
        label: summaryLabel ?? id,
      },
      id,
    );
  }

  async reactivate(id: string, summaryLabel?: string): Promise<void> {
    await this.firestore.updateDocument<T>(this.collectionName, id, {
      isActive: true,
    } as Partial<T>);
    await this.audit.execute(
      'update',
      this.auditModule,
      {
        collection: this.collectionName,
        action: 'reactivate',
        label: summaryLabel ?? id,
      },
      id,
    );
  }
}

@Injectable({ providedIn: 'root' })
export class BeneficiariesService extends BaseCrudFirestoreService<Beneficiary> {
  constructor() {
    super('beneficiaries', 'beneficiaries');
  }
}

@Injectable({ providedIn: 'root' })
export class DonationsService extends BaseCrudFirestoreService<Donation> {
  constructor() {
    super('donations', 'donations');
  }
}

@Injectable({ providedIn: 'root' })
export class DonorsService extends BaseCrudFirestoreService<Donor> {
  constructor() {
    super('donors', 'donations');
  }
}

@Injectable({ providedIn: 'root' })
export class VolunteersService extends BaseCrudFirestoreService<Volunteer> {
  constructor() {
    super('volunteers', 'volunteers');
  }
}

@Injectable({ providedIn: 'root' })
export class ActivitiesService extends BaseCrudFirestoreService<Activity> {
  constructor() {
    super('activities', 'activities');
  }
}

@Injectable({ providedIn: 'root' })
export class RequestsService extends BaseCrudFirestoreService<SupportRequest> {
  constructor() {
    super('requests', 'requests');
  }
}

@Injectable({ providedIn: 'root' })
export class DocumentsService extends BaseCrudFirestoreService<FoundationDocument> {
  private readonly storage = inject(StorageService);
  private readonly auth = inject(AuthRepository);

  constructor() {
    super('documents', 'documents');
  }

  async uploadFileAndCreate(
    file: File,
    meta: Omit<
      NewEntityPayload<FoundationDocument>,
      'fileName' | 'mimeType' | 'size' | 'storagePath' | 'downloadUrl' | 'uploadedBy' | 'uploadedByName'
    >,
  ): Promise<string> {
    const currentUser = this.auth.getCurrentUser();
    if (!currentUser) {
      throw new Error('Debes iniciar sesión para subir documentos.');
    }

    const recordFolder = meta.recordId.trim() || 'general';
    const upload: StorageUploadResult = await this.storage.uploadFile(meta.module, recordFolder, file);

    return this.create(
      {
        ...meta,
        recordId: recordFolder,
        fileName: upload.name,
        mimeType: file.type || 'application/octet-stream',
        size: upload.size,
        storagePath: upload.path,
        downloadUrl: upload.downloadUrl,
        uploadedBy: currentUser.uid,
        uploadedByName: currentUser.displayName,
      },
      meta.title,
    );
  }
}
