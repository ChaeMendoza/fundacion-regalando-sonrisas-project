import { AuditLog } from '../entities/audit-log.entity';

/** Contrato de persistencia de la bitácora de auditoría (registros inmutables). */
export abstract class AuditLogRepository {
  abstract add(entry: Omit<AuditLog, 'id'>): Promise<void>;
  abstract getAll(): Promise<AuditLog[]>;
}
