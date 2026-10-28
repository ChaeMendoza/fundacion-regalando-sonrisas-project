import { Component, computed, input } from '@angular/core';

export type BadgeVariant = 'success' | 'warning' | 'danger' | 'info' | 'neutral';

@Component({
  selector: 'app-status-badge',
  standalone: true,
  template: `
    <span class="status-badge" [class]="'status-badge--' + variantClass()">
      <span class="status-badge__dot"></span>
      <span class="status-badge__text">{{ text() }}</span>
    </span>
  `,
  styles: [`
    .status-badge {
      display: inline-flex;
      align-items: center;
      gap: 0.375rem;
      padding: 0.25rem 0.625rem;
      border-radius: 9999px;
      font-size: 0.75rem;
      font-weight: 600;
      line-height: 1;

      &__dot {
        width: 0.375rem;
        height: 0.375rem;
        border-radius: 50%;
        background-color: currentColor;
      }

      &--success {
        background-color: #dcfce7;
        color: #15803d;
      }

      &--warning {
        background-color: #fef3c7;
        color: #b45309;
      }

      &--danger {
        background-color: #fee2e2;
        color: #b91c1c;
      }

      &--info {
        background-color: #e0f2fe;
        color: #0369a1;
      }

      &--neutral {
        background-color: #f1f5f9;
        color: #475569;
      }
    }
  `],
})
export class StatusBadgeComponent {
  readonly text = input.required<string>();
  readonly variant = input<BadgeVariant>('neutral');

  readonly variantClass = computed(() => this.variant());
}
