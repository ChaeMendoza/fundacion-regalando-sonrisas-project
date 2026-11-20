import { TestBed } from '@angular/core/testing';
import { ActivatedRoute, provideRouter } from '@angular/router';
import { of } from 'rxjs';
import { LegalDocumentComponent } from './legal-document.component';

describe('LegalDocumentComponent', () => {
  const renderDocument = async (key: 'terms' | 'privacy') => {
    await TestBed.configureTestingModule({
      imports: [LegalDocumentComponent],
      providers: [
        provideRouter([]),
        {
          provide: ActivatedRoute,
          useValue: {
            data: of({ legalDocument: key }),
            snapshot: { data: { legalDocument: key } },
          },
        },
      ],
    }).compileComponents();

    const fixture = TestBed.createComponent(LegalDocumentComponent);
    fixture.detectChanges();
    return fixture.nativeElement as HTMLElement;
  };

  it('renderiza los términos con versión, fecha y secciones numeradas', async () => {
    TestBed.resetTestingModule();
    const element = await renderDocument('terms');
    const text = element.textContent ?? '';

    expect(text).toContain('Términos y Condiciones de Uso');
    expect(text).toContain('Versión: 1.0');
    expect(text).toContain('20 de noviembre de 2026');
    expect(text).toContain('1. Identificación y objeto de la plataforma');
    expect(text).toContain('16. Canales de contacto institucional');
  });

  it('renderiza la política de privacidad con las bases de legitimación', async () => {
    TestBed.resetTestingModule();
    const element = await renderDocument('privacy');
    const text = element.textContent ?? '';

    expect(text).toContain('Política de Privacidad y Tratamiento de Datos Personales');
    expect(text).toContain('Versión: 1.0');
    expect(text).toContain('6. Bases de legitimación aplicables a cada finalidad');
    expect(text).toContain('19. Datos de contacto del responsable');
    expect(element.querySelector('table')).not.toBeNull();
  });
});
