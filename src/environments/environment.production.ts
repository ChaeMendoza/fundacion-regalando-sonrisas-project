import { EnvironmentConfig } from './environment.model';

export const environment: EnvironmentConfig = {
  production: true,
  appName: 'Sistema de Gestión Integral - Fundación Regalando Sonrisas',
  appVersion: '0.1.0',
  firebase: {
    // Estas variables deben reemplazarse mediante el proceso de CI/CD seguro de GitHub Actions o secrets de despliegue
    apiKey: 'FIREBASE_API_KEY_PROD',
    authDomain: 'FIREBASE_AUTH_DOMAIN_PROD',
    projectId: 'FIREBASE_PROJECT_ID_PROD',
    storageBucket: 'FIREBASE_STORAGE_BUCKET_PROD',
    messagingSenderId: 'FIREBASE_MESSAGING_SENDER_ID_PROD',
    appId: 'FIREBASE_APP_ID_PROD',
  },
  emulators: {
    useEmulators: false,
    authHost: '',
    authPort: 0,
    firestoreHost: '',
    firestorePort: 0,
    storageHost: '',
    storagePort: 0,
    functionsHost: '',
    functionsPort: 0,
  },
};
