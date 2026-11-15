import { AppUser, UserRole, isUserAdmin } from '../../../domain/entities/user.entity';
import { AuditLogRepository } from '../../../domain/repositories/audit-log.repository';
import { AuthRepository } from '../../../domain/repositories/auth.repository';
import { UserProfileRepository } from '../../../domain/repositories/user-profile.repository';

export class ManageUserAccessUseCase {
  constructor(
    private readonly userProfiles: UserProfileRepository,
    private readonly auth: AuthRepository,
    private readonly auditLogs: AuditLogRepository,
  ) {}

  async approveUser(targetUid: string, role?: UserRole): Promise<AppUser> {
    const admin = this.requireAdmin();
    const target = await this.requireTargetUser(targetUid);
    const now = new Date().toISOString();
    const assignedRole: UserRole = role ?? target.role ?? 'user';

    const updated = await this.userProfiles.updateAccess({
      uid: target.uid,
      status: 'approved',
      role: assignedRole,
      approvedAt: now,
      approvedBy: admin.email || admin.uid,
      updatedAt: now,
      updatedBy: admin.uid,
      rejectionReason: null,
    });

    await this.recordAudit(admin, 'update', target.uid, {
      operation: 'approve_user',
      targetEmail: target.email,
      previousStatus: target.status,
      newStatus: 'approved',
      role: assignedRole,
    });

    return updated;
  }

  async rejectUser(targetUid: string, reason?: string): Promise<AppUser> {
    const admin = this.requireAdmin();
    if (admin.uid === targetUid) {
      throw new Error('Un administrador no puede rechazar su propia cuenta.');
    }

    const target = await this.requireTargetUser(targetUid);
    const now = new Date().toISOString();
    const cleanReason = reason?.trim() || null;

    const updated = await this.userProfiles.updateAccess({
      uid: target.uid,
      status: 'rejected',
      role: target.role || 'user',
      approvedAt: null,
      approvedBy: null,
      updatedAt: now,
      updatedBy: admin.uid,
      rejectionReason: cleanReason,
    });

    await this.recordAudit(admin, 'deactivate', target.uid, {
      operation: 'reject_user',
      targetEmail: target.email,
      previousStatus: target.status,
      newStatus: 'rejected',
      reason: cleanReason,
    });

    return updated;
  }

  async disableUser(targetUid: string, reason?: string): Promise<AppUser> {
    const admin = this.requireAdmin();
    if (admin.uid === targetUid) {
      throw new Error('Un administrador no puede deshabilitar su propia cuenta activa.');
    }

    const target = await this.requireTargetUser(targetUid);
    const now = new Date().toISOString();
    const cleanReason = reason?.trim() || null;

    const updated = await this.userProfiles.updateAccess({
      uid: target.uid,
      status: 'disabled',
      role: target.role || 'user',
      approvedAt: target.approvedAt ?? null,
      approvedBy: target.approvedBy ?? null,
      updatedAt: now,
      updatedBy: admin.uid,
      rejectionReason: cleanReason,
    });

    await this.recordAudit(admin, 'deactivate', target.uid, {
      operation: 'disable_user',
      targetEmail: target.email,
      previousStatus: target.status,
      newStatus: 'disabled',
      reason: cleanReason,
    });

    return updated;
  }

  async reactivateUser(targetUid: string): Promise<AppUser> {
    const admin = this.requireAdmin();
    const target = await this.requireTargetUser(targetUid);
    const now = new Date().toISOString();

    const updated = await this.userProfiles.updateAccess({
      uid: target.uid,
      status: 'approved',
      role: target.role || 'user',
      approvedAt: target.approvedAt || now,
      approvedBy: target.approvedBy || admin.email || admin.uid,
      updatedAt: now,
      updatedBy: admin.uid,
      rejectionReason: null,
    });

    await this.recordAudit(admin, 'update', target.uid, {
      operation: 'reactivate_user',
      targetEmail: target.email,
      previousStatus: target.status,
      newStatus: 'approved',
      role: updated.role,
    });

    return updated;
  }

  async changeUserRole(targetUid: string, newRole: UserRole): Promise<AppUser> {
    const admin = this.requireAdmin();
    if (admin.uid === targetUid && newRole !== 'admin') {
      throw new Error('Un administrador no puede revocar su propio rol administrativo.');
    }

    const target = await this.requireTargetUser(targetUid);
    const now = new Date().toISOString();

    const updated = await this.userProfiles.updateAccess({
      uid: target.uid,
      status: target.status,
      role: newRole,
      approvedAt: target.approvedAt ?? null,
      approvedBy: target.approvedBy ?? null,
      updatedAt: now,
      updatedBy: admin.uid,
      rejectionReason: target.rejectionReason ?? null,
    });

    await this.recordAudit(admin, 'update', target.uid, {
      operation: 'change_user_role',
      targetEmail: target.email,
      previousRole: target.role,
      newRole,
    });

    return updated;
  }

  private requireAdmin(): AppUser {
    const currentUser = this.auth.getCurrentUser();
    if (!currentUser || !isUserAdmin(currentUser)) {
      throw new Error('Operación no autorizada: Se requiere una cuenta de administrador aprobada.');
    }
    return currentUser;
  }

  private async requireTargetUser(uid: string): Promise<AppUser> {
    if (!uid.trim()) {
      throw new Error('El identificador del usuario es obligatorio.');
    }
    const target = await this.userProfiles.findById(uid);
    if (!target) {
      throw new Error('No se encontró el perfil del usuario solicitado.');
    }
    return target;
  }

  private async recordAudit(
    admin: AppUser,
    action: 'update' | 'deactivate',
    recordId: string,
    details: Record<string, unknown>,
  ): Promise<void> {
    try {
      await this.auditLogs.add({
        userId: admin.uid,
        userEmail: admin.email,
        action,
        module: 'admin',
        recordId,
        details,
        timestamp: new Date().toISOString(),
      });
    } catch (err) {
      // No bloquear la operación principal si el registro secundario de auditoría falla en cliente
      console.warn('Advertencia: No se pudo registrar el evento en audit_logs:', err);
    }
  }
}
