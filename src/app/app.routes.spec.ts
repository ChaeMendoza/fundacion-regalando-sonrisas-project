import { routes } from './app.routes';
import { roleGuard } from './presentation/guards/role.guard';

describe('app.routes access control', () => {
  const layout = routes.find((route) => Array.isArray(route.children));
  const children = layout?.children ?? [];

  const adminPaths = [
    'dashboard',
    'beneficiaries',
    'donations',
    'volunteers',
    'activities',
    'requests',
    'documents',
    'reports',
    'admin',
  ];

  it('protects every institutional module with the admin role guard', () => {
    for (const path of adminPaths) {
      const route = children.find((child) => child.path === path);
      expect(route, `Ruta ${path} no encontrada`).toBeDefined();
      expect(route?.canActivate).toContain(roleGuard);
      expect(route?.data?.['roles']).toContain('admin');
      expect(route?.data?.['redirectTo']).toBe('/profile');
    }
  });

  it('keeps the profile available to any approved user', () => {
    const profile = children.find((child) => child.path === 'profile');
    expect(profile).toBeDefined();
    expect(profile?.canActivate).not.toContain(roleGuard);
  });
});
