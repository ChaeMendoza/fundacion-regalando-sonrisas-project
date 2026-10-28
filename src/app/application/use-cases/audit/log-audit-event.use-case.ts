import { AuditAction, AuditLog, AuditModule } from '../../../domain/entities/audit-log.entity';
import { AuditLogRepository } from '../../../domain/repositories/audit-log.repository';
import { AuthRepository } from '../../../domain/repositories/auth.repository';

/** Registra una acción relevante para trazabilidad. Un fallo de persistencia no interrumpe al llamador. */
export class LogAuditEventUseCase {
  constructor(
    private readonly auditLogs: AuditLogRepository,
    private readonly auth: AuthRepository,
  ) {}

  async execute(
    action: AuditAction,
    module: AuditModule,
    details: Record<string, unknown> = {},
    recordId?: string,
  ): Promise<void> {
    const user = this.auth.getCurrentUser();
    const entry: Omit<AuditLog, 'id'> = {
      userId: user?.uid ?? 'unauthenticated',
      userEmail: user?.email ?? 'anonymous',
      action,
      module,
      recordId,
      details,
      timestamp: new Date().toISOString(),
    };

    try {
      await this.auditLogs.add(entry);
    } catch (err) {
      console.warn('No se pudo persistir el evento de auditoría:', err);
    }
  }
}
