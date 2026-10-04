import { Injectable } from '@angular/core';
import { FirebaseApp, getApp, getApps, initializeApp } from 'firebase/app';
import { Auth, connectAuthEmulator, getAuth } from 'firebase/auth';
import { Firestore, connectFirestoreEmulator, getFirestore } from 'firebase/firestore';
import { FirebaseStorage, connectStorageEmulator, getStorage } from 'firebase/storage';
import { Functions, connectFunctionsEmulator, getFunctions } from 'firebase/functions';
import { environment } from '../../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class FirebaseAppService {
  private readonly app: FirebaseApp;
  private readonly authInstance: Auth;
  private readonly firestoreInstance: Firestore;
  private readonly storageInstance: FirebaseStorage;
  private readonly functionsInstance: Functions;
  private emulatorsConnected = false;

  constructor() {
    // Inicializar Firebase App de manera segura sin duplicar instancias
    if (getApps().length === 0) {
      this.app = initializeApp(environment.firebase);
    } else {
      this.app = getApp();
    }

    this.authInstance = getAuth(this.app);
    this.firestoreInstance = getFirestore(this.app);
    this.storageInstance = getStorage(this.app);
    this.functionsInstance = getFunctions(this.app);

    // Conectar emuladores si la configuración de entorno lo indica
    this.initEmulatorsIfEnabled();
  }

  get firebaseApp(): FirebaseApp {
    return this.app;
  }

  get auth(): Auth {
    return this.authInstance;
  }

  get firestore(): Firestore {
    return this.firestoreInstance;
  }

  get storage(): FirebaseStorage {
    return this.storageInstance;
  }

  get functions(): Functions {
    return this.functionsInstance;
  }

  private initEmulatorsIfEnabled(): void {
    if (environment.emulators.useEmulators && !this.emulatorsConnected) {
      try {
        connectAuthEmulator(
          this.authInstance,
          `${environment.emulators.authHost}:${environment.emulators.authPort}`,
          { disableWarnings: true }
        );
        connectFirestoreEmulator(
          this.firestoreInstance,
          environment.emulators.firestoreHost,
          environment.emulators.firestorePort
        );
        connectStorageEmulator(
          this.storageInstance,
          environment.emulators.storageHost,
          environment.emulators.storagePort
        );
        connectFunctionsEmulator(
          this.functionsInstance,
          environment.emulators.functionsHost,
          environment.emulators.functionsPort
        );
        this.emulatorsConnected = true;
      } catch (err) {
        // En tests o re-renderizados los emuladores pueden estar ya vinculados
        console.warn('Configuración de emuladores Firebase omitida o ya conectada:', err);
      }
    }
  }
}
