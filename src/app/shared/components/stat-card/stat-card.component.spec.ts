import { ComponentFixture, TestBed } from '@angular/core/testing';
import { StatCardComponent } from './stat-card.component';

describe('StatCardComponent', () => {
  let fixture: ComponentFixture<StatCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StatCardComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(StatCardComponent);
  });

  it('should render label and value accurately', () => {
    fixture.componentRef.setInput('label', 'Beneficiarios');
    fixture.componentRef.setInput('value', 42);
    fixture.componentRef.setInput('hint', 'Activos');
    fixture.componentRef.setInput('tag', 'Alcance Base');
    fixture.detectChanges();

    const element = fixture.nativeElement as HTMLElement;
    expect(element.querySelector('.stat-card__label')?.textContent?.trim()).toBe('Beneficiarios');
    expect(element.querySelector('.stat-card__value')?.textContent?.trim()).toBe('42');
    expect(element.querySelector('.stat-card__hint')?.textContent?.trim()).toBe('Activos');
    expect(element.querySelector('.stat-card__tag')?.textContent?.trim()).toBe('Alcance Base');
  });
});
