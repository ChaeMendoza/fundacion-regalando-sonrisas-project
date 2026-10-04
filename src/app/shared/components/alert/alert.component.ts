import { Component, input } from '@angular/core';

export type AlertType = 'info' | 'warning' | 'success' | 'danger';

@Component({
  selector: 'app-alert',
  standalone: true,
  template: `
    <div class="alert" [class]="'alert--' + type()" role="alert">
      <div class="alert__icon" aria-hidden="true">
        @switch (type()) {
          @case ('info') {
            <svg viewBox="0 0 20 20" fill="currentColor" width="20" height="20">
              <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd" />
            </svg>
          }
          @case ('warning') {
            <svg viewBox="0 0 20 20" fill="currentColor" width="20" height="20">
              <path fill-rule="evenodd" d="M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.17 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 2.495zM10 5a.75.75 0 01.75.75v3.5a.75.75 0 01-1.5 0v-3.5A.75.75 0 0110 5zm0 9a1 1 0 100-2 1 1 0 000 2z" clip-rule="evenodd" />
            </svg>
          }
          @case ('success') {
            <svg viewBox="0 0 20 20" fill="currentColor" width="20" height="20">
              <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" clip-rule="evenodd" />
            </svg>
          }
          @case ('danger') {
            <svg viewBox="0 0 20 20" fill="currentColor" width="20" height="20">
              <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z" clip-rule="evenodd" />
            </svg>
          }
        }
      </div>
      <div class="alert__content">
        @if (title()) {
          <h4 class="alert__title">{{ title() }}</h4>
        }
        <div class="alert__body">
          <ng-content />
        </div>
      </div>
    </div>
  `,
  styles: [`
    .alert {
      display: flex;
      gap: 0.75rem;
      padding: 0.875rem 1.125rem;
      border-radius: 0.5rem;
      margin-bottom: 1rem;
      font-size: 0.875rem;
      line-height: 1.45;

      &__icon {
        flex-shrink: 0;
        margin-top: 0.125rem;
      }

      &__content {
        flex: 1;
      }

      &__title {
        font-weight: 600;
        margin: 0 0 0.25rem 0;
        font-size: 0.875rem;
      }

      &__body {
        margin: 0;
      }

      &--info {
        background-color: #eff6ff;
        color: #1e40af;
        border-left: 4px solid #3b82f6;
      }

      &--warning {
        background-color: #fffbeb;
        color: #92400e;
        border-left: 4px solid #f59e0b;
      }

      &--success {
        background-color: #f0fdf4;
        color: #166534;
        border-left: 4px solid #22c55e;
      }

      &--danger {
        background-color: #fef2f2;
        color: #991b1b;
        border-left: 4px solid #ef4444;
      }
    }
  `],
})
export class AlertComponent {
  readonly type = input<AlertType>('info');
  readonly title = input<string>('');
}
