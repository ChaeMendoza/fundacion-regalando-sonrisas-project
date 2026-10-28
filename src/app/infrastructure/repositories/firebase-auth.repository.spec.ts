import { TestBed } from '@angular/core/testing';
import { AuthService } from './auth.service';
import { FirebaseAppService } from './firebase-app.service';

describe('AuthService', () => {
  let service: AuthService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [AuthService, FirebaseAppService],
    });
    service = TestBed.inject(AuthService);
  });

  it('should initialize with active development user', () => {
    expect(service.isAuthenticated()).toBe(true);
    expect(service.currentUser()?.email).toContain('admin.demo@regalandosonrisas.ec');
    expect(service.userRole()).toBe('admin');
  });

  it('should update state when logging out', async () => {
    await service.logout();
    expect(service.isAuthenticated()).toBe(false);
    expect(service.currentUser()).toBeNull();
    expect(service.userRole()).toBeNull();
  });
});
