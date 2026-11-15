import { inject } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivateFn, Router } from '@angular/router';
import { SessionStore } from '../state/session.store';
import { UserRole, isUserApproved } from '../../domain/entities/user.entity';

/**
 * Guard funcional para validar roles de acceso (ej. rutas exclusivas de 'admin').
 */
export const roleGuard: CanActivateFn = async (route: ActivatedRouteSnapshot) => {
  const session = inject(SessionStore);
  const router = inject(Router);
  const user = await session.waitUntilInitialized();

  if (!user) {
    return router.createUrlTree(['/login']);
  }

  if (!isUserApproved(user)) {
    return router.createUrlTree(['/pending']);
  }

  const allowedRoles = route.data['roles'] as UserRole[] | undefined;
  if (!allowedRoles || allowedRoles.length === 0) {
    return true;
  }

  if (user.role && allowedRoles.includes(user.role)) {
    return true;
  }

  // Si el usuario no tiene el rol requerido, redirige al dashboard
  return router.createUrlTree(['/dashboard']);
};
