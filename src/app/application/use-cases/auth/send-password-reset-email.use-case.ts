import { AuthRepository } from '../../../domain/repositories/auth.repository';

export class SendPasswordResetEmailUseCase {
  constructor(private readonly auth: AuthRepository) {}

  execute(email: string): Promise<void> {
    return this.auth.sendPasswordResetEmail(email);
  }
}
