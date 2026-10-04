import { Component } from '@angular/core';

@Component({
  selector: 'app-footer',
  standalone: true,
  template: `
    <footer class="app-footer">
      <div class="app-footer__content">
        <p class="app-footer__text">
          Fundación Regalando Sonrisas — Quito, Ecuador &copy; {{ currentYear }}
        </p>
        <p class="app-footer__sub">
          Sistema de Gestión Integral &bull; Proyecto de Titulación
        </p>
      </div>
    </footer>
  `,
  styles: [`
    .app-footer {
      background-color: var(--surface-card, #ffffff);
      border-top: 1px solid var(--border-color, #e2e8f0);
      padding: 1.25rem;
      margin-top: auto;
      text-align: center;

      &__content {
        display: flex;
        flex-direction: column;
        gap: 0.25rem;
        font-size: 0.8125rem;
        color: var(--text-secondary, #64748b);
      }

      &__text {
        margin: 0;
        font-weight: 500;
      }

      &__sub {
        margin: 0;
        font-size: 0.75rem;
        color: var(--text-muted, #94a3b8);
      }
    }
  `],
})
export class FooterComponent {
  readonly currentYear = new Date().getFullYear();
}
