import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BeneficiariesService } from '../../../infrastructure/services/foundation-modules.service';
import { BeneficiariesComponent } from './beneficiaries.component';

describe('BeneficiariesComponent', () => {
  let fixture: ComponentFixture<BeneficiariesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BeneficiariesComponent],
      providers: [
        {
          provide: BeneficiariesService,
          useValue: {
            list: vi.fn().mockResolvedValue([
              {
                id: 'b1',
                fullName: 'Rosa Elena Guayasamín',
                documentId: '1712345678',
                phone: '0991234567',
                sector: 'Chillogallo',
                address: 'Av. Mariscal Sucre',
                householdSize: 4,
                dependentsCount: 2,
                monthlyIncomeRange: 'Menor a $200',
                housingCondition: 'Arrendada',
                vulnerabilityLevel: 'high',
                needs: 'Alimentos y útiles escolares',
                status: 'active',
              },
            ]),
            create: vi.fn(),
            update: vi.fn(),
            deactivate: vi.fn(),
          },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(BeneficiariesComponent);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
  });

  it('should render loaded beneficiaries from service', () => {
    const el = fixture.nativeElement as HTMLElement;
    expect(el.textContent).toContain('Rosa Elena Guayasamín');
    expect(el.textContent).toContain('Chillogallo');
  });

  it('should filter beneficiaries by search term', () => {
    const component = fixture.componentInstance;
    component.searchTerm.set('Calderón');
    fixture.detectChanges();
    expect(component.filteredBeneficiaries().length).toBe(0);

    component.searchTerm.set('Chillogallo');
    fixture.detectChanges();
    expect(component.filteredBeneficiaries().length).toBe(1);
  });
});
