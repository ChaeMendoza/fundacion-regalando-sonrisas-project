import { TestBed } from '@angular/core/testing';
import { AppUser } from '../../domain/entities/user.entity';
import { FirebaseAuthRepository } from './firebase-auth.repository';

describe('FirebaseAuthRepository', () => {
  let repository: FirebaseAuthRepository;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    repository = TestBed.inject(FirebaseAuthRepository);
  });

  it('should initialize with active development user', () => {
    const user = repository.getCurrentUser();
    expect(user?.email).toContain('admin.demo@regalandosonrisas.ec');
    expect(user?.role).toBe('admin');
  });

  it('should notify listeners when logging out', async () => {
    const states: (AppUser | null)[] = [];
    repository.observeAuthState((u) => states.push(u));
    await repository.logout();
    expect(repository.getCurrentUser()).toBeNull();
    expect(states.at(-1)).toBeNull();
  });
});
