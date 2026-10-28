import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { SidebarComponent } from '../sidebar/sidebar.component';
import { HeaderComponent } from '../header/header.component';
import { FooterComponent } from '../footer/footer.component';

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [RouterOutlet, SidebarComponent, HeaderComponent, FooterComponent],
  template: `
    <div class="layout">
      <!-- Backdrop para móvil cuando el menú está abierto -->
      @if (isMobileMenuOpen()) {
        <div
          class="layout__backdrop"
          aria-hidden="true"
          (click)="closeMobileMenu()"
        ></div>
      }

      <!-- Barra lateral (Sidebar) -->
      <aside
        class="layout__sidebar"
        [class.layout__sidebar--open]="isMobileMenuOpen()"
      >
        <app-sidebar (linkClicked)="closeMobileMenu()" />
      </aside>

      <!-- Contenedor Principal -->
      <div class="layout__main">
        <app-header (toggleMenu)="toggleMobileMenu()" />

        <main class="layout__content">
          <router-outlet />
        </main>

        <app-footer />
      </div>
    </div>
  `,
  styles: [`
    .layout {
      display: flex;
      min-height: 100vh;
      background-color: var(--surface-bg, #f8fafc);
      position: relative;

      &__backdrop {
        position: fixed;
        inset: 0;
        background-color: rgba(15, 23, 42, 0.5);
        z-index: 40;
        backdrop-filter: blur(2px);

        @media (min-width: 1024px) {
          display: none;
        }
      }

      &__sidebar {
        position: fixed;
        top: 0;
        bottom: 0;
        left: 0;
        width: var(--sidebar-width, 260px);
        z-index: 50;
        transform: translateX(-100%);
        transition: transform 0.25s cubic-bezier(0.4, 0, 0.2, 1);

        @media (min-width: 1024px) {
          position: sticky;
          transform: translateX(0);
          height: 100vh;
        }

        &--open {
          transform: translateX(0);
        }
      }

      &__main {
        flex: 1;
        display: flex;
        flex-direction: column;
        min-width: 0;
      }

      &__content {
        flex: 1;
        padding: 1.25rem;
        max-width: 1400px;
        width: 100%;
        margin: 0 auto;

        @media (min-width: 768px) {
          padding: 2rem;
        }
      }
    }
  `],
})
export class MainLayoutComponent {
  readonly isMobileMenuOpen = signal(false);

  toggleMobileMenu(): void {
    this.isMobileMenuOpen.update((v) => !v);
  }

  closeMobileMenu(): void {
    this.isMobileMenuOpen.set(false);
  }
}
