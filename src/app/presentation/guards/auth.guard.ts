import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { SessionStore } from '../state/session.store';

/**
 * Guard funcional para proteger rutas que requieren sesión activa.
 */
export const authGuard: CanActivateFn = () => {
  const session = inject(SessionStore);
  const router = inject(Router);

  if (session.isAuthenticated()) {
    return true;
  }

  // Redirigir a inicio si no está autenticado
  return router.createUrlTree(['/']);
};
