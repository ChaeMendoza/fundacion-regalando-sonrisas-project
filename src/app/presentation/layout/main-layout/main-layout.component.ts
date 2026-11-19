import { Component, effect, HostListener, inject, signal } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { SidebarComponent } from '../sidebar/sidebar.component';
import { HeaderComponent } from '../header/header.component';
import { FooterComponent } from '../footer/footer.component';
import { SessionStore } from '../../state/session.store';

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [RouterOutlet, SidebarComponent, HeaderComponent, FooterComponent],
  template: `
    <div class="layout" [class.layout--sidebar-collapsed]="isSidebarCollapsed()">
      <!-- Backdrop para móvil cuando el menú está abierto -->
      @if (isMobileMenuOpen()) {
        <div class="layout__backdrop" aria-hidden="true" (click)="closeMobileMenu()"></div>
      }

      <!-- Barra lateral (Sidebar) -->
      <aside class="layout__sidebar" [class.layout__sidebar--open]="isMobileMenuOpen()">
        <app-sidebar
          [collapsed]="isSidebarCollapsed()"
          (collapseToggled)="toggleSidebarCollapse()"
          (linkClicked)="closeMobileMenu()"
        />
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
  styles: [
    `
      .layout {
        --sidebar-current-width: var(--sidebar-width-expanded, 260px);

        display: flex;
        min-height: 100vh;
        background-color: var(--surface-bg, #f8fafc);
        position: relative;

        &--sidebar-collapsed {
          --sidebar-current-width: var(--sidebar-width-collapsed, 76px);
        }

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
          width: var(--sidebar-current-width);
          z-index: 50;
          transform: translateX(-100%);
          transition:
            transform 0.25s cubic-bezier(0.4, 0, 0.2, 1),
            width var(--sidebar-duration, 240ms) var(--sidebar-ease, ease);

          @media (min-width: 1024px) {
            position: sticky;
            transform: none;
            height: 100vh;
          }

          /* En móvil el drawer siempre se muestra expandido */
          @media (max-width: 1023px) {
            width: var(--sidebar-width-expanded, 260px);

            &--open {
              transform: translateX(0);
            }
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

        @media (prefers-reduced-motion: reduce) {
          &,
          *,
          *::before,
          *::after {
            transition-duration: 0.01ms !important;
          }
        }
      }
    `,
  ],
})
export class MainLayoutComponent {
  private readonly session = inject(SessionStore);
  private readonly router = inject(Router);
  private readonly collapsedStorageKey = 'frs-sidebar-collapsed';
  readonly isMobileMenuOpen = signal(false);
  readonly isSidebarCollapsed = signal(this.readCollapsedPreference());

  constructor() {
    // Control reactivo de sesión activa: si un administrador deshabilita, rechaza
    // o revoca privilegios de una cuenta con sesión iniciada, se expulsa de inmediato.
    effect(() => {
      if (!this.session.isInitialized()) {
        return;
      }

      const user = this.session.currentUser();
      if (!user) {
        void this.router.navigate(['/login']);
        return;
      }

      if (!this.session.isApproved()) {
        void this.router.navigate(['/pending']);
        return;
      }

      if (this.router.url.startsWith('/admin') && !this.session.isAdmin()) {
        void this.router.navigate(['/dashboard']);
      }
    });
  }

  @HostListener('document:keydown', ['$event'])
  handleSidebarShortcut(event: KeyboardEvent): void {
    if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'b') {
      event.preventDefault();
      this.toggleSidebarCollapse();
    }
  }

  toggleSidebarCollapse(): void {
    const next = !this.isSidebarCollapsed();
    this.isSidebarCollapsed.set(next);
    try {
      localStorage.setItem(this.collapsedStorageKey, String(next));
    } catch {
      // Almacenamiento no disponible: el estado sigue funcionando en memoria.
    }
  }

  toggleMobileMenu(): void {
    this.isMobileMenuOpen.update((v) => !v);
  }

  closeMobileMenu(): void {
    this.isMobileMenuOpen.set(false);
  }

  private readCollapsedPreference(): boolean {
    try {
      return localStorage.getItem(this.collapsedStorageKey) === 'true';
    } catch {
      return false;
    }
  }
}
