import { TestBed } from '@angular/core/testing';
import { ActivatedRouteSnapshot, Router, RouterStateSnapshot, UrlTree } from '@angular/router';
import { provideRouter } from '@angular/router';
import { AppUser } from '../../domain/entities/user.entity';
import { SessionStore } from '../state/session.store';
import { authGuard } from './auth.guard';
import { roleGuard } from './role.guard';

describe('authGuard and roleGuard', () => {
  let mockUser: AppUser | null = null;

  beforeEach(() => {
    mockUser = null;
    TestBed.configureTestingModule({
      providers: [
        provideRouter([]),
        {
          provide: SessionStore,
          useValue: {
            waitUntilInitialized: () => Promise.resolve(mockUser),
            userRole: () => mockUser?.role ?? null,
          },
        },
      ],
    });
  });

  it('redirects unauthenticated users to /login', async () => {
    mockUser = null;
    const result = await TestBed.runInInjectionContext(() =>
      authGuard({} as ActivatedRouteSnapshot, {} as RouterStateSnapshot),
    );
    const router = TestBed.inject(Router);
    expect(result instanceof UrlTree && router.serializeUrl(result)).toBe('/login');
  });

  it('redirects pending, rejected, and disabled users to /pending', async () => {
    const router = TestBed.inject(Router);

    for (const status of ['pending', 'rejected', 'disabled'] as const) {
      mockUser = {
        uid: 'u-1',
        email: 'test@fundacion.org',
        displayName: 'Test',
        role: 'user',
        status,
        createdAt: '2026-01-01T00:00:00.000Z',
        updatedAt: '2026-01-01T00:00:00.000Z',
      };

      const result = await TestBed.runInInjectionContext(() =>
        authGuard({} as ActivatedRouteSnapshot, {} as RouterStateSnapshot),
      );
      expect(result instanceof UrlTree && router.serializeUrl(result)).toBe('/pending');
    }
  });

  it('allows approved users through authGuard', async () => {
    mockUser = {
      uid: 'u-1',
      email: 'test@fundacion.org',
      displayName: 'Test',
      role: 'user',
      status: 'approved',
      createdAt: '2026-01-01T00:00:00.000Z',
      updatedAt: '2026-01-01T00:00:00.000Z',
    };

    const result = await TestBed.runInInjectionContext(() =>
      authGuard({} as ActivatedRouteSnapshot, {} as RouterStateSnapshot),
    );
    expect(result).toBe(true);
  });

  it('blocks regular approved users from /admin via roleGuard and allows approved admins', async () => {
    const router = TestBed.inject(Router);
    const adminRoute = { data: { roles: ['admin'] } } as unknown as ActivatedRouteSnapshot;

    mockUser = {
      uid: 'u-1',
      email: 'user@fundacion.org',
      displayName: 'Usuario Regular',
      role: 'user',
      status: 'approved',
      createdAt: '2026-01-01T00:00:00.000Z',
      updatedAt: '2026-01-01T00:00:00.000Z',
    };

    const deniedResult = await TestBed.runInInjectionContext(() =>
      roleGuard(adminRoute, {} as RouterStateSnapshot),
    );
    expect(deniedResult instanceof UrlTree && router.serializeUrl(deniedResult)).toBe('/dashboard');

    mockUser = {
      ...mockUser,
      role: 'admin',
    };

    const allowedResult = await TestBed.runInInjectionContext(() =>
      roleGuard(adminRoute, {} as RouterStateSnapshot),
    );
    expect(allowedResult).toBe(true);
  });

  it('redirects regular users from institutional modules to their profile', async () => {
    const router = TestBed.inject(Router);
    const moduleRoute = {
      data: { roles: ['admin'], redirectTo: '/profile' },
    } as unknown as ActivatedRouteSnapshot;

    mockUser = {
      uid: 'u-1',
      email: 'user@fundacion.org',
      displayName: 'Usuario Regular',
      role: 'user',
      status: 'approved',
      createdAt: '2026-01-01T00:00:00.000Z',
      updatedAt: '2026-01-01T00:00:00.000Z',
    };

    const result = await TestBed.runInInjectionContext(() =>
      roleGuard(moduleRoute, {} as RouterStateSnapshot),
    );
    expect(result instanceof UrlTree && router.serializeUrl(result)).toBe('/profile');
  });
});
