/**
 * Plantilla de configuración de ambiente para la Fundación Regalando Sonrisas.
 * Copie este archivo como 'environment.ts' o 'environment.local.ts' con sus credenciales del proyecto Firebase.
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
    useEmulators: false,
    authHost: 'http://localhost',
    authPort: 9099,
    firestoreHost: 'localhost',
    firestorePort: 8080,
    storageHost: 'localhost',
    storagePort: 9199,
    functionsHost: 'localhost',
    functionsPort: 5001,
  },
};
