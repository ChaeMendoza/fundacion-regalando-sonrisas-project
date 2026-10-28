import { AuthRepository } from '../../../domain/repositories/auth.repository';

export class LoginUseCase {
  constructor(private readonly auth: AuthRepository) {}

  execute(email: string, password: string): Promise<void> {
    return this.auth.login(email, password);
  }
}
