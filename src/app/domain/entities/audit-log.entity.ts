/**
 * Modelo de Registro de Auditoría
 *
 * Cada operación relevante debe quedar registrada para garantizar trazabilidad.
 * Los registros son estrictamente inmutables (no se permite update ni delete).
 */
export type AuditAction =
  | 'create'
  | 'update'
  | 'delete'
  | 'deactivate'
  | 'login'
  | 'logout'
  | 'export'
  | 'view_sensitive';

export type AuditModule =
  | 'auth'
  | 'beneficiaries'
  | 'donations'
  | 'volunteers'
  | 'activities'
  | 'documents'
  | 'reports'
  | 'admin';

export interface AuditLog {
  id?: string;
  userId: string;
  userEmail: string;
  action: AuditAction;
  module: AuditModule;
  recordId?: string;
  details: Record<string, unknown>;
  timestamp: string;
  ipAddress?: string;
}
