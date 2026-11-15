import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { isUserApproved } from '../../domain/entities/user.entity';
import { SessionStore } from '../state/session.store';

/**
 * Guard funcional para proteger rutas internas que requieren sesión autenticada y cuenta aprobada.
 */
export const authGuard: CanActivateFn = async () => {
  const session = inject(SessionStore);
  const router = inject(Router);
  const user = await session.waitUntilInitialized();

  if (!user) {
    return router.createUrlTree(['/login']);
  }

  if (isUserApproved(user)) {
    return true;
  }

  return router.createUrlTree(['/pending']);
};
