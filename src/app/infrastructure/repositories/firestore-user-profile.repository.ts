import { Injectable, inject } from '@angular/core';
import {
  collection,
  doc,
  getDoc,
  getDocs,
  onSnapshot,
  setDoc,
  updateDoc,
} from 'firebase/firestore';
import { AppUser, UserRole, UserStatus } from '../../domain/entities/user.entity';
import {
  UnsubscribeUserProfile,
  UpdateOwnProfileInput,
  UpdateUserAccessInput,
  UserProfileRepository,
} from '../../domain/repositories/user-profile.repository';
import { FirebaseAppService } from '../firebase/firebase-app.service';

const USER_ROLES: readonly UserRole[] = ['admin', 'user', 'volunteer', 'authorized_staff'];
const USER_STATUSES: readonly UserStatus[] = ['pending', 'approved', 'rejected', 'disabled'];

@Injectable({ providedIn: 'root' })
export class FirestoreUserProfileRepository extends UserProfileRepository {
  private readonly firebaseAppService = inject(FirebaseAppService);

  async findById(uid: string): Promise<AppUser | null> {
    const snapshot = await getDoc(doc(this.firebaseAppService.firestore, 'users', uid));
    if (!snapshot.exists()) {
      return null;
    }

    const parsed = this.parseProfile(snapshot.id, snapshot.data());
    if (!parsed) {
      throw new Error(`El perfil de usuario ${uid} no tiene un formato válido.`);
    }

    return parsed;
  }

  observeById(
    uid: string,
    listener: (profile: AppUser | null) => void,
    onError?: (error: Error) => void,
  ): UnsubscribeUserProfile {
    const ref = doc(this.firebaseAppService.firestore, 'users', uid);
    return onSnapshot(
      ref,
      (snapshot) => {
        if (!snapshot.exists()) {
          listener(null);
          return;
        }
        const parsed = this.parseProfile(snapshot.id, snapshot.data());
        listener(parsed);
      },
      (err) => {
        if (onError) {
          onError(err);
        }
      },
    );
  }

  async createPendingProfile(profile: AppUser): Promise<void> {
    const payload: Record<string, unknown> = {
      uid: profile.uid,
      email: profile.email,
      displayName: profile.displayName,
      role: 'user',
      status: 'pending',
      createdAt: profile.createdAt,
      updatedAt: profile.updatedAt,
      approvedAt: null,
      approvedBy: null,
      updatedBy: profile.uid,
      rejectionReason: null,
    };

    if (profile.photoUrl) {
      payload['photoUrl'] = profile.photoUrl;
    }
    if (profile.phoneNumber) {
      payload['phoneNumber'] = profile.phoneNumber;
    }

    await setDoc(doc(this.firebaseAppService.firestore, 'users', profile.uid), payload);
  }

  async findAll(): Promise<AppUser[]> {
    const snapshot = await getDocs(collection(this.firebaseAppService.firestore, 'users'));
    const users: AppUser[] = [];

    for (const docSnap of snapshot.docs) {
      const parsed = this.parseProfile(docSnap.id, docSnap.data());
      if (parsed) {
        users.push(parsed);
      }
    }

    return users;
  }

  async updateAccess(input: UpdateUserAccessInput): Promise<AppUser> {
    const ref = doc(this.firebaseAppService.firestore, 'users', input.uid);
    const payload: Record<string, unknown> = {
      status: input.status,
      role: input.role,
      updatedAt: input.updatedAt,
      updatedBy: input.updatedBy,
      approvedAt: input.approvedAt ?? null,
      approvedBy: input.approvedBy ?? null,
      rejectionReason: input.rejectionReason ?? null,
    };

    await updateDoc(ref, payload);

    const updated = await this.findById(input.uid);
    if (!updated) {
      throw new Error(`No fue posible recuperar el perfil actualizado del usuario ${input.uid}.`);
    }

    return updated;
  }

  async updateOwnProfile(input: UpdateOwnProfileInput): Promise<AppUser> {
    const ref = doc(this.firebaseAppService.firestore, 'users', input.uid);
    const payload: Record<string, unknown> = {
      displayName: input.displayName,
      phoneNumber: input.phoneNumber ?? '',
      updatedAt: input.updatedAt,
      updatedBy: input.uid,
    };

    await updateDoc(ref, payload);

    const updated = await this.findById(input.uid);
    if (!updated) {
      throw new Error(`No fue posible recuperar el perfil actualizado del usuario ${input.uid}.`);
    }

    return updated;
  }

  private parseProfile(docId: string, raw: unknown): AppUser | null {
    if (typeof raw !== 'object' || raw === null) {
      return null;
    }

    const record = raw as Record<string, unknown>;
    const uid = typeof record['uid'] === 'string' && record['uid'] ? record['uid'] : docId;
    const email = typeof record['email'] === 'string' ? record['email'] : '';
    const displayName =
      typeof record['displayName'] === 'string' && record['displayName']
        ? record['displayName']
        : 'Usuario Fundación';

    const role = this.normalizeRole(record['role']);
    const status = this.normalizeStatus(record['status']);

    if (!role || !status || !uid || typeof record['email'] !== 'string') {
      return null;
    }

    const now = new Date().toISOString();
    const createdAt =
      typeof record['createdAt'] === 'string' && record['createdAt'] ? record['createdAt'] : now;
    const updatedAt =
      typeof record['updatedAt'] === 'string' && record['updatedAt']
        ? record['updatedAt']
        : createdAt;

    return {
      uid,
      email,
      displayName,
      role,
      status,
      createdAt,
      updatedAt,
      approvedAt: typeof record['approvedAt'] === 'string' ? record['approvedAt'] : null,
      approvedBy: typeof record['approvedBy'] === 'string' ? record['approvedBy'] : null,
      updatedBy: typeof record['updatedBy'] === 'string' ? record['updatedBy'] : null,
      rejectionReason:
        typeof record['rejectionReason'] === 'string' ? record['rejectionReason'] : null,
      photoUrl: typeof record['photoUrl'] === 'string' ? record['photoUrl'] : undefined,
      phoneNumber: typeof record['phoneNumber'] === 'string' ? record['phoneNumber'] : undefined,
      lastLoginAt: typeof record['lastLoginAt'] === 'string' ? record['lastLoginAt'] : undefined,
    };
  }

  private normalizeRole(value: unknown): UserRole | null {
    if (value === null || value === undefined || value === '') {
      return 'user';
    }
    if (typeof value === 'string' && USER_ROLES.some((r) => r === value)) {
      return value as UserRole;
    }
    return null;
  }

  private normalizeStatus(value: unknown): UserStatus | null {
    if (value === 'active') {
      return 'approved';
    }
    if (value === 'inactive') {
      return 'disabled';
    }
    if (typeof value === 'string' && USER_STATUSES.some((s) => s === value)) {
      return value as UserStatus;
    }
    return null;
  }
}
