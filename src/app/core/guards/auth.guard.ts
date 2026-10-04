import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/firebase/auth.service';

/**
 * Guard funcional para proteger rutas que requieren sesión activa.
 */
export const authGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.isAuthenticated()) {
    return true;
  }

  // Redirigir a inicio si no está autenticado
  return router.createUrlTree(['/']);
};
