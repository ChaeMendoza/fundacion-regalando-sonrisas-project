import { AppUser } from '../../../domain/entities/user.entity';
import { AuthRepository } from '../../../domain/repositories/auth.repository';
import { UserProfileRepository } from '../../../domain/repositories/user-profile.repository';
import { GetUsersUseCase } from './get-users.use-case';

describe('GetUsersUseCase', () => {
  const adminUser: AppUser = {
    uid: 'admin-1',
    email: 'admin@fundacion.org',
    displayName: 'Admin',
    role: 'admin',
    status: 'approved',
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
  };

  const regularUser: AppUser = {
    uid: 'user-1',
    email: 'user@fundacion.org',
    displayName: 'Usuario Regular',
    role: 'user',
    status: 'approved',
    createdAt: '2026-02-01T00:00:00.000Z',
    updatedAt: '2026-02-01T00:00:00.000Z',
  };

  it('returns users sorted by createdAt descending when called by an approved admin', async () => {
    const userProfiles = {
      findAll: vi.fn().mockResolvedValue([adminUser, regularUser]),
    } as unknown as UserProfileRepository;
    const auth = {
      getCurrentUser: vi.fn().mockReturnValue(adminUser),
    } as unknown as AuthRepository;

    const useCase = new GetUsersUseCase(userProfiles, auth);
    const result = await useCase.execute();

    expect(result.map((u) => u.uid)).toEqual(['user-1', 'admin-1']);
  });

  it('rejects execution when called by a non-admin user', async () => {
    const userProfiles = {
      findAll: vi.fn(),
    } as unknown as UserProfileRepository;
    const auth = {
      getCurrentUser: vi.fn().mockReturnValue(regularUser),
    } as unknown as AuthRepository;

    const useCase = new GetUsersUseCase(userProfiles, auth);
    await expect(useCase.execute()).rejects.toThrow(/Acceso denegado/);
    expect(userProfiles.findAll).not.toHaveBeenCalled();
  });
});
