/**
 * Modelo de Usuario del Sistema — Fundación Regalando Sonrisas
 *
 * Roles iniciales del sistema:
 * - 'admin': Administrador del sistema con acceso a gestión de usuarios y auditoría.
 * - 'user': Usuario regular autorizado para operar los módulos internos.
 *
 * Se mantienen 'volunteer' y 'authorized_staff' como tipos compatibles para
 * futuras ampliaciones granulares de permisos conforme se validen los demás módulos.
 */
export type UserRole = 'admin' | 'user' | 'volunteer' | 'authorized_staff';

export type UserStatus = 'pending' | 'approved' | 'rejected' | 'disabled';

export interface AppUser {
  uid: string;
  email: string;
  displayName: string;
  role: UserRole;
  status: UserStatus;
  createdAt: string;
  updatedAt: string;
  approvedAt?: string | null;
  approvedBy?: string | null;
  updatedBy?: string | null;
  rejectionReason?: string | null;
  photoUrl?: string;
  phoneNumber?: string;
  lastLoginAt?: string;
}

export interface UserStats {
  total: number;
  pending: number;
  approved: number;
  rejected: number;
  disabled: number;
}

export function isUserApproved(user: AppUser | null | undefined): boolean {
  return Boolean(user && user.status === 'approved' && Boolean(user.role));
}

export function isUserAdmin(user: AppUser | null | undefined): boolean {
  return Boolean(user && user.status === 'approved' && user.role === 'admin');
}

export function calculateUserStats(users: readonly AppUser[]): UserStats {
  const stats: UserStats = {
    total: users.length,
    pending: 0,
    approved: 0,
    rejected: 0,
    disabled: 0,
  };

  for (const user of users) {
    switch (user.status) {
      case 'pending':
        stats.pending++;
        break;
      case 'approved':
        stats.approved++;
        break;
      case 'rejected':
        stats.rejected++;
        break;
      case 'disabled':
        stats.disabled++;
        break;
    }
  }

  return stats;
}
