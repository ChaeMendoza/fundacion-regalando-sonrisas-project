import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

interface Pillar {
  icon: string;
  title: string;
  description: string;
  color: string;
}

@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [RouterLink],
  template: `
    <div class="landing">
      <!-- Barra de Navegación Pública -->
      <header class="landing-nav">
        <div class="landing-nav__container">
          <a routerLink="/" class="landing-nav__brand">
            <img
              src="images/logo-fundacion.jpg"
              alt="Logo Fundación Regalando Sonrisas"
              class="landing-nav__logo"
            />
            <div class="landing-nav__brand-text">
              <span class="landing-nav__name">Fundación Regalando Sonrisas</span>
              <span class="landing-nav__city">Quito, Ecuador</span>
            </div>
          </a>

          <nav class="landing-nav__links">
            <a href="#sobre-nosotros" class="landing-nav__link">Sobre la Fundación</a>
            <a href="#ejes-de-accion" class="landing-nav__link">Ejes de Acción</a>
            <a href="#transparencia" class="landing-nav__link">Transparencia</a>
            <a routerLink="/dashboard" class="landing-nav__btn">
              <span>Ingresar al Sistema</span>
              <svg viewBox="0 0 20 20" fill="currentColor" width="16" height="16">
                <path fill-rule="evenodd" d="M3 10a.75.75 0 01.75-.75h10.638L10.23 5.29a.75.75 0 111.04-1.08l5.5 5.25a.75.75 0 010 1.08l-5.5 5.25a.75.75 0 11-1.04-1.08l4.158-3.96H3.75A.75.75 0 013 10z" clip-rule="evenodd"/>
              </svg>
            </a>
          </nav>
        </div>
      </header>

      <!-- Hero Section -->
      <section class="hero">
        <div class="hero__container">
          <div class="hero__content">
            <div class="hero__badge">
              <span class="hero__badge-dot"></span>
              <span>Organización Sin Fines de Lucro &bull; Quito, Ecuador</span>
            </div>

            <h1 class="hero__title">
              Sembrando esperanza y transformando vidas con <span class="highlight-text">solidaridad</span>
            </h1>

            <p class="hero__description">
              En la <strong>Fundación Regalando Sonrisas</strong> trabajamos activamente por el bienestar,
              la inclusión y el apoyo integral a familias y personas en situación de vulnerabilidad en Quito.
              Centralizamos nuestra gestión para garantizar un servicio humano, transparente y eficiente.
            </p>

            <div class="hero__actions">
              <a routerLink="/dashboard" class="btn-primary-hero">
                <span>Acceder al Sistema de Gestión</span>
                <svg viewBox="0 0 20 20" fill="currentColor" width="18" height="18">
                  <path fill-rule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clip-rule="evenodd"/>
                </svg>
              </a>
              <a href="#ejes-de-accion" class="btn-secondary-hero">
                Conocer Nuestra Labor
              </a>
            </div>

            <!-- Datos Clave Institucionales -->
            <div class="hero__stats">
              <div class="hero__stat-item">
                <span class="hero__stat-value">Quito</span>
                <span class="hero__stat-label">Sede de operaciones</span>
              </div>
              <div class="hero__stat-divider"></div>
              <div class="hero__stat-item">
                <span class="hero__stat-value">100%</span>
                <span class="hero__stat-label">Compromiso solidario</span>
              </div>
              <div class="hero__stat-divider"></div>
              <div class="hero__stat-item">
                <span class="hero__stat-value">Trazable</span>
                <span class="hero__stat-label">Gestión y respaldo</span>
              </div>
            </div>
          </div>

          <!-- Columna Visual del Logo y Presentación -->
          <div class="hero__visual">
            <div class="logo-card">
              <div class="logo-card__inner">
                <img
                  src="images/logo-fundacion.jpg"
                  alt="Fundación Regalando Sonrisas"
                  class="logo-card__image"
                />
              </div>

              <!-- Tarjetas flotantes contextuales -->
              <div class="floating-badge floating-badge--top">
                <span class="floating-badge__icon">🤝</span>
                <div>
                  <strong>Voluntariado Activo</strong>
                  <small>Vocación de servicio</small>
                </div>
              </div>

              <div class="floating-badge floating-badge--bottom">
                <span class="floating-badge__icon">📋</span>
                <div>
                  <strong>Gestión Integral</strong>
                  <small>Trazabilidad y respaldo</small>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- Sección: Sobre la Fundación -->
      <section id="sobre-nosotros" class="about-section">
        <div class="section-container">
          <div class="section-header">
            <span class="section-badge">Nuestra Misión</span>
            <h2 class="section-title">Una labor con corazón y compromiso comunitario</h2>
            <p class="section-subtitle">
              Nacimos para brindar ayuda efectiva y digna a personas en condiciones de vulnerabilidad,
              fomentando la solidaridad y la participación ciudadana en la capital ecuatoriana.
            </p>
          </div>

          <div class="about-grid">
            <div class="about-card">
              <div class="about-card__icon" style="background-color: #e0f2fe; color: #0284c7;">
                💙
              </div>
              <h3 class="about-card__title">Atención Humana y Cercana</h3>
              <p class="about-card__text">
                Realizamos seguimiento directo a las necesidades de cada familia y beneficiario,
                promoviendo la empatía, el respeto y la dignidad como pilares fundamentales.
              </p>
            </div>

            <div class="about-card">
              <div class="about-card__icon" style="background-color: #dcfce7; color: #16a34a;">
                🌱
              </div>
              <h3 class="about-card__title">Canalización Transparente</h3>
              <p class="about-card__text">
                Cada aporte, donación de alimentos o enseres es registrado con respaldo documental
                y comprobantes que verifican su llegada a los destinatarios finales.
              </p>
            </div>

            <div class="about-card">
              <div class="about-card__icon" style="background-color: #fee2e2; color: #e11d48;">
                ✨
              </div>
              <h3 class="about-card__title">Acción Colectiva</h3>
              <p class="about-card__text">
                Coordinamos una red solidaria de voluntarios y colaboradores que donan su tiempo,
                conocimiento y esfuerzo en jornadas sociales y educativas continuas.
              </p>
            </div>
          </div>
        </div>
      </section>

      <!-- Sección: Ejes de Acción -->
      <section id="ejes-de-accion" class="pillars-section">
        <div class="section-container">
          <div class="section-header">
            <span class="section-badge">Qué Hacemos</span>
            <h2 class="section-title">Ejes Principales de Nuestra Acción Institucional</h2>
            <p class="section-subtitle">
              Estructuramos nuestras actividades para atender áreas clave de desarrollo y bienestar comunitario.
            </p>
          </div>

          <div class="pillars-grid">
            @for (pillar of pillars; track pillar.title) {
              <div class="pillar-card">
                <div class="pillar-card__icon-wrap" [style.background-color]="pillar.color">
                  <span class="pillar-card__icon">{{ pillar.icon }}</span>
                </div>
                <h3 class="pillar-card__title">{{ pillar.title }}</h3>
                <p class="pillar-card__desc">{{ pillar.description }}</p>
              </div>
            }
          </div>
        </div>
      </section>

      <!-- Sección: Transparencia y Sistema de Gestión -->
      <section id="transparencia" class="system-section">
        <div class="section-container">
          <div class="system-box">
            <div class="system-box__content">
              <span class="system-box__badge">Innovación y Gobernanza</span>
              <h2 class="system-box__title">Evolucionando hacia una gestión digital centralizada</h2>
              <p class="system-box__text">
                Para superar los desafíos de información dispersa en hojas de cálculo y documentos físicos,
                la Fundación ha implementado este <strong>Sistema de Gestión Integral</strong>.
                La plataforma garantiza que cada beneficiario, donación y actividad cuente con historial
                inmutable, auditoría de operaciones y estricta protección de datos personales.
              </p>
              <div class="system-box__features">
                <div class="system-feature">
                  <span class="system-feature__check">✓</span>
                  <span>Trazabilidad completa de donaciones y respaldos</span>
                </div>
                <div class="system-feature">
                  <span class="system-feature__check">✓</span>
                  <span>Ficha familiar y seguimiento de beneficiarios</span>
                </div>
                <div class="system-feature">
                  <span class="system-feature__check">✓</span>
                  <span>Control de voluntariado y jornadas en Quito</span>
                </div>
                <div class="system-feature">
                  <span class="system-feature__check">✓</span>
                  <span>Seguridad en la nube con Cloud Firestore y Storage</span>
                </div>
              </div>
              <div class="system-box__actions">
                <a routerLink="/dashboard" class="btn-primary-hero">
                  Acceso para Colaboradores y Personal
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- Pie de Página Público -->
      <footer class="landing-footer">
        <div class="landing-footer__container">
          <div class="landing-footer__brand">
            <div class="landing-footer__logo-wrap">
              <img
                src="images/logo-fundacion.jpg"
                alt="Logo Fundación Regalando Sonrisas"
                class="landing-footer__logo"
              />
            </div>
            <p class="landing-footer__tagline">
              Organización sin fines de lucro comprometida con el bienestar y la dignidad de las familias en Quito, Ecuador.
            </p>
          </div>

          <div class="landing-footer__col">
            <h4 class="landing-footer__title">Navegación</h4>
            <ul class="landing-footer__list">
              <li><a href="#sobre-nosotros">Sobre la Fundación</a></li>
              <li><a href="#ejes-de-accion">Ejes de Acción</a></li>
              <li><a href="#transparencia">Transparencia</a></li>
              <li><a routerLink="/dashboard">Sistema Interno</a></li>
            </ul>
          </div>

          <div class="landing-footer__col">
            <h4 class="landing-footer__title">Ubicación y Alcance</h4>
            <p class="landing-footer__info">
              <strong>Sede:</strong> Quito, Ecuador<br />
              <strong>Ámbito:</strong> Asistencial, Comunitario y Social<br />
              <strong>Plataforma:</strong> Sistema de Gestión Integral
            </p>
          </div>
        </div>

        <div class="landing-footer__bottom">
          <p>
            &copy; {{ currentYear }} Fundación Regalando Sonrisas &bull; Quito, Ecuador. Todos los derechos reservados.
          </p>
          <p class="landing-footer__academic">
            Proyecto de Titulación &bull; <a href="https://github.com/ChaeMendoza" target="_blank">Chae Mendoza</a>
          </p>
        </div>
      </footer>
    </div>
  `,
  styleUrl: './landing.component.scss',
})
export class LandingComponent {
  readonly currentYear = new Date().getFullYear();

  readonly pillars: Pillar[] = [
    {
      title: 'Beneficiarios y Familias',
      description: 'Atención integral, relevamiento de necesidades prioritarias y dignificación de hogares en situación de vulnerabilidad.',
      icon: '👨‍👩‍👧',
      color: '#e0f2fe',
    },
    {
      title: 'Donaciones con Trazabilidad',
      description: 'Recepción y entrega de aportes en especies, víveres y enseres con registro transparente de comprobantes y destinatarios.',
      icon: '📦',
      color: '#dcfce7',
    },
    {
      title: 'Red de Voluntarios',
      description: 'Convocatoria y organización de voluntarios comprometidos con el servicio solidario y jornadas en distintos sectores de Quito.',
      icon: '🤝',
      color: '#fef3c7',
    },
    {
      title: 'Actividades Comunitarias',
      description: 'Eventos educativos, jornadas de integración social y campañas de recolección para llevar sonrisas a los sectores más necesitados.',
      icon: '🎈',
      color: '#fee2e2',
    },
  ];
}
