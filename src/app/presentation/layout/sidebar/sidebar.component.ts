import {
  Component,
  HostListener,
  computed,
  inject,
  input,
  output,
  signal,
} from '@angular/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import {
  lucideBarChart3,
  lucideCalendarDays,
  lucideCircleHelp,
  lucideFolderOpen,
  lucideGlobe,
  lucideHandHeart,
  lucideLayoutDashboard,
  lucideSettings,
  lucideUserCheck,
  lucideUsers,
} from '@ng-icons/lucide';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { SessionStore } from '../../state/session.store';

/** Nombres registrados en `provideIcons`. Ningún ítem puede quedar sin ícono. */
const NAV_ICONS = {
  dashboard: 'lucideLayoutDashboard',
  public: 'lucideGlobe',
  beneficiaries: 'lucideUsers',
  donations: 'lucideHandHeart',
  volunteers: 'lucideUserCheck',
  activities: 'lucideCalendarDays',
  documents: 'lucideFolderOpen',
  reports: 'lucideBarChart3',
  admin: 'lucideSettings',
  fallback: 'lucideCircleHelp',
} as const;

type NavIconName = keyof typeof NAV_ICONS;

interface NavItem {
  path: string;
  label: string;
  icon: NavIconName;
  adminOnly?: boolean;
}

interface TooltipState {
  text: string;
  top: number;
  left: number;
}

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, NgIcon],
  providers: [
    provideIcons({
      lucideLayoutDashboard,
      lucideGlobe,
      lucideUsers,
      lucideHandHeart,
      lucideUserCheck,
      lucideCalendarDays,
      lucideFolderOpen,
      lucideBarChart3,
      lucideSettings,
      lucideCircleHelp,
    }),
  ],
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
          (mouseenter)="showTooltip($event, collapseTooltip())"
          (mouseleave)="hideTooltip()"
          (focus)="showTooltip($event, collapseTooltip())"
          (blur)="hideTooltip()"
        >
          <svg
            class="sidebar-nav__collapse-icon"
            viewBox="0 0 20 20"
            fill="none"
            stroke="currentColor"
            stroke-width="1.8"
            width="18"
            height="18"
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
              [attr.aria-label]="item.label"
              [attr.data-tooltip]="item.label"
              (mouseenter)="showTooltip($event, item.label)"
              (mouseleave)="hideTooltip()"
              (focus)="showTooltip($event, item.label)"
              (blur)="hideTooltip()"
              (click)="onLinkClick()"
            >
              <span class="sidebar-nav__icon" aria-hidden="true">
                <ng-icon [name]="iconFor(item)" size="18" strokeWidth="1.8" />
              </span>
              <span class="sidebar-nav__label">{{ item.label }}</span>
            </a>
          </li>
        }
      </ul>

      <div
        class="sidebar-nav__footer"
        title="Base Técnica v0.1.0"
        (mouseenter)="showTooltip($event, versionLabel)"
        (mouseleave)="hideTooltip()"
      >
        <span class="sidebar-nav__status-dot" aria-hidden="true"></span>
        <span class="sidebar-nav__status-text">{{ versionLabel }}</span>
      </div>

      @if (tooltip(); as tip) {
        <div
          class="sidebar-nav__tooltip"
          role="tooltip"
          [style.top.px]="tip.top"
          [style.left.px]="tip.left"
        >
          {{ tip.text }}
        </div>
      }
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
          width: 2.75rem;
          height: 2.75rem;
          border: 1px solid var(--sidebar-border, rgba(255, 255, 255, 0.1));
          border-radius: 10px;
          background: rgba(255, 255, 255, 0.08);
          color: var(--sidebar-accent-text, #c8d0f7);
          cursor: pointer;
          transition:
            background-color 0.2s var(--sidebar-ease, ease),
            color 0.2s var(--sidebar-ease, ease);

          &:hover {
            background: rgba(255, 255, 255, 0.16);
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

          ng-icon {
            display: block;
            line-height: 1;
          }
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

        /* Tooltip único, fijo y fuera del contenedor con scroll */
        &__tooltip {
          position: fixed;
          z-index: 100;
          transform: translateY(-50%);
          padding: 0.4rem 0.65rem;
          border-radius: 8px;
          background: #0b1224;
          box-shadow: 0 8px 20px rgba(0, 0, 0, 0.28);
          color: #ffffff;
          font-size: 0.75rem;
          font-weight: 600;
          white-space: nowrap;
          pointer-events: none;
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
        }

        /* En móvil el sidebar es un drawer siempre expandido */
        @media (max-width: 1023px) {
          .sidebar-nav__collapse-btn,
          .sidebar-nav__tooltip {
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
  readonly versionLabel = 'Base Técnica v0.1.0';
  readonly tooltip = signal<TooltipState | null>(null);

  readonly navItems: NavItem[] = [
    { path: '/dashboard', label: 'Inicio / Dashboard', icon: 'dashboard' },
    { path: '/', label: 'Portal Público Web', icon: 'public' },
    { path: '/beneficiaries', label: 'Beneficiarios', icon: 'beneficiaries' },
    { path: '/donations', label: 'Donaciones', icon: 'donations' },
    { path: '/volunteers', label: 'Voluntarios', icon: 'volunteers' },
    { path: '/activities', label: 'Actividades', icon: 'activities' },
    { path: '/documents', label: 'Gestión Documental', icon: 'documents' },
    { path: '/reports', label: 'Reportes e Indicadores', icon: 'reports' },
    { path: '/admin', label: 'Administración', icon: 'admin', adminOnly: true },
  ];

  readonly visibleNavItems = computed(() =>
    this.navItems.filter((item) => !item.adminOnly || this.session.isAdmin()),
  );

  readonly collapseTooltip = computed(() =>
    this.collapsed() ? 'Expandir menú lateral' : 'Colapsar menú lateral',
  );

  iconFor(item: NavItem): string {
    return NAV_ICONS[item.icon] ?? NAV_ICONS.fallback;
  }

  showTooltip(event: Event, text: string): void {
    const target = event.currentTarget;
    if (!(target instanceof HTMLElement)) {
      return;
    }
    const rect = target.getBoundingClientRect();
    this.tooltip.set({
      text,
      top: rect.top + rect.height / 2,
      left: rect.right + 10,
    });
  }

  hideTooltip(): void {
    this.tooltip.set(null);
  }

  @HostListener('window:scroll')
  @HostListener('window:resize')
  onViewportChange(): void {
    this.hideTooltip();
  }

  toggleCollapse(): void {
    this.hideTooltip();
    this.collapseToggled.emit();
  }

  onLinkClick(): void {
    this.linkClicked.emit();
  }
}
