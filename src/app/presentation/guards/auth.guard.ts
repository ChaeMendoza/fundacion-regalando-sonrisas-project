import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { SessionStore } from '../state/session.store';

/**
 * Guard funcional para proteger rutas que requieren sesión activa.
 */
export const authGuard: CanActivateFn = async () => {
  const session = inject(SessionStore);
  const router = inject(Router);
  const user = await session.waitUntilInitialized();

  if (!user) {
    return router.createUrlTree(['/login']);
  }

  if (user.status === 'active' && user.role) {
    return true;
  }

  return router.createUrlTree(['/pending']);
};
