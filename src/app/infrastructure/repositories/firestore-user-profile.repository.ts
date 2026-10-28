import { Injectable, inject } from '@angular/core';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { AppUser, UserRole, UserStatus } from '../../domain/entities/user.entity';
import { UserProfileRepository } from '../../domain/repositories/user-profile.repository';
import { FirebaseAppService } from '../firebase/firebase-app.service';

const USER_ROLES: readonly UserRole[] = ['admin', 'volunteer', 'authorized_staff'];
const USER_STATUSES: readonly UserStatus[] = ['active', 'inactive', 'pending'];

@Injectable({ providedIn: 'root' })
export class FirestoreUserProfileRepository extends UserProfileRepository {
  private readonly firebaseAppService = inject(FirebaseAppService);

  async findById(uid: string): Promise<AppUser | null> {
    const snapshot = await getDoc(doc(this.firebaseAppService.firestore, 'users', uid));
    if (!snapshot.exists()) {
      return null;
    }

    const profile: unknown = snapshot.data();
    if (!this.isAppUser(profile) || profile.uid !== uid) {
      throw new Error(`El perfil de usuario ${uid} no tiene un formato válido.`);
    }

    return profile;
  }

  async createPendingProfile(profile: AppUser): Promise<void> {
    const pendingProfile: AppUser = {
      ...profile,
      role: null,
      status: 'pending',
    };
    await setDoc(doc(this.firebaseAppService.firestore, 'users', profile.uid), pendingProfile);
  }

  private isAppUser(value: unknown): value is AppUser {
    if (typeof value !== 'object' || value === null) {
      return false;
    }

    const profile = value as Record<string, unknown>;
    const validRole =
      profile['role'] === null || USER_ROLES.some((role) => role === profile['role']);
    const validStatus = USER_STATUSES.some((status) => status === profile['status']);

    return (
      typeof profile['uid'] === 'string' &&
      typeof profile['email'] === 'string' &&
      typeof profile['displayName'] === 'string' &&
      validRole &&
      validStatus &&
      typeof profile['createdAt'] === 'string' &&
      typeof profile['updatedAt'] === 'string'
    );
  }
}
