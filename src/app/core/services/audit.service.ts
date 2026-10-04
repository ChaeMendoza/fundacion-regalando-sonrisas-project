import { Injectable, inject } from '@angular/core';
import { FirestoreService } from './firebase/firestore.service';
import { AuthService } from './firebase/auth.service';
import { AuditAction, AuditLog, AuditModule } from '../models/audit.model';

@Injectable({
  providedIn: 'root',
})
export class AuditService {
  private readonly firestore = inject(FirestoreService);
  private readonly auth = inject(AuthService);

  /**
   * Registra una acción relevante en el sistema para trazabilidad y auditoría.
   */
  async logEvent(
    action: AuditAction,
    module: AuditModule,
    details: Record<string, unknown> = {},
    recordId?: string
  ): Promise<void> {
    const user = this.auth.currentUser();
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
      await this.firestore.createDocument<AuditLog>('audit_logs', entry);
    } catch (err) {
      console.warn('No se pudo persistir el evento de auditoría en Firestore:', err);
    }
  }

  /**
   * Consulta el historial de auditoría del sistema (restringido a administradores).
   */
  async getRecentLogs(): Promise<AuditLog[]> {
    try {
      return await this.firestore.getCollection<AuditLog>('audit_logs');
    } catch (err) {
      console.warn('Error al consultar registros de auditoría:', err);
      return [];
    }
  }
}
