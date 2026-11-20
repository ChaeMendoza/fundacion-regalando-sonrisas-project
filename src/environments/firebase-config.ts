import { FirebaseConfig } from './environment.model';

/**
 * Configuración web pública del proyecto Firebase `fir-chae-projects`.
 *
 * Estos valores son identificadores del SDK de cliente y pueden entregarse al
 * navegador. NO son credenciales administrativas. El acceso a datos se controla
 * con Firebase Security Rules, y las operaciones privilegiadas se ejecutan
 * únicamente desde Cloud Functions o desde scripts con Admin SDK fuera del repo.
 *
 * Antes de publicar, verifica en Google Cloud Console que la API key esté
 * restringida a los referenciadores legítimos y a las APIs usadas por el proyecto.
 */
export const firebaseConfig: FirebaseConfig = {
  apiKey: 'AIzaSyCyQN95DKSj6S0ZChZ-7cCmTXiYJ-muU0c',
  authDomain: 'fir-chae-projects.firebaseapp.com',
  projectId: 'fir-chae-projects',
  storageBucket: 'fir-chae-projects.firebasestorage.app',
  messagingSenderId: '76212676407',
  appId: '1:76212676407:web:ff4d7e38b80ea59f7b5cb2',
  measurementId: 'G-N4G4S8YBSQ',
};
