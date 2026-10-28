import { AuditLog } from '../../../domain/entities/audit-log.entity';
import { AuditLogRepository } from '../../../domain/repositories/audit-log.repository';

export class GetRecentAuditLogsUseCase {
  constructor(private readonly auditLogs: AuditLogRepository) {}

  async execute(): Promise<AuditLog[]> {
    try {
      return await this.auditLogs.getAll();
    } catch (err) {
      console.warn('Error al consultar registros de auditoría:', err);
      return [];
    }
  }
}
