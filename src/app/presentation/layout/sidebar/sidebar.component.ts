import { Component, output } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';

interface NavItem {
  path: string;
  label: string;
  icon: string;
}

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive],
  template: `
    <nav class="sidebar-nav">
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

      <ul class="sidebar-nav__list">
        @for (item of navItems; track item.path) {
          <li class="sidebar-nav__item">
            <a
              [routerLink]="item.path"
              routerLinkActive="sidebar-nav__link--active"
              class="sidebar-nav__link"
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
  styles: [`
    .sidebar-nav {
      display: flex;
      flex-direction: column;
      height: 100%;
      background: #0f172a; /* Slate 900 */
      color: #f8fafc;
      padding: 1.25rem 1rem;
      user-select: none;

      &__brand {
        display: flex;
        align-items: center;
        gap: 0.75rem;
        padding-bottom: 1.5rem;
        border-bottom: 1px solid #1e293b;
        margin-bottom: 1.25rem;
      }

      &__logo-wrap {
        width: 3rem;
        height: 2.25rem;
        background: #ffffff;
        border-radius: 0.375rem;
        padding: 0.125rem 0.25rem;
        display: flex;
        align-items: center;
        justify-content: center;
        flex-shrink: 0;
      }

      &__logo-img {
        width: 100%;
        height: 100%;
        object-fit: contain;
      }

      &__brand-info {
        display: flex;
        flex-direction: column;
      }

      &__title {
        font-weight: 700;
        font-size: 0.9375rem;
        line-height: 1.2;
      }

      &__subtitle {
        font-size: 0.75rem;
        color: #94a3b8;
      }

      &__list {
        list-style: none;
        margin: 0;
        padding: 0;
        display: flex;
        flex-direction: column;
        gap: 0.25rem;
        flex: 1;
        overflow-y: auto;
      }

      &__link {
        display: flex;
        align-items: center;
        gap: 0.75rem;
        padding: 0.625rem 0.875rem;
        border-radius: 0.5rem;
        color: #cbd5e1;
        font-size: 0.875rem;
        font-weight: 500;
        text-decoration: none;
        transition: background-color 0.15s ease, color 0.15s ease;

        &:hover {
          background-color: #1e293b;
          color: #ffffff;
        }

        &--active {
          background-color: #0284c7;
          color: #ffffff !important;
          font-weight: 600;
        }
      }

      &__icon {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 1.25rem;
        height: 1.25rem;
      }

      &__footer {
        padding-top: 1rem;
        border-top: 1px solid #1e293b;
        display: flex;
        align-items: center;
        gap: 0.5rem;
        font-size: 0.75rem;
        color: #64748b;
      }

      &__status-dot {
        width: 0.5rem;
        height: 0.5rem;
        border-radius: 50%;
        background-color: #22c55e;
      }
    }
  `],
})
export class SidebarComponent {
  readonly linkClicked = output<void>();

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
      icon: '<svg viewBox="0 0 20 20" fill="currentColor" width="18" height="18"><path fill-rule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clip-rule="evenodd"/></svg>',
    },
  ];

  onLinkClick(): void {
    this.linkClicked.emit();
  }
}
