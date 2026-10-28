import { ComponentFixture, TestBed } from '@angular/core/testing';
import { StatusBadgeComponent } from './status-badge.component';

describe('StatusBadgeComponent', () => {
  let fixture: ComponentFixture<StatusBadgeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StatusBadgeComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(StatusBadgeComponent);
  });

  it('should render badge text with appropriate class', () => {
    fixture.componentRef.setInput('text', 'Activo');
    fixture.componentRef.setInput('variant', 'success');
    fixture.detectChanges();

    const element = fixture.nativeElement as HTMLElement;
    const badge = element.querySelector('.status-badge');
    expect(badge?.classList.contains('status-badge--success')).toBe(true);
    expect(badge?.textContent?.trim()).toBe('Activo');
  });
});
