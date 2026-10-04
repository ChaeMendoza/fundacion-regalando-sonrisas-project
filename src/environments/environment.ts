import { EnvironmentConfig } from './environment.model';

export const environment: EnvironmentConfig = {
  production: false,
  appName: 'Sistema de Gestión Integral - Fundación Regalando Sonrisas',
  appVersion: '0.1.0-dev',
  firebase: {
    apiKey: 'demo-api-key-local',
    authDomain: 'fundacion-regalando-sonrisas.firebaseapp.com',
    projectId: 'demo-regalando-sonrisas',
    storageBucket: 'demo-regalando-sonrisas.appspot.com',
    messagingSenderId: '000000000000',
    appId: '1:000000000000:web:0000000000000000000000',
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
