import { Component, inject } from '@angular/core';
import { NotificationService } from '../../services/notification.service';

@Component({
  selector: 'app-toast-container',
  standalone: true,
  template: `
    <div class="toast-stack" aria-live="polite" aria-atomic="true">
      @for (item of notificationService.notifications(); track item.id) {
        <div class="toast" [class]="'toast toast--' + item.type" role="status">
          <div class="toast__body">
            <strong class="toast__title">{{ item.title }}</strong>
            <p class="toast__message">{{ item.message }}</p>
          </div>
          <button
            type="button"
            class="toast__close"
            aria-label="Cerrar notificación"
            (click)="notificationService.dismiss(item.id)"
          >
            &times;
          </button>
        </div>
      }
    </div>
  `,
  styles: [
    `
      .toast-stack {
        position: fixed;
        top: 4.75rem;
        right: 1rem;
        z-index: 90;
        display: flex;
        flex-direction: column;
        gap: 0.625rem;
        max-width: min(380px, calc(100vw - 2rem));
        pointer-events: none;
      }

      .toast {
        pointer-events: auto;
        display: flex;
        align-items: flex-start;
        justify-content: space-between;
        gap: 0.75rem;
        padding: 0.875rem 1rem;
        border-radius: 0.625rem;
        background: #ffffff;
        border: 1px solid var(--border-color, #e2e8f0);
        border-left-width: 4px;
        box-shadow: 0 10px 25px -5px rgba(15, 23, 42, 0.14);

        &--success {
          border-left-color: var(--success, #16a34a);
        }

        &--error {
          border-left-color: var(--danger, #dc2626);
        }

        &--warning {
          border-left-color: var(--warning, #d97706);
        }

        &--info {
          border-left-color: var(--info, #2563eb);
        }

        &__body {
          min-width: 0;
        }

        &__title {
          display: block;
          font-size: 0.875rem;
          font-weight: 700;
          color: var(--text-primary, #0f172a);
          margin-bottom: 0.125rem;
        }

        &__message {
          margin: 0;
          font-size: 0.8125rem;
          color: var(--text-secondary, #475569);
          line-height: 1.4;
        }

        &__close {
          background: transparent;
          border: none;
          color: var(--text-muted, #94a3b8);
          font-size: 1.25rem;
          line-height: 1;
          cursor: pointer;
          padding: 0 0.25rem;

          &:hover {
            color: var(--text-primary, #0f172a);
          }
        }
      }
    `,
  ],
})
export class ToastContainerComponent {
  readonly notificationService = inject(NotificationService);
}
