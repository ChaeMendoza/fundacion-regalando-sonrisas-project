import { AuditLog } from '../../../domain/entities/audit-log.entity';
import { AuditLogRepository } from '../../../domain/repositories/audit-log.repository';
import { AuthRepository } from '../../../domain/repositories/auth.repository';
import { LogAuditEventUseCase } from './log-audit-event.use-case';

class FakeAuditLogs extends AuditLogRepository {
  entries: Omit<AuditLog, 'id'>[] = [];
  fail = false;
  async add(entry: Omit<AuditLog, 'id'>): Promise<void> {
    if (this.fail) throw new Error('boom');
    this.entries.push(entry);
  }
  async getAll(): Promise<AuditLog[]> {
    return [];
  }
}

class FakeAuth extends AuthRepository {
  getCurrentUser() {
    return null;
  }
  waitForInitialState() {
    return Promise.resolve(null);
  }
  observeAuthState() {
    return () => undefined;
  }
  register(): Promise<void> {
    return Promise.resolve();
  }
  login(): Promise<void> {
    return Promise.resolve();
  }
  logout(): Promise<void> {
    return Promise.resolve();
  }
}

describe('LogAuditEventUseCase', () => {
  it('records an anonymous event when there is no session', async () => {
    const logs = new FakeAuditLogs();
    await new LogAuditEventUseCase(logs, new FakeAuth()).execute('login', 'auth');
    expect(logs.entries[0]).toMatchObject({
      userId: 'unauthenticated',
      action: 'login',
      module: 'auth',
    });
  });

  it('does not throw when persistence fails', async () => {
    const logs = new FakeAuditLogs();
    logs.fail = true;
    vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    await expect(
      new LogAuditEventUseCase(logs, new FakeAuth()).execute('login', 'auth'),
    ).resolves.toBeUndefined();
  });
});
