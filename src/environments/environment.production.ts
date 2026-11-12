import { EnvironmentConfig } from './environment.model';
import { firebaseConfig } from './firebase-config';

export const environment: EnvironmentConfig = {
  production: true,
  appName: 'Sistema de Gestión Integral - Fundación Regalando Sonrisas',
  appVersion: '0.1.0',
  firebase: firebaseConfig,
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
