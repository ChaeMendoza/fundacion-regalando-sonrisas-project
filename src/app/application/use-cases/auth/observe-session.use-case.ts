import {
  AuthStateListener,
  AuthRepository,
  Unsubscribe,
} from '../../../domain/repositories/auth.repository';

export class ObserveSessionUseCase {
  constructor(private readonly auth: AuthRepository) {}

  waitForInitialState() {
    return this.auth.waitForInitialState();
  }

  execute(listener: AuthStateListener): Unsubscribe {
    return this.auth.observeAuthState(listener);
  }
}
