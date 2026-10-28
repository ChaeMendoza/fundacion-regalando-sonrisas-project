import { Injectable, inject } from '@angular/core';
import { AuditLog } from '../../domain/entities/audit-log.entity';
import { AuditLogRepository } from '../../domain/repositories/audit-log.repository';
import { FirestoreService } from '../firebase/firestore.service';

const COLLECTION = 'audit_logs';

@Injectable({ providedIn: 'root' })
export class FirestoreAuditLogRepository extends AuditLogRepository {
  private readonly firestore = inject(FirestoreService);

  async add(entry: Omit<AuditLog, 'id'>): Promise<void> {
    await this.firestore.createDocument<AuditLog>(COLLECTION, entry);
  }

  getAll(): Promise<AuditLog[]> {
    return this.firestore.getCollection<AuditLog>(COLLECTION);
  }
}
