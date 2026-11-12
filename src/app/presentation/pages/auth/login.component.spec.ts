import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { SessionStore } from '../../state/session.store';
import { LoginComponent } from './login.component';

describe('LoginComponent', () => {
  const sendPasswordResetEmail = vi.fn();

  beforeEach(async () => {
    sendPasswordResetEmail.mockReset();
    await TestBed.configureTestingModule({
      imports: [LoginComponent],
      providers: [
        {
          provide: SessionStore,
          useValue: {
            sessionError: () => null,
            sendPasswordResetEmail,
          },
        },
        provideRouter([]),
      ],
    }).compileComponents();
  });

  it('does not reveal whether an account exists during password recovery', async () => {
    sendPasswordResetEmail.mockRejectedValue({ code: 'auth/user-not-found' });
    const fixture = TestBed.createComponent(LoginComponent);
    const component = fixture.componentInstance;
    component.form.controls.email.setValue('unknown@example.com');
    component.startPasswordRecovery();

    await component.submit();

    expect(sendPasswordResetEmail).toHaveBeenCalledWith('unknown@example.com');
    expect(component.recoveryMessage()).toContain('Si la cuenta existe');
    expect(component.errorMessage()).toBe('');
  });
});
