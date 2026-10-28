import { AppUser } from '../entities/user.entity';

/** Contrato de lectura y creación inicial del perfil de acceso. */
export abstract class UserProfileRepository {
  abstract findById(uid: string): Promise<AppUser | null>;
  abstract createPendingProfile(profile: AppUser): Promise<void>;
}
