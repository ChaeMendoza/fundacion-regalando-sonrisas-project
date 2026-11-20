import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { LandingComponent } from './landing.component';

describe('LandingComponent', () => {
  let fixture: ComponentFixture<LandingComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LandingComponent],
      providers: [provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(LandingComponent);
    fixture.detectChanges();
  });

  it('should render the landing title and organization name', () => {
    const element = fixture.nativeElement as HTMLElement;
    expect(element.querySelector('.hero__title')?.textContent).toContain('Sembrando esperanza');
    expect(element.textContent).toContain('Fundación Regalando Sonrisas');
  });

  it('should display the core action pillars', () => {
    const element = fixture.nativeElement as HTMLElement;
    const cards = element.querySelectorAll('.pillar-card');
    expect(cards.length).toBe(4);
  });

  it('should direct system access to the login page', () => {
    const element = fixture.nativeElement as HTMLElement;
    const enterButtons = element.querySelectorAll('a[href="/login"]');
    expect(enterButtons.length).toBeGreaterThan(0);
  });

  it('links both legal documents from the public footer', () => {
    const element = fixture.nativeElement as HTMLElement;
    const footer = element.querySelector('.landing-footer');

    expect(footer?.querySelector('a[href="/terminos-y-condiciones"]')?.textContent).toContain(
      'Términos y Condiciones de Uso',
    );
    expect(footer?.querySelector('a[href="/politica-de-privacidad"]')?.textContent).toContain(
      'Política de Privacidad',
    );
  });
});
