import { Component, input } from '@angular/core';

@Component({
  selector: 'app-empty-state',
  standalone: true,
  template: `
    <div class="empty-state">
      <div class="empty-state__icon" aria-hidden="true">
        <svg viewBox="0 0 24 24" width="48" height="48" fill="none" stroke="currentColor" stroke-width="1.5">
          <path stroke-linecap="round" stroke-linejoin="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" />
        </svg>
      </div>
      <h3 class="empty-state__title">{{ title() }}</h3>
      <p class="empty-state__description">{{ description() }}</p>
      <div class="empty-state__action">
        <ng-content />
      </div>
    </div>
  `,
  styles: [`
    .empty-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      text-align: center;
      padding: 3rem 1.5rem;
      border: 2px dashed var(--border-color, #e2e8f0);
      border-radius: 0.75rem;
      background: var(--surface-empty, #f8fafc);
      color: var(--text-secondary, #64748b);

      &__icon {
        color: var(--text-muted, #94a3b8);
        margin-bottom: 1rem;
      }

      &__title {
        font-size: 1.125rem;
        font-weight: 600;
        color: var(--text-primary, #0f172a);
        margin: 0 0 0.5rem 0;
      }

      &__description {
        font-size: 0.875rem;
        max-width: 28rem;
        margin: 0 0 1.25rem 0;
        line-height: 1.5;
      }

      &__action {
        display: flex;
        gap: 0.75rem;
      }
    }
  `],
})
export class EmptyStateComponent {
  readonly title = input.required<string>();
  readonly description = input.required<string>();
}
