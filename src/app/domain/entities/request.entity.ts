import { BaseEntity } from '../../infrastructure/firebase/firestore.service';

export type RequestCategory = 'food' | 'health' | 'education' | 'housing' | 'clothing' | 'other';
export type RequestPriority = 'low' | 'medium' | 'high' | 'urgent';
export type RequestStatus = 'pending' | 'in_review' | 'approved' | 'fulfilled' | 'rejected';

export interface SupportRequest extends BaseEntity {
  code: string;
  title: string;
  category: RequestCategory;
  priority: RequestPriority;
  status: RequestStatus;
  beneficiaryId?: string;
  beneficiaryName: string;
  requesterPhone: string;
  sector: string;
  description: string;
  requestDate: string;
  resolvedDate?: string;
  resolutionNotes?: string;
}
