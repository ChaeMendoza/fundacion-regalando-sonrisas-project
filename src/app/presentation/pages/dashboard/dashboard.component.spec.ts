import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { DashboardComponent } from './dashboard.component';

describe('DashboardComponent', () => {
  let fixture: ComponentFixture<DashboardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DashboardComponent],
      providers: [provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(DashboardComponent);
    fixture.detectChanges();
  });

  it('should render the page title and description', () => {
    const element = fixture.nativeElement as HTMLElement;
    expect(element.querySelector('.page-header__title')?.textContent).toContain(
      'Panel de Control'
    );
  });

  it('should display the core module cards', () => {
    const element = fixture.nativeElement as HTMLElement;
    const cards = element.querySelectorAll('.module-card');
    expect(cards.length).toBe(6);
  });
});
