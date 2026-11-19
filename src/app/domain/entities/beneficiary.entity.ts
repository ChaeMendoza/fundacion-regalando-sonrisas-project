import { BaseEntity } from '../../infrastructure/firebase/firestore.service';

export type BeneficiaryStatus = 'active' | 'assisted' | 'inactive';
export type VulnerabilityLevel = 'low' | 'medium' | 'high' | 'critical';

export interface Beneficiary extends BaseEntity {
  fullName: string;
  documentId: string;
  phone: string;
  email?: string;
  sector: string;
  address: string;
  householdSize: number;
  dependentsCount: number;
  monthlyIncomeRange: string;
  housingCondition: string;
  vulnerabilityLevel: VulnerabilityLevel;
  needs: string;
  program?: string;
  status: BeneficiaryStatus;
  lastAttentionDate?: string;
  notes?: string;
}
