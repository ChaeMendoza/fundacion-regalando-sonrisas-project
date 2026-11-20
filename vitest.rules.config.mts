import { defineConfig } from 'vitest/config';

/** Configuración aislada para las pruebas de reglas contra los emuladores de Firebase. */
export default defineConfig({
  test: {
    globals: true,
    include: ['tests/**/*.spec.ts'],
    fileParallelism: false,
    hookTimeout: 30000,
    testTimeout: 30000,
  },
});
