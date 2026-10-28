import { Component, input } from '@angular/core';

@Component({
  selector: 'app-page-header',
  standalone: true,
  template: `
    <header class="page-header">
      <div class="page-header__content">
        <div class="page-header__titles">
          <h1 class="page-header__title">{{ title() }}</h1>
          @if (subtitle()) {
            <p class="page-header__subtitle">{{ subtitle() }}</p>
          }
        </div>
        @if (badgeText()) {
          <span class="page-header__badge" [class]="'page-header__badge--' + badgeType()">
            {{ badgeText() }}
          </span>
        }
      </div>
      <div class="page-header__actions">
        <ng-content />
      </div>
    </header>
  `,
  styles: [`
    .page-header {
      display: flex;
      flex-direction: column;
      gap: 1rem;
      padding-bottom: 1.5rem;
      margin-bottom: 1.5rem;
      border-bottom: 1px solid var(--border-color, #e2e8f0);

      @media (min-width: 768px) {
        flex-direction: row;
        align-items: center;
        justify-content: space-between;
      }

      &__content {
        display: flex;
        align-items: flex-start;
        gap: 0.75rem;
        flex-wrap: wrap;
      }

      &__title {
        font-size: 1.5rem;
        font-weight: 700;
        color: var(--text-primary, #0f172a);
        margin: 0;
        line-height: 1.25;

        @media (min-width: 768px) {
          font-size: 1.875rem;
        }
      }

      &__subtitle {
        font-size: 0.875rem;
        color: var(--text-secondary, #64748b);
        margin: 0.25rem 0 0 0;
      }

      &__badge {
        display: inline-flex;
        align-items: center;
        font-size: 0.75rem;
        font-weight: 600;
        padding: 0.25rem 0.625rem;
        border-radius: 9999px;

        &--info {
          background-color: #e0f2fe;
          color: #0369a1;
        }

        &--warning {
          background-color: #fef3c7;
          color: #b45309;
        }

        &--success {
          background-color: #dcfce7;
          color: #15803d;
        }
      }

      &__actions {
        display: flex;
        align-items: center;
        gap: 0.75rem;
      }
    }
  `],
})
export class PageHeaderComponent {
  readonly title = input.required<string>();
  readonly subtitle = input<string>('');
  readonly badgeText = input<string>('');
  readonly badgeType = input<'info' | 'warning' | 'success'>('info');
}
