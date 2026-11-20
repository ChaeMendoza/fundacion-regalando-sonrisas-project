import { TestBed } from '@angular/core/testing';
import { Router, provideRouter } from '@angular/router';
import { SessionStore } from '../../state/session.store';
import { RegisterComponent } from './register.component';

describe('RegisterComponent', () => {
  const register = vi.fn(async () => undefined);

  beforeEach(async () => {
    register.mockReset();
    await TestBed.configureTestingModule({
      imports: [RegisterComponent],
      providers: [
        {
          provide: SessionStore,
          useValue: {
            register,
          },
        },
        provideRouter([]),
      ],
    }).compileComponents();
  });

  it('muestra las dos casillas sin marcar y con enlaces a los documentos', () => {
    const fixture = TestBed.createComponent(RegisterComponent);
    fixture.detectChanges();
    const component = fixture.componentInstance;
    const nativeElement = fixture.nativeElement as HTMLElement;
    const checkboxes = nativeElement.querySelectorAll<HTMLInputElement>('input[type="checkbox"]');

    expect(checkboxes).toHaveLength(2);
    expect(checkboxes[0].checked).toBe(false);
    expect(checkboxes[1].checked).toBe(false);
    const labelText = (index: number) =>
      (checkboxes[index].closest('label')?.textContent ?? '').replace(/\s+/g, ' ').trim();
    expect(labelText(0)).toBe('He leído y acepto los Términos y Condiciones de Uso.');
    expect(labelText(1)).toBe(
      'He leído la Política de Privacidad y Tratamiento de Datos Personales y he sido informado sobre el tratamiento de mis datos personales.',
    );
    expect(component.form.controls.termsAccepted.value).toBe(false);
    expect(component.form.controls.privacyAccepted.value).toBe(false);
    expect(nativeElement.querySelector('a[href="/terminos-y-condiciones"]')).not.toBeNull();
    expect(nativeElement.querySelector('a[href="/politica-de-privacidad"]')).not.toBeNull();
  });

  it('bloquea el registro y avisa si falta alguna aceptación obligatoria', async () => {
    const fixture = TestBed.createComponent(RegisterComponent);
    const component = fixture.componentInstance;
    component.form.patchValue({
      displayName: 'Nombre Prueba',
      email: 'prueba@ejemplo.com',
      password: 'clave123',
      termsAccepted: true,
      privacyAccepted: false,
    });

    await component.submit();

    expect(register).not.toHaveBeenCalled();
    expect(component.acceptanceError()).toContain('Política de Privacidad');
  });

  it('envía ambas manifestaciones cuando las dos casillas están marcadas', async () => {
    const fixture = TestBed.createComponent(RegisterComponent);
    const component = fixture.componentInstance;
    const router = TestBed.inject(Router);
    vi.spyOn(router, 'navigate').mockResolvedValue(true);
    register.mockResolvedValue(undefined);
    component.form.patchValue({
      displayName: 'Nombre Prueba',
      email: 'prueba@ejemplo.com',
      password: 'clave123',
      termsAccepted: true,
      privacyAccepted: true,
    });

    await component.submit();

    expect(register).toHaveBeenCalledWith('Nombre Prueba', 'prueba@ejemplo.com', 'clave123', {
      termsAccepted: true,
      privacyInformationAcknowledged: true,
    });
    expect(component.acceptanceError()).toBe('');
  });
});
