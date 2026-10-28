import { inject } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/firebase/auth.service';
import { UserRole } from '../models/user.model';

/**
 * Guard funcional para validar roles de acceso.
 *
 * NOTA PENDIENTE DE VALIDACIÓN:
 * Los roles y permisos definitivos requieren confirmación institucional.
 * La arquitectura permite agregar o modificar roles sin rehacer la navegación.
 */
export const roleGuard: CanActivateFn = (route: ActivatedRouteSnapshot) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  const allowedRoles = route.data['roles'] as UserRole[] | undefined;
  const currentRole = authService.userRole();

  if (!allowedRoles || allowedRoles.length === 0) {
    return true;
  }

  if (currentRole && allowedRoles.includes(currentRole)) {
    return true;
  }

  // Si el usuario no tiene el rol necesario, redirige a dashboard
  return router.createUrlTree(['/dashboard']);
};
