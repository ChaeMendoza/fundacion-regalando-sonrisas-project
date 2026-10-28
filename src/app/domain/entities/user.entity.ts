/**
 * Modelo de Usuario del Sistema
 *
 * NOTA DE ARQUITECTURA / PENDIENTE DE VALIDACIÓN:
 * Los roles preliminarmente identificados son:
 * - 'admin': Administrador con acceso global
 * - 'volunteer': Voluntario con permisos de consulta/registro limitado
 * - 'authorized_staff': Personal autorizado
 *
 * REGLA DE NEGOCIO: La definición exacta de roles, permisos granulares y si
 * 'Personal autorizado' constituye un rol diferenciado o un conjunto de permisos
 * está pendiente de validación formal con la Fundación Regalando Sonrisas.
 */
export type UserRole = 'admin' | 'volunteer' | 'authorized_staff';

export type UserStatus = 'active' | 'inactive' | 'pending';

export interface AppUser {
  uid: string;
  email: string;
  displayName: string;
  role: UserRole;
  status: UserStatus;
  photoUrl?: string;
  phoneNumber?: string;
  createdAt: string;
  updatedAt: string;
  lastLoginAt?: string;
}
