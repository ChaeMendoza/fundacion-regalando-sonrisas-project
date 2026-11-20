import { Injectable, inject } from '@angular/core';
import { UserAccessClaimsRepository } from '../../domain/repositories/user-access-claims.repository';
import { FunctionsService } from '../firebase/functions.service';

/** Adaptador que delega la sincronización privilegiada de claims al backend. */
@Injectable({ providedIn: 'root' })
export class FirebaseFunctionsUserAccessClaimsRepository extends UserAccessClaimsRepository {
  private readonly functions = inject(FunctionsService);

  async sync(targetUid: string): Promise<void> {
    await this.functions.call('syncUserAccessClaims', { targetUid });
  }
}
