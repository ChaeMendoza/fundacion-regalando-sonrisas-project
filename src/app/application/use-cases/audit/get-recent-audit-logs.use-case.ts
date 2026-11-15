import { AuditLog } from '../../../domain/entities/audit-log.entity';
import { AuditLogRepository } from '../../../domain/repositories/audit-log.repository';

export class GetRecentAuditLogsUseCase {
  constructor(private readonly auditLogs: AuditLogRepository) {}

  async execute(limit = 20): Promise<AuditLog[]> {
    try {
      const logs = await this.auditLogs.getAll();
      return [...logs]
        .sort((a, b) => (b.timestamp || '').localeCompare(a.timestamp || ''))
        .slice(0, limit);
    } catch (err) {
      console.warn('Error al consultar registros de auditoría:', err);
      return [];
    }
  }
}
