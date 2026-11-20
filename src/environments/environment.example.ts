/**
 * Plantilla de configuración de ambiente para la Fundación Regalando Sonrisas.
 * Copie este archivo como 'environment.ts' si necesita restaurar la plantilla de desarrollo.
 * La configuración web de Firebase es pública; no incluya credenciales de servicio ni tokens.
 */
import { EnvironmentConfig } from './environment.model';
import { firebaseConfig } from './firebase-config';

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
