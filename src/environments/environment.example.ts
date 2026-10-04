/**
 * Plantilla de configuración de ambiente para la Fundación Regalando Sonrisas.
 * Copie este archivo como 'environment.ts' o 'environment.local.ts' con sus credenciales del proyecto Firebase.
 * NUNCA incluya credenciales reales o API keys privadas en repositorios públicos.
 */
import { EnvironmentConfig } from './environment.model';

export const environment: EnvironmentConfig = {
  production: false,
  appName: 'Sistema de Gestión Integral - Fundación Regalando Sonrisas',
  appVersion: '0.1.0-dev',
  firebase: {
    apiKey: 'YOUR_FIREBASE_API_KEY',
    authDomain: 'YOUR_PROJECT_ID.firebaseapp.com',
    projectId: 'YOUR_PROJECT_ID',
    storageBucket: 'YOUR_PROJECT_ID.appspot.com',
    messagingSenderId: 'YOUR_MESSAGING_SENDER_ID',
    appId: 'YOUR_APP_ID',
    measurementId: 'OPTIONAL_MEASUREMENT_ID',
  },
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
