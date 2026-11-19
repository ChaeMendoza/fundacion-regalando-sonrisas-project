import { BaseEntity } from '../../infrastructure/firebase/firestore.service';

export type DonorType = 'individual' | 'company' | 'organization';
export type DonationType = 'food' | 'clothing' | 'monetary' | 'education' | 'medical' | 'other';
export type DonationStatus = 'registered' | 'in_distribution' | 'delivered';

export interface Donor extends BaseEntity {
  name: string;
  documentId: string;
  donorType: DonorType;
  email?: string;
  phone: string;
  address?: string;
  notes?: string;
}

export interface Donation extends BaseEntity {
  code: string;
  donorId?: string;
  donorName: string;
  donorContact: string;
  type: DonationType;
  description: string;
  quantity: number;
  unit: string;
  estimatedValue: number;
  receivedDate: string;
  status: DonationStatus;
  destination: string;
  beneficiaryId?: string;
  beneficiaryName?: string;
  receiptUrl?: string;
  receiptPath?: string;
  notes?: string;
}
