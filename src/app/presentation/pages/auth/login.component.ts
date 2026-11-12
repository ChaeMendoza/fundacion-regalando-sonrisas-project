import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { SessionStore } from '../../state/session.store';
import { getAuthErrorMessage } from './auth-error-message';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink],
  template: `
    <main class="auth-page">
      <section class="auth-card" aria-labelledby="login-title">
        <a routerLink="/" class="auth-brand" aria-label="Volver al portal de la Fundación">
          <img src="images/logo-fundacion.jpg" alt="Logo de la Fundación Regalando Sonrisas"/>
        </a>

        <div class="auth-heading">
          <p class="auth-eyebrow">Sistema de Gestión Integral</p>
          <h1 id="login-title">Iniciar sesión</h1>
          <p>Ingresa con la cuenta autorizada por la Fundación.</p>
        </div>

        @if (errorMessage()) {
          <div class="auth-alert" role="alert">{{ errorMessage() }}</div>
        }
        @if (session.sessionError(); as sessionError) {
          <div class="auth-alert" role="alert">{{ sessionError }}</div>
        }

        <form [formGroup]="form" (ngSubmit)="submit()" novalidate>
          <label for="email">Correo electrónico</label>
          <input
            id="email"
            type="email"
            formControlName="email"
            autocomplete="email"
            placeholder="nombre@ejemplo.com"
            [attr.aria-invalid]="form.controls.email.invalid && form.controls.email.touched"
          />
          @if (form.controls.email.invalid && form.controls.email.touched) {
            <span class="field-error">Ingresa un correo electrónico válido.</span>
          }

          @if (!recovering()) {
            <label for="password">Contraseña</label>
            <input
              id="password"
              type="password"
              formControlName="password"
              autocomplete="current-password"
              placeholder="Tu contraseña"
              [attr.aria-invalid]="form.controls.password.invalid && form.controls.password.touched"
            />
            @if (form.controls.password.invalid && form.controls.password.touched) {
              <span class="field-error">La contraseña es obligatoria.</span>
            }
            <button type="button" class="auth-text-button" (click)="startPasswordRecovery()">
              ¿Olvidaste tu contraseña?
            </button>
          } @else {
            <p class="auth-recovery-note">
              Si la cuenta existe, enviaremos instrucciones para restablecer la contraseña.
            </p>
          }

          <button type="submit" class="auth-submit" [disabled]="loading()">
            {{
              loading()
                ? recovering()
                  ? 'Enviando…'
                  : 'Ingresando…'
                : recovering()
                  ? 'Enviar instrucciones'
                  : 'Ingresar'
            }}
          </button>
          @if (recovering()) {
            <button type="button" class="auth-text-button" (click)="cancelPasswordRecovery()">
              Volver a iniciar sesión
            </button>
          }
        </form>

        @if (recoveryMessage()) {
          <p class="auth-recovery-message" role="status" aria-live="polite">
            {{ recoveryMessage() }}
          </p>
        }

        <p class="auth-switch">
          ¿Aún no tienes cuenta?
          <a routerLink="/register">Solicitar registro</a>
        </p>
        <a routerLink="/" class="auth-back">← Volver al portal institucional</a>
      </section>
    </main>
  `,
  styles: [
    `
      .auth-page {
        min-height: 100vh;
        display: grid;
        place-items: center;
        padding: 2rem 1rem;
        background:
          radial-gradient(ellipse at top left, rgba(2, 132, 199, 0.1), transparent 40%),
          var(--surface-bg, #f8fafc);
      }

      .auth-card {
        width: min(100%, 28rem);
        padding: clamp(1.5rem, 5vw, 2.5rem);
        background: var(--surface-card, #fff);
        border: 1px solid var(--border-color, #e2e8f0);
        border-radius: 1rem;
        box-shadow: 0 16px 48px rgba(15, 23, 42, 0.08);
      }

      .auth-brand {
        display: flex;
        justify-content: center;
        align-items: center;
        gap: 0.75rem;
        color: var(--text-primary, #0f172a);
        font-weight: 700;
      }

      .auth-brand img {
        width: 11rem;
        max-width: 100%;
        height: auto;
        object-fit: contain;
        border-radius: 0.5rem;
      }

      .auth-heading {
        margin: 2rem 0 1.5rem;
      }

      .auth-eyebrow {
        margin: 0 0 0.4rem;
        color: var(--primary, #0284c7);
        font-size: 0.8rem;
        font-weight: 700;
        letter-spacing: 0.06em;
        text-transform: uppercase;
      }

      h1 {
        margin: 0;
        font-size: clamp(1.7rem, 6vw, 2rem);
        line-height: 1.2;
      }

      .auth-heading > p:last-child {
        margin: 0.65rem 0 0;
        color: var(--text-secondary, #475569);
      }

      form {
        display: grid;
        gap: 0.55rem;
      }

      label {
        margin-top: 0.65rem;
        font-size: 0.9rem;
        font-weight: 600;
      }

      input {
        width: 100%;
        min-height: 2.9rem;
        padding: 0.7rem 0.8rem;
        border: 1px solid var(--border-color, #e2e8f0);
        border-radius: 0.5rem;
        font: inherit;
      }

      input:focus {
        outline: 3px solid rgba(56, 189, 248, 0.25);
        border-color: var(--border-focus, #38bdf8);
      }

      input[aria-invalid='true'] {
        border-color: var(--danger, #dc2626);
      }

      .field-error {
        color: var(--danger, #dc2626);
        font-size: 0.82rem;
      }

      .auth-text-button {
        justify-self: start;
        padding: 0;
        border: 0;
        background: none;
        color: var(--primary, #0284c7);
        font: inherit;
        font-size: 0.9rem;
        cursor: pointer;
      }

      .auth-recovery-note,
      .auth-recovery-message {
        margin: 0.75rem 0 0;
        color: var(--text-secondary, #475569);
        font-size: 0.9rem;
        line-height: 1.5;
      }

      .auth-recovery-message {
        color: #166534;
      }

      .auth-submit {
        min-height: 3rem;
        margin-top: 1rem;
        border: 0;
        border-radius: 0.5rem;
        background: var(--primary, #0284c7);
        color: white;
        font: inherit;
        font-weight: 700;
        cursor: pointer;
      }

      .auth-submit:hover:not(:disabled) {
        background: var(--primary-hover, #0369a1);
      }

      .auth-submit:disabled {
        opacity: 0.65;
        cursor: wait;
      }

      .auth-alert {
        margin-bottom: 1rem;
        padding: 0.8rem 1rem;
        border: 1px solid #fecaca;
        border-radius: 0.5rem;
        background: #fef2f2;
        color: #991b1b;
        font-size: 0.9rem;
      }

      .auth-switch,
      .auth-back {
        display: block;
        margin: 1.5rem 0 0;
        text-align: center;
        font-size: 0.9rem;
      }

      .auth-back {
        margin-top: 1rem;
        color: var(--text-secondary, #475569);
      }
    `,
  ],
})
export class LoginComponent {
  private readonly formBuilder = inject(FormBuilder);
  private readonly session = inject(SessionStore);
  private readonly router = inject(Router);

