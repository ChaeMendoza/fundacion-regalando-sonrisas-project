import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import {
  ActivitiesService,
  BeneficiariesService,
  DocumentsService,
  DonationsService,
  RequestsService,
  VolunteersService,
} from '../../../infrastructure/services/foundation-modules.service';
import { DashboardComponent } from './dashboard.component';

describe('DashboardComponent', () => {
  let fixture: ComponentFixture<DashboardComponent>;

  beforeEach(async () => {
    const emptyListMock = { list: async () => [] };

    await TestBed.configureTestingModule({
      imports: [DashboardComponent],
      providers: [
        provideRouter([]),
        { provide: BeneficiariesService, useValue: emptyListMock },
        { provide: DonationsService, useValue: emptyListMock },
        { provide: VolunteersService, useValue: emptyListMock },
        { provide: ActivitiesService, useValue: emptyListMock },
        { provide: RequestsService, useValue: emptyListMock },
        { provide: DocumentsService, useValue: emptyListMock },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(DashboardComponent);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
  });

  it('should render the page title and description', () => {
    const element = fixture.nativeElement as HTMLElement;
    expect(element.querySelector('.page-header__title')?.textContent).toContain('Panel de Control');
  });

  it('should display the core module cards', () => {
    const element = fixture.nativeElement as HTMLElement;
    const cards = element.querySelectorAll('.module-card');
    expect(cards.length).toBe(6);
  });
});
