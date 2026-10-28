import { Component, input } from '@angular/core';

@Component({
  selector: 'app-stat-card',
  standalone: true,
  template: `
    <article class="stat-card">
      <div class="stat-card__header">
        <span class="stat-card__label">{{ label() }}</span>
        @if (tag()) {
          <span class="stat-card__tag">{{ tag() }}</span>
        }
      </div>
      <div class="stat-card__body">
        <span class="stat-card__value">{{ value() }}</span>
        @if (hint()) {
          <p class="stat-card__hint">{{ hint() }}</p>
        }
      </div>
    </article>
  `,
  styles: [`
    .stat-card {
      background: var(--surface-card, #ffffff);
      border: 1px solid var(--border-color, #e2e8f0);
      border-radius: 0.75rem;
      padding: 1.25rem;
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
      transition: transform 0.15s ease, box-shadow 0.15s ease;

      &:hover {
        box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.08);
      }

      &__header {
        display: flex;
        justify-content: space-between;
        align-items: center;
      }

      &__label {
        font-size: 0.8125rem;
        font-weight: 600;
        text-transform: uppercase;
        letter-spacing: 0.05em;
        color: var(--text-secondary, #64748b);
      }

      &__tag {
        font-size: 0.6875rem;
        font-weight: 500;
        padding: 0.125rem 0.5rem;
        border-radius: 9999px;
        background: #f1f5f9;
        color: #475569;
      }

      &__value {
        font-size: 1.875rem;
        font-weight: 700;
        color: var(--text-primary, #0f172a);
        line-height: 1;
      }

      &__hint {
        font-size: 0.75rem;
        color: var(--text-muted, #94a3b8);
        margin: 0.25rem 0 0 0;
      }
    }
  `],
})
export class StatCardComponent {
  readonly label = input.required<string>();
  readonly value = input.required<string | number>();
  readonly hint = input<string>('');
  readonly tag = input<string>('');
}
