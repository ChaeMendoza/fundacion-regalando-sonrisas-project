import { Injectable, inject } from '@angular/core';
import {
  User as FirebaseUser,
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
} from 'firebase/auth';
import { AppUser } from '../../domain/entities/user.entity';
import {
  AuthRepository,
  AuthStateListener,
  Unsubscribe,
} from '../../domain/repositories/auth.repository';
import { UserProfileRepository } from '../../domain/repositories/user-profile.repository';
import { FirebaseAppService } from '../firebase/firebase-app.service';

@Injectable({ providedIn: 'root' })
export class FirebaseAuthRepository extends AuthRepository {
  private readonly firebaseAppService = inject(FirebaseAppService);
  private readonly userProfiles = inject(UserProfileRepository);
  private readonly listeners = new Set<AuthStateListener>();
  private currentUser: AppUser | null = null;
  private authStateVersion = 0;
  private initialStateResolved = false;
  private resolveInitialState!: (user: AppUser | null) => void;
  private readonly initialState = new Promise<AppUser | null>((resolve) => {
    this.resolveInitialState = resolve;
  });

  constructor() {
    super();
    this.listenToFirebaseAuthState();
  }

  getCurrentUser(): AppUser | null {
    return this.currentUser;
  }

  waitForInitialState(): Promise<AppUser | null> {
    return this.initialState;
  }

  observeAuthState(listener: AuthStateListener): Unsubscribe {
    this.listeners.add(listener);
    if (this.initialStateResolved) {
      listener(this.currentUser);
    }
    return () => this.listeners.delete(listener);
  }

  async login(email: string, password: string): Promise<void> {
    const credential = await signInWithEmailAndPassword(
      this.firebaseAppService.auth,
      email,
      password,
    );
    const version = ++this.authStateVersion;
    const user = await this.resolveFirebaseUser(credential.user, version);
    if (this.firebaseAppService.auth.currentUser?.uid === user.uid) {
      this.setUser(user);
    }
  }

  async register(displayName: string, email: string, password: string): Promise<void> {
    const credential = await createUserWithEmailAndPassword(
      this.firebaseAppService.auth,
      email,
      password,
    );
    await updateProfile(credential.user, { displayName });
    const profile = this.toAppUser(credential.user);
    const savedProfile = await this.createProfileIfMissing(profile);
    this.setUser(savedProfile);
  }

  async logout(): Promise<void> {
    await signOut(this.firebaseAppService.auth);
  }

  private setUser(user: AppUser | null): void {
    this.currentUser = user;
    if (!this.initialStateResolved) {
      this.initialStateResolved = true;
      this.resolveInitialState(user);
    }
    this.listeners.forEach((listener) => listener(user));
  }

  private listenToFirebaseAuthState(): void {
    try {
      onAuthStateChanged(
        this.firebaseAppService.auth,
        (fbUser: FirebaseUser | null) => {
          const version = ++this.authStateVersion;
          if (fbUser) {
            void this.resolveFirebaseUser(fbUser, version);
          } else {
            this.setUser(null);
          }
        },
        (err: Error) => {
          console.error('No se pudo observar el estado de autenticación de Firebase:', err);
          this.setUser(null);
        },
      );
    } catch (err) {
      console.error('No se pudo iniciar la observación de Firebase Authentication:', err);
      this.setUser(null);
    }
  }

  private async resolveFirebaseUser(user: FirebaseUser, version: number): Promise<AppUser> {
    try {
      let profile = await this.userProfiles.findById(user.uid);
      if (!profile) {
        profile = await this.createProfileIfMissing(this.toAppUser(user));
      }

      const sessionUser: AppUser = {
        ...profile,
        email: user.email || profile.email,
        displayName: user.displayName || profile.displayName,
        photoUrl: user.photoURL || profile.photoUrl,
        phoneNumber: user.phoneNumber || profile.phoneNumber,
      };
      if (version === this.authStateVersion) {
        this.setUser(sessionUser);
      }
      return sessionUser;
    } catch (err) {
      console.error('No se pudo recuperar el perfil de acceso del usuario:', err);
      const pendingUser = this.toAppUser(user);
      if (version === this.authStateVersion) {
        this.setUser(pendingUser);
      }
      return pendingUser;
    }
  }

  private async createProfileIfMissing(profile: AppUser): Promise<AppUser> {
    try {
      await this.userProfiles.createPendingProfile(profile);
      return profile;
    } catch (err) {
      const existingProfile = await this.userProfiles.findById(profile.uid);
      if (existingProfile) {
        return existingProfile;
      }
      throw err;
    }
  }

  private toAppUser(user: FirebaseUser): AppUser {
    return {
      uid: user.uid,
      email: user.email || '',
      displayName: user.displayName || 'Usuario Fundación',
      role: null,
      status: 'pending',
      photoUrl: user.photoURL || undefined,
      phoneNumber: user.phoneNumber || undefined,
      createdAt: user.metadata.creationTime || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
  }
}
