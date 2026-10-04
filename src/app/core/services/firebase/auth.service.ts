import { Injectable, computed, inject, signal } from '@angular/core';
import {
  User as FirebaseUser,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
} from 'firebase/auth';
import { FirebaseAppService } from './firebase-app.service';
import { AppUser, UserRole } from '../../models/user.model';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly firebaseAppService = inject(FirebaseAppService);

  // Signals para reactividad moderna en Angular
  readonly currentUser = signal<AppUser | null>({
    // Usuario por defecto en fase de desarrollo / bootstrap para permitir navegación
    uid: 'dev-demo-admin-id',
    email: 'admin.demo@regalandosonrisas.ec',
    displayName: 'Administrador Demo',
    role: 'admin',
    status: 'active',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  });

  readonly isAuthenticated = computed(() => this.currentUser() !== null);
  readonly userRole = computed<UserRole | null>(() => this.currentUser()?.role ?? null);
  readonly isAdmin = computed(() => this.currentUser()?.role === 'admin');

  constructor() {
    this.listenToAuthState();
  }

  private listenToAuthState(): void {
    try {
      const auth = this.firebaseAppService.auth;
      onAuthStateChanged(auth, (fbUser: FirebaseUser | null) => {
        if (fbUser) {
          // Si hay usuario real de Firebase autenticado, sincronizamos estado
          this.currentUser.set({
            uid: fbUser.uid,
            email: fbUser.email || '',
            displayName: fbUser.displayName || 'Usuario Fundación',
            role: 'admin', // NOTA: En la fase siguiente se resolverá desde la colección /users o custom claims
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

  async login(email: string, pass: string): Promise<void> {
    const auth = this.firebaseAppService.auth;
    await signInWithEmailAndPassword(auth, email, pass);
  }

  async logout(): Promise<void> {
    try {
      const auth = this.firebaseAppService.auth;
      await signOut(auth);
    } catch {
      // Ignorar en entorno simulado
    } finally {
      this.currentUser.set(null);
    }
  }

  // Método auxiliar para pruebas y conmutación de perfiles en desarrollo
  setDevUser(user: AppUser | null): void {
    this.currentUser.set(user);
  }
}
