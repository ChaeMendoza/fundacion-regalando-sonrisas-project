import { AuthRepository } from '../../../domain/repositories/auth.repository';

export class LogoutUseCase {
  constructor(private readonly auth: AuthRepository) {}

  execute(): Promise<void> {
    return this.auth.logout();
  }
}
