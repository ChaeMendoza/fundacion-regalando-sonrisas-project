import { InjectionToken } from '@angular/core';

/** Indica si la app corre en modo producción; lo provee la raíz de composición. */
export const IS_PRODUCTION = new InjectionToken<boolean>('IS_PRODUCTION');
