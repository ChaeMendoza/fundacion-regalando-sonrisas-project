import { AppUser } from '../../../domain/entities/user.entity';
import { AuditLogRepository } from '../../../domain/repositories/audit-log.repository';
import { AuthRepository } from '../../../domain/repositories/auth.repository';
import {
  UpdateUserAccessInput,
  UserProfileRepository,
} from '../../../domain/repositories/user-profile.repository';
import { ManageUserAccessUseCase } from './manage-user-access.use-case';

describe('ManageUserAccessUseCase', () => {
  const adminUser: AppUser = {
    uid: 'admin-1',
    email: 'admin@fundacion.org',
    displayName: 'Admin Fundación',
    role: 'admin',
    status: 'approved',
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
  };

  const pendingUser: AppUser = {
    uid: 'user-2',
    email: 'solicitante@fundacion.org',
    displayName: 'Solicitante Prueba',
    role: 'user',
    status: 'pending',
    createdAt: '2026-02-01T00:00:00.000Z',
    updatedAt: '2026-02-01T00:00:00.000Z',
  };

  let currentActor: AppUser | null;
  let storedUsers: Map<string, AppUser>;
  let userProfilesMock: UserProfileRepository;
  let authMock: AuthRepository;
  let auditLogsMock: AuditLogRepository;
  let useCase: ManageUserAccessUseCase;

  beforeEach(() => {
    currentActor = adminUser;
    storedUsers = new Map<string, AppUser>([
      [adminUser.uid, { ...adminUser }],
      [pendingUser.uid, { ...pendingUser }],
    ]);

    userProfilesMock = {
      findById: vi.fn(async (uid: string) => storedUsers.get(uid) ?? null),
      observeById: vi.fn(() => () => undefined),
      createPendingProfile: vi.fn(async () => undefined),
      findAll: vi.fn(async () => Array.from(storedUsers.values())),
      updateAccess: vi.fn(async (input: UpdateUserAccessInput) => {
        const existing = storedUsers.get(input.uid);
        if (!existing) {
          throw new Error('Not found');
        }
        const updated: AppUser = {
          ...existing,
          status: input.status,
          role: input.role,
          updatedAt: input.updatedAt,
          updatedBy: input.updatedBy,
          approvedAt: input.approvedAt ?? null,
          approvedBy: input.approvedBy ?? null,
          rejectionReason: input.rejectionReason ?? null,
        };
        storedUsers.set(input.uid, updated);
        return updated;
      }),
    };

    authMock = {
      getCurrentUser: vi.fn(() => currentActor),
      waitForInitialState: vi.fn(async () => currentActor),
      observeAuthState: vi.fn(() => () => undefined),
      login: vi.fn(async () => undefined),
      register: vi.fn(async () => undefined),
      logout: vi.fn(async () => undefined),
      sendPasswordResetEmail: vi.fn(async () => undefined),
    };

    auditLogsMock = {
      add: vi.fn(async () => undefined),
      getAll: vi.fn(async () => []),
    };

    useCase = new ManageUserAccessUseCase(userProfilesMock, authMock, auditLogsMock);
  });

  it('approves a pending user and records approval metadata and audit log', async () => {
    const result = await useCase.approveUser(pendingUser.uid, 'user');

    expect(result.status).toBe('approved');
    expect(result.role).toBe('user');
    expect(result.approvedBy).toBe(adminUser.email);
    expect(result.approvedAt).toBeTruthy();
    expect(auditLogsMock.add).toHaveBeenCalledWith(
      expect.objectContaining({
        userId: adminUser.uid,
        module: 'admin',
        action: 'update',
        recordId: pendingUser.uid,
      }),
    );
  });

  it('rejects a pending user request with reason and prevents access', async () => {
    const result = await useCase.rejectUser(pendingUser.uid, 'Datos incompletos');

    expect(result.status).toBe('rejected');
    expect(result.rejectionReason).toBe('Datos incompletos');
    expect(result.approvedAt).toBeNull();
    expect(auditLogsMock.add).toHaveBeenCalledWith(
      expect.objectContaining({
        action: 'deactivate',
        recordId: pendingUser.uid,
      }),
    );
  });

  it('disables an approved user and allows subsequent reactivation', async () => {
    await useCase.approveUser(pendingUser.uid, 'user');
    const disabled = await useCase.disableUser(pendingUser.uid, 'Fin de periodo');
    expect(disabled.status).toBe('disabled');
    expect(disabled.rejectionReason).toBe('Fin de periodo');

    const reactivated = await useCase.reactivateUser(pendingUser.uid);
    expect(reactivated.status).toBe('approved');
    expect(reactivated.rejectionReason).toBeNull();
  });

  it('prevents a regular user from approving, rejecting, or elevating roles', async () => {
    currentActor = {
      ...pendingUser,
      status: 'approved',
      role: 'user',
    };

    await expect(useCase.approveUser(pendingUser.uid, 'admin')).rejects.toThrow(
      /Operación no autorizada/,
    );
    await expect(useCase.changeUserRole(pendingUser.uid, 'admin')).rejects.toThrow(
      /Operación no autorizada/,
    );
    await expect(useCase.rejectUser(adminUser.uid)).rejects.toThrow(/Operación no autorizada/);
  });

  it('prevents an admin from disabling, rejecting, or demoting their own account', async () => {
    await expect(useCase.disableUser(adminUser.uid)).rejects.toThrow(
      /no puede deshabilitar su propia cuenta/,
    );
    await expect(useCase.rejectUser(adminUser.uid)).rejects.toThrow(
      /no puede rechazar su propia cuenta/,
    );
    await expect(useCase.changeUserRole(adminUser.uid, 'user')).rejects.toThrow(
      /no puede revocar su propio rol/,
    );
  });
});
