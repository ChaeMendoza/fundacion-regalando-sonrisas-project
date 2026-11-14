import { EnvironmentConfig } from './environment.model';
import { firebaseConfig } from './firebase-config';

export const environment: EnvironmentConfig = {
  production: false,
  appName: 'Sistema de Gestión Integral - Fundación Regalando Sonrisas',
  appVersion: '0.1.0-dev',
  firebase: firebaseConfig,
  emulators: {
    useEmulators: false,
    authHost: 'http://127.0.0.1',
    authPort: 9099,
    firestoreHost: 'localhost',
    firestorePort: 8080,
    storageHost: 'localhost',
    storagePort: 9199,
    functionsHost: 'localhost',
    functionsPort: 5001,
  },
};
