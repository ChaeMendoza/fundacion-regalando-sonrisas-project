import { Injectable, inject } from '@angular/core';
import {
  User as FirebaseUser,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
} from 'firebase/auth';
import { AppUser } from '../../domain/entities/user.entity';
import {
  AuthRepository,
  AuthStateListener,
  Unsubscribe,
} from '../../domain/repositories/auth.repository';
import { FirebaseAppService } from '../firebase/firebase-app.service';

@Injectable({ providedIn: 'root' })
export class FirebaseAuthRepository extends AuthRepository {
  private readonly firebaseAppService = inject(FirebaseAppService);
  private readonly listeners = new Set<AuthStateListener>();

  // Usuario por defecto del prototipo para permitir navegación (se mantiene hasta definir el flujo real)
  private currentUser: AppUser | null = {
    uid: 'dev-demo-admin-id',
    email: 'admin.demo@regalandosonrisas.ec',
    displayName: 'Administrador Demo',
    role: 'admin',
    status: 'active',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  constructor() {
    super();
    this.listenToFirebaseAuthState();
  }

  getCurrentUser(): AppUser | null {
    return this.currentUser;
  }

  observeAuthState(listener: AuthStateListener): Unsubscribe {
    this.listeners.add(listener);
    listener(this.currentUser);
    return () => this.listeners.delete(listener);
  }

  async login(email: string, password: string): Promise<void> {
    await signInWithEmailAndPassword(this.firebaseAppService.auth, email, password);
  }

  async logout(): Promise<void> {
    try {
      await signOut(this.firebaseAppService.auth);
    } catch {
      // Ignorar en entorno simulado
    } finally {
      this.setUser(null);
    }
  }

  private setUser(user: AppUser | null): void {
    this.currentUser = user;
    this.listeners.forEach((listener) => listener(user));
  }

  private listenToFirebaseAuthState(): void {
    try {
      onAuthStateChanged(this.firebaseAppService.auth, (fbUser: FirebaseUser | null) => {
        if (fbUser) {
          this.setUser({
            uid: fbUser.uid,
            email: fbUser.email || '',
            displayName: fbUser.displayName || 'Usuario Fundación',
            role: 'admin', // PENDIENTE: resolver rol desde la colección /users o custom claims
            status: 'active',
            photoUrl: fbUser.photoURL || undefined,
            phoneNumber: fbUser.phoneNumber || undefined,
            createdAt: fbUser.metadata.creationTime || new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          });
        }
      });
    } catch (err) {
      console.warn('Escucha de estado de Firebase Auth no disponible en este entorno:', err);
    }
  }
}