  readonly loading = signal(false);
  readonly errorMessage = signal('');
  readonly recovering = signal(false);
  readonly recoveryMessage = signal('');
  readonly form = this.formBuilder.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', Validators.required],
  });

  async submit(): Promise<void> {
    this.errorMessage.set('');
    this.recoveryMessage.set('');
    if (this.recovering()) {
      const emailControl = this.form.controls.email;
      if (emailControl.invalid) {
        emailControl.markAsTouched();
        return;
      }

      this.loading.set(true);
      try {
        await this.session.sendPasswordResetEmail(emailControl.value.trim());
        this.recoveryMessage.set(
          'Si la cuenta existe, enviaremos instrucciones para restablecer la contraseña.',
        );
      } catch (error) {
        if (this.getAuthErrorCode(error) === 'auth/user-not-found') {
          this.recoveryMessage.set(
            'Si la cuenta existe, enviaremos instrucciones para restablecer la contraseña.',
          );
        } else {
          this.errorMessage.set(getAuthErrorMessage(error));
        }
      } finally {
        this.loading.set(false);
      }
      return;
    }

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.loading.set(true);
    try {
      const { email, password } = this.form.getRawValue();
      await this.session.login(email.trim(), password);
      await this.router.navigate([
        this.session.currentUser()?.status === 'active' ? '/dashboard' : '/pending',
      ]);
    } catch (error) {
      this.errorMessage.set(getAuthErrorMessage(error));
    } finally {
      this.loading.set(false);
    }
  }

  startPasswordRecovery(): void {
    this.recoveryMessage.set('');
    this.errorMessage.set('');
    this.recovering.set(true);
  }

  cancelPasswordRecovery(): void {
    this.recovering.set(false);
    this.recoveryMessage.set('');
    this.errorMessage.set('');
  }

  private getAuthErrorCode(error: unknown): string {
    return typeof error === 'object' &&
      error !== null &&
      'code' in error &&
      typeof error.code === 'string'
      ? error.code
      : '';
  }
}
