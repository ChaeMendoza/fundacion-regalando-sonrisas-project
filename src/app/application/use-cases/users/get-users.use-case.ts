import { AppUser, isUserAdmin } from '../../../domain/entities/user.entity';
import { AuthRepository } from '../../../domain/repositories/auth.repository';
import { UserProfileRepository } from '../../../domain/repositories/user-profile.repository';

export class GetUsersUseCase {
  constructor(
    private readonly userProfiles: UserProfileRepository,
    private readonly auth: AuthRepository,
  ) {}

  async execute(): Promise<AppUser[]> {
    const currentUser = this.auth.getCurrentUser();
    if (!isUserAdmin(currentUser)) {
      throw new Error('Acceso denegado: Se requieren privilegios de administrador.');
    }

    const users = await this.userProfiles.findAll();
    return [...users].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }
}
