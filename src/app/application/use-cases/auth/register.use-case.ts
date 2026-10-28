import { AuthRepository } from '../../../domain/repositories/auth.repository';

export class RegisterUseCase {
  constructor(private readonly auth: AuthRepository) {}

  execute(displayName: string, email: string, password: string): Promise<void> {
    return this.auth.register(displayName, email, password);
  }
}
