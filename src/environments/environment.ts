import { EnvironmentConfig } from './environment.model';
import { firebaseConfig } from './firebase-config';

/**
 * Entorno de desarrollo: usa los emuladores locales por defecto para no
 * modificar el proyecto real desde `ng serve`. La compilación de producción
 * sustituye este archivo por `environment.production.ts`.
 */
export const environment: EnvironmentConfig = {
  production: false,
  appName: 'Sistema de Gestión Integral - Fundación Regalando Sonrisas',
  appVersion: '0.1.0-dev',
  firebase: firebaseConfig,
  emulators: {
    useEmulators: true,
    authHost: 'http://127.0.0.1',
    authPort: 9099,
    firestoreHost: '127.0.0.1',
    firestorePort: 8080,
    storageHost: '127.0.0.1',
    storagePort: 9199,
    functionsHost: '127.0.0.1',
    functionsPort: 5001,
  },
};
