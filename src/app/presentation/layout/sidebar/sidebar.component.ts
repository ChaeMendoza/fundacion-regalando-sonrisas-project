import { Component, computed, inject, input, output } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { SessionStore } from '../../state/session.store';

interface NavItem {
  path: string;
  label: string;
  icon: string;
  adminOnly?: boolean;
}

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive],
  template: `
    <nav class="sidebar-nav" [class.sidebar-nav--collapsed]="collapsed()">
      <div class="sidebar-nav__header">
        <a routerLink="/" class="sidebar-nav__brand" title="Volver al sitio público">
          <div class="sidebar-nav__logo-wrap">
            <img
              src="images/logo-fundacion.jpg"
              alt="Logo Fundación Regalando Sonrisas"
              class="sidebar-nav__logo-img"
            />
          </div>
          <div class="sidebar-nav__brand-info">
            <span class="sidebar-nav__title">Regalando Sonrisas</span>
            <span class="sidebar-nav__subtitle">Sistema de Gestión</span>
          </div>
        </a>

        <button
          type="button"
          class="sidebar-nav__collapse-btn"
          (click)="toggleCollapse()"
          [attr.aria-label]="collapsed() ? 'Expandir menú lateral' : 'Colapsar menú lateral'"
          [attr.aria-expanded]="!collapsed()"
        >
          <svg
            class="sidebar-nav__collapse-icon"
            viewBox="0 0 20 20"
            fill="none"
            stroke="currentColor"
            stroke-width="1.8"
            width="16"
            height="16"
            aria-hidden="true"
          >
            <path stroke-linecap="round" stroke-linejoin="round" d="M12.5 15 7.5 10l5-5" />
          </svg>
        </button>
      </div>

      <ul class="sidebar-nav__list">
        @for (item of visibleNavItems(); track item.path) {
          <li
            class="sidebar-nav__item"
            [class.sidebar-nav__item--external]="item.path === '/'"
          >
            <a
              [routerLink]="item.path"
              routerLinkActive="sidebar-nav__link--active"
              [routerLinkActiveOptions]="{ exact: true }"
              ariaCurrentWhenActive="page"
              class="sidebar-nav__link"
              [class.sidebar-nav__link--external]="item.path === '/'"
              [attr.data-tooltip]="item.label"
              (click)="onLinkClick()"
            >
              <span class="sidebar-nav__icon" aria-hidden="true" [innerHTML]="item.icon"></span>
              <span class="sidebar-nav__label">{{ item.label }}</span>
            </a>
          </li>
        }
      </ul>

      <div class="sidebar-nav__footer">
        <span class="sidebar-nav__status-dot"></span>
        <span class="sidebar-nav__status-text">Base Técnica v0.1.0</span>
      </div>
    </nav>
  `,
  styles: [
    `
      .sidebar-nav {
        display: flex;
        flex-direction: column;
        height: 100%;
        padding: 1.25rem 0.875rem;
        background: var(--sidebar-bg, #101b33);
        color: var(--sidebar-text, #dbe3f5);
        user-select: none;
        overflow-x: hidden;

        &__header {
          position: relative;
          display: flex;
          align-items: center;
          justify-content: space-between;
          min-height: 3rem;
          padding-bottom: 1.25rem;
          margin-bottom: 1.25rem;
          border-bottom: 1px solid var(--sidebar-border, rgba(255, 255, 255, 0.1));
        }

        &__brand {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          min-width: 0;
          text-decoration: none;
        }

        &__logo-wrap {
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          width: 3rem;
          height: 2.25rem;
          padding: 0.125rem 0.25rem;
          border-radius: 10px;
          background: #ffffff;
          transition:
            width var(--sidebar-duration, 240ms) var(--sidebar-ease, ease),
            height var(--sidebar-duration, 240ms) var(--sidebar-ease, ease);
        }

        &__logo-img {
          width: 100%;
          height: 100%;
          object-fit: contain;
        }

        &__brand-info {
          display: flex;
          flex-direction: column;
          min-width: 0;
          max-width: 200px;
          overflow: hidden;
          transition:
            opacity var(--sidebar-duration, 240ms) var(--sidebar-ease, ease),
            max-width var(--sidebar-duration, 240ms) var(--sidebar-ease, ease);
        }

        &__title {
          color: #ffffff;
          font-weight: 700;
          font-size: 0.9375rem;
          line-height: 1.2;
          white-space: nowrap;
        }

        &__subtitle {
          color: var(--sidebar-text-muted, #9aa8c6);
          font-size: 0.75rem;
          white-space: nowrap;
        }

        &__collapse-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          flex: none;
          width: 2rem;
          height: 2rem;
          border: 1px solid var(--sidebar-border, rgba(255, 255, 255, 0.1));
          border-radius: 8px;
          background: rgba(255, 255, 255, 0.06);
          color: var(--sidebar-text-muted, #9aa8c6);
          cursor: pointer;
          transition:
            background-color 0.2s var(--sidebar-ease, ease),
            color 0.2s var(--sidebar-ease, ease);

          &:hover {
            background: rgba(255, 255, 255, 0.14);
            color: #ffffff;
          }

          &:focus-visible {
            outline: 2px solid var(--sidebar-focus, #9aa7e8);
            outline-offset: 2px;
          }
        }

        &__collapse-icon {
          transition: transform var(--sidebar-duration, 240ms) var(--sidebar-ease, ease);
        }

        &__list {
          display: flex;
          flex: 1;
          flex-direction: column;
          gap: 0.25rem;
          padding: 0;
          margin: 0;
          list-style: none;
          overflow-y: auto;
          overflow-x: hidden;
        }

        &__item {
          position: relative;
        }

        &__item--external {
          margin-top: 0.25rem;
          padding-top: 0.75rem;
          border-top: 1px solid var(--sidebar-border, rgba(255, 255, 255, 0.1));
        }

        &__link {
          position: relative;
          display: flex;
          align-items: center;
          gap: 0.75rem;
          min-height: 44px;
          padding: 0.625rem 0.875rem;
          border-radius: var(--sidebar-radius, 12px);
          color: var(--sidebar-text, #dbe3f5);
          font-size: 0.875rem;
          font-weight: 500;
          text-decoration: none;
          transition:
            background-color 0.2s var(--sidebar-ease, ease),
            color 0.2s var(--sidebar-ease, ease);

          &:hover {
            background: var(--sidebar-hover, rgba(255, 255, 255, 0.07));
            color: #ffffff;
          }

          &:focus-visible {
            outline: 2px solid var(--sidebar-focus, #9aa7e8);
            outline-offset: 2px;
          }

          &--active {
            background: var(--sidebar-active, #2f4ba8);
            color: #ffffff;
            font-weight: 600;

            &::before {
              content: '';
              position: absolute;
              left: 0;
              top: 50%;
              width: 3px;
              height: 60%;
              transform: translateY(-50%);
              border-radius: 0 3px 3px 0;
              background: var(--sidebar-indicator, #8dc63f);
            }

            &:hover {
              background: var(--sidebar-active, #2f4ba8);
            }
          }

          &--external {
            border: 1px solid rgba(154, 167, 232, 0.3);
            background: transparent;
            color: var(--sidebar-accent-text, #c8d0f7);
            font-weight: 600;

            .sidebar-nav__icon::after {
              content: '↗';
              position: absolute;
              top: -0.3rem;
              right: -0.4rem;
              color: var(--sidebar-accent, #9aa7e8);
              font-size: 0.7rem;
            }

            &:hover {
              background: rgba(154, 167, 232, 0.12);
              color: #ffffff;
            }

            &.sidebar-nav__link--active {
              background: transparent;
              color: var(--sidebar-accent-text, #c8d0f7);

              &::before {
                display: none;
              }
            }
          }
        }

        &__icon {
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
          flex: none;
          width: 1.25rem;
          height: 1.25rem;
        }

        &__label {
          max-width: 200px;
          overflow: hidden;
          white-space: nowrap;
          transition:
            opacity var(--sidebar-duration, 240ms) var(--sidebar-ease, ease),
            max-width var(--sidebar-duration, 240ms) var(--sidebar-ease, ease);
        }

        &__footer {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding-top: 1rem;
          border-top: 1px solid var(--sidebar-border, rgba(255, 255, 255, 0.1));
          color: var(--sidebar-text-muted, #9aa8c6);
          font-size: 0.75rem;
        }

        &__status-dot {
          flex: none;
          width: 0.5rem;
          height: 0.5rem;
          border-radius: 50%;
          background: var(--sidebar-indicator, #8dc63f);
        }

        &__status-text {
          max-width: 200px;
          overflow: hidden;
          white-space: nowrap;
          transition:
            opacity var(--sidebar-duration, 240ms) var(--sidebar-ease, ease),
            max-width var(--sidebar-duration, 240ms) var(--sidebar-ease, ease);
        }

        /* Estado colapsado: solo íconos + tooltips */
        &--collapsed {
          .sidebar-nav__header {
            flex-direction: column;
            gap: 0.6rem;
          }

          .sidebar-nav__brand {
            justify-content: center;
          }

          .sidebar-nav__brand-info {
            opacity: 0;
            max-width: 0;
          }

          .sidebar-nav__collapse-icon {
            transform: rotate(180deg);
          }

          .sidebar-nav__link {
            justify-content: center;
            gap: 0;
            padding-inline: 0;
          }

          .sidebar-nav__label {
            opacity: 0;
            max-width: 0;
          }

          .sidebar-nav__footer {
            justify-content: center;
          }

          .sidebar-nav__status-text {
            opacity: 0;
            max-width: 0;
          }

          .sidebar-nav__link::after {
            content: attr(data-tooltip);
            position: absolute;
            left: calc(100% + 10px);
            top: 50%;
            z-index: 100;
            padding: 0.4rem 0.65rem;
            border-radius: 8px;
            background: #0b1224;
            box-shadow: 0 8px 20px rgba(0, 0, 0, 0.28);
            color: #ffffff;
            font-size: 0.75rem;
            font-weight: 600;
            white-space: nowrap;
            opacity: 0;
            pointer-events: none;
            transform: translateY(-50%) translateX(-4px);
            transition:
              opacity 0.18s var(--sidebar-ease, ease),
              transform 0.18s var(--sidebar-ease, ease);
          }

          .sidebar-nav__link:hover::after,
          .sidebar-nav__link:focus-visible::after {
            opacity: 1;
            transform: translateY(-50%) translateX(0);
          }
        }

        /* En móvil el sidebar es un drawer siempre expandido */
        @media (max-width: 1023px) {
          .sidebar-nav__collapse-btn {
            display: none;
          }

          .sidebar-nav--collapsed .sidebar-nav__header {
            flex-direction: row;
            gap: 0;
          }

          .sidebar-nav--collapsed .sidebar-nav__brand-info {
            opacity: 1;
            max-width: 200px;
          }

          .sidebar-nav--collapsed .sidebar-nav__link {
            justify-content: flex-start;
            gap: 0.75rem;
            padding-inline: 0.875rem;
          }

          .sidebar-nav--collapsed .sidebar-nav__label {
            opacity: 1;
            max-width: 200px;
          }

          .sidebar-nav--collapsed .sidebar-nav__footer {
            justify-content: flex-start;
          }

          .sidebar-nav--collapsed .sidebar-nav__status-text {
            opacity: 1;
            max-width: 200px;
          }

          .sidebar-nav--collapsed .sidebar-nav__link::after {
            display: none;
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
export class SidebarComponent {
  private readonly session = inject(SessionStore);
  readonly linkClicked = output<void>();
  readonly collapseToggled = output<void>();
  readonly collapsed = input(false);

  readonly navItems: NavItem[] = [
    {
      path: '/dashboard',
      label: 'Inicio / Dashboard',
      icon: '<svg viewBox="0 0 20 20" fill="currentColor" width="18" height="18"><path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z"/></svg>',
    },
    {
      path: '/',
      label: 'Portal Público Web',
      icon: '<svg viewBox="0 0 20 20" fill="currentColor" width="18" height="18"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM4.332 8.027a6.012 6.012 0 011.912-2.706C6.512 5.73 6.974 6 7.5 6A1.5 1.5 0 019 7.5V8a2 2 0 004 0 2 2 0 011.523-1.943A5.977 5.977 0 0116 10c0 .34-.028.675-.083 1H15a2 2 0 00-2 2v.183A5.99 5.99 0 0110 16c-.466 0-.92-.053-1.354-.154a1.5 1.5 0 01-.646-.846L7.5 13.5A1.5 1.5 0 006 12H4.5a2.5 2.5 0 01-.168-3.973z" clip-rule="evenodd"/></svg>',
    },
    {
      path: '/beneficiaries',
      label: 'Beneficiarios',
      icon: '<svg viewBox="0 0 20 20" fill="currentColor" width="18" height="18"><path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z"/></svg>',
    },
    {
      path: '/donations',
      label: 'Donaciones',
      icon: '<svg viewBox="0 0 20 20" fill="currentColor" width="18" height="18"><path fill-rule="evenodd" d="M5 5a3 3 0 015-2.236A3 3 0 0114.83 6H16a2 2 0 110 4h-5V9a1 1 0 10-2 0v1H4a2 2 0 110-4h1.17C5.06 5.687 5 5.35 5 5zm4 1V5a1 1 0 10-1.12 1H9zm2 0h1.12A1 1 0 1011 5v1zM4 12h5v6H6a2 2 0 01-2-2v-4zm7 6h5a2 2 0 002-2v-4h-7v6z" clip-rule="evenodd"/></svg>',
    },
    {
      path: '/volunteers',
      label: 'Voluntarios',
      icon: '<svg viewBox="0 0 20 20" fill="currentColor" width="18" height="18"><path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z"/></svg>',
    },
    {
      path: '/activities',
      label: 'Actividades',
      icon: '<svg viewBox="0 0 20 20" fill="currentColor" width="18" height="18"><path fill-rule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clip-rule="evenodd"/></svg>',
    },
    {
      path: '/documents',
      label: 'Gestión Documental',
      icon: '<svg viewBox="0 0 20 20" fill="currentColor" width="18" height="18"><path fill-rule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clip-rule="evenodd"/></svg>',
    },
    {
      path: '/reports',
      label: 'Reportes e Indicadores',
      icon: '<svg viewBox="0 0 20 20" fill="currentColor" width="18" height="18"><path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z"/></svg>',
    },
    {
      path: '/admin',
      label: 'Administración',
      adminOnly: true,
      icon: '<svg viewBox="0 0 20 20" fill="currentColor" width="18" height="18"><path fill-rule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clip-rule="evenodd"/></svg>',
    },
  ];

  readonly visibleNavItems = computed(() =>
    this.navItems.filter((item) => !item.adminOnly || this.session.isAdmin()),
  );

  toggleCollapse(): void {
    this.collapseToggled.emit();
  }

  onLinkClick(): void {
    this.linkClicked.emit();
  }
}
