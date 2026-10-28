import { TestBed } from '@angular/core/testing';
import { AppUser } from '../../domain/entities/user.entity';
import { UserProfileRepository } from '../../domain/repositories/user-profile.repository';
import { FirebaseAuthRepository } from './firebase-auth.repository';

describe('FirebaseAuthRepository', () => {
  let repository: FirebaseAuthRepository;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        {
          provide: UserProfileRepository,
          useValue: {
            findById: vi.fn().mockResolvedValue(null),
            createPendingProfile: vi.fn().mockResolvedValue(undefined),
          },
        },
      ],
    });
    repository = TestBed.inject(FirebaseAuthRepository);
  });

  it('does not grant a demo session before Firebase resolves the user', () => {
    expect(repository.getCurrentUser()).toBeNull();
  });

  it('should notify listeners when logging out', async () => {
    const states: (AppUser | null)[] = [];
    repository.observeAuthState((u) => states.push(u));
    await repository.logout();
    expect(repository.getCurrentUser()).toBeNull();
    expect(states.at(-1)).toBeNull();
  });
});
