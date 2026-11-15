import { AppUser, UserRole, UserStatus } from '../entities/user.entity';

export type UnsubscribeUserProfile = () => void;

export interface UpdateUserAccessInput {
  uid: string;
  status: UserStatus;
  role: UserRole;
  updatedAt: string;
  updatedBy: string;
  approvedAt?: string | null;
  approvedBy?: string | null;
  rejectionReason?: string | null;
}

/** Contrato de lectura, creación inicial y administración de perfiles de usuario. */
export abstract class UserProfileRepository {
  abstract findById(uid: string): Promise<AppUser | null>;
  abstract observeById(
    uid: string,
    listener: (profile: AppUser | null) => void,
    onError?: (error: Error) => void,
  ): UnsubscribeUserProfile;
  abstract createPendingProfile(profile: AppUser): Promise<void>;
  abstract findAll(): Promise<AppUser[]>;
  abstract updateAccess(input: UpdateUserAccessInput): Promise<AppUser>;
}
