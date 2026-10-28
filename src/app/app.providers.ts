import { Provider } from '@angular/core';
import { environment } from '../environments/environment';
import { GetRecentAuditLogsUseCase } from './application/use-cases/audit/get-recent-audit-logs.use-case';
import { LogAuditEventUseCase } from './application/use-cases/audit/log-audit-event.use-case';
import { LoginUseCase } from './application/use-cases/auth/login.use-case';
import { LogoutUseCase } from './application/use-cases/auth/logout.use-case';
import { ObserveSessionUseCase } from './application/use-cases/auth/observe-session.use-case';
import { RegisterUseCase } from './application/use-cases/auth/register.use-case';
import { AuditLogRepository } from './domain/repositories/audit-log.repository';
import { AuthRepository } from './domain/repositories/auth.repository';
import { UserProfileRepository } from './domain/repositories/user-profile.repository';
import { IS_PRODUCTION } from './presentation/config/runtime-config.token';
import { FirebaseAuthRepository } from './infrastructure/repositories/firebase-auth.repository';
import { FirestoreAuditLogRepository } from './infrastructure/repositories/firestore-audit-log.repository';
import { FirestoreUserProfileRepository } from './infrastructure/repositories/firestore-user-profile.repository';

/** Raíz de composición: enlaza contratos con implementaciones y construye los casos de uso. */
export const APP_PROVIDERS: Provider[] = [
  { provide: IS_PRODUCTION, useValue: environment.production },

  { provide: AuthRepository, useExisting: FirebaseAuthRepository },
  { provide: AuditLogRepository, useExisting: FirestoreAuditLogRepository },
  { provide: UserProfileRepository, useExisting: FirestoreUserProfileRepository },

  {
    provide: LoginUseCase,
    useFactory: (a: AuthRepository) => new LoginUseCase(a),
    deps: [AuthRepository],
  },
  {
    provide: RegisterUseCase,
    useFactory: (a: AuthRepository) => new RegisterUseCase(a),
    deps: [AuthRepository],
  },
  {
    provide: LogoutUseCase,
    useFactory: (a: AuthRepository) => new LogoutUseCase(a),
    deps: [AuthRepository],
  },
  {
    provide: ObserveSessionUseCase,
    useFactory: (a: AuthRepository) => new ObserveSessionUseCase(a),
    deps: [AuthRepository],
  },
  {
    provide: LogAuditEventUseCase,
    useFactory: (l: AuditLogRepository, a: AuthRepository) => new LogAuditEventUseCase(l, a),
    deps: [AuditLogRepository, AuthRepository],
  },
  {
    provide: GetRecentAuditLogsUseCase,
    useFactory: (l: AuditLogRepository) => new GetRecentAuditLogsUseCase(l),
    deps: [AuditLogRepository],
  },
];
