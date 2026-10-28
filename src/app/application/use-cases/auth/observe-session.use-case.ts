import {
  AuthStateListener,
  AuthRepository,
  Unsubscribe,
} from '../../../domain/repositories/auth.repository';

export class ObserveSessionUseCase {
  constructor(private readonly auth: AuthRepository) {}

  execute(listener: AuthStateListener): Unsubscribe {
    return this.auth.observeAuthState(listener);
  }
}
