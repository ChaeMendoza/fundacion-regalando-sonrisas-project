import { firebaseConfig } from './firebase-config';
import { environment as developmentEnvironment } from './environment';
import { environment as productionEnvironment } from './environment.production';

describe('configuración de entornos', () => {
  it('apunta ambos entornos al proyecto Firebase correcto', () => {
    expect(firebaseConfig.projectId).toBe('fir-chae-projects');
    expect(firebaseConfig.authDomain).toBe('fir-chae-projects.firebaseapp.com');
    expect(developmentEnvironment.firebase.projectId).toBe('fir-chae-projects');
    expect(productionEnvironment.firebase.projectId).toBe('fir-chae-projects');
  });

  it('desactiva emuladores y hosts locales en producción', () => {
    expect(productionEnvironment.production).toBe(true);
    expect(productionEnvironment.emulators.useEmulators).toBe(false);
    expect(productionEnvironment.emulators.authHost).toBe('');
    expect(productionEnvironment.emulators.firestoreHost).toBe('');
    expect(productionEnvironment.emulators.storageHost).toBe('');
    expect(productionEnvironment.emulators.functionsHost).toBe('');
    expect(productionEnvironment.emulators.authPort).toBe(0);
    expect(productionEnvironment.emulators.firestorePort).toBe(0);
    expect(productionEnvironment.emulators.storagePort).toBe(0);
    expect(productionEnvironment.emulators.functionsPort).toBe(0);
  });

  it('usa emuladores en desarrollo para no modificar el proyecto real', () => {
    expect(developmentEnvironment.production).toBe(false);
    expect(developmentEnvironment.emulators.useEmulators).toBe(true);
  });
});
