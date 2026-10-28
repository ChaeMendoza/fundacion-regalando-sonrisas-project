import { inject } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivateFn, Router } from '@angular/router';
import { SessionStore } from '../state/session.store';
import { UserRole } from '../../domain/entities/user.entity';

/**
 * Guard funcional para validar roles de acceso.
 *
 * NOTA PENDIENTE DE VALIDACIÓN:
 * Los roles y permisos definitivos requieren confirmación institucional.
 * La arquitectura permite agregar o modificar roles sin rehacer la navegación.
 */
export const roleGuard: CanActivateFn = (route: ActivatedRouteSnapshot) => {
  const session = inject(SessionStore);
  const router = inject(Router);

  const allowedRoles = route.data['roles'] as UserRole[] | undefined;
  const currentRole = session.userRole();

  if (!allowedRoles || allowedRoles.length === 0) {
    return true;
  }

  if (currentRole && allowedRoles.includes(currentRole)) {
    return true;
  }

  // Si el usuario no tiene el rol necesario, redirige a dashboard
  return router.createUrlTree(['/dashboard']);
};
