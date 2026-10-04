export interface FirebaseConfig {
  apiKey: string;
  authDomain: string;
  projectId: string;
  storageBucket: string;
  messagingSenderId: string;
  appId: string;
  measurementId?: string;
}

export interface EmulatorConfig {
  useEmulators: boolean;
  authHost: string;
  authPort: number;
  firestoreHost: string;
  firestorePort: number;
  storageHost: string;
  storagePort: number;
  functionsHost: string;
  functionsPort: number;
}

export interface EnvironmentConfig {
  production: boolean;
  appName: string;
  appVersion: string;
  firebase: FirebaseConfig;
  emulators: EmulatorConfig;
}
