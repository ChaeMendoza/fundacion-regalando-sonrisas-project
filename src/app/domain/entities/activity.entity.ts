import { BaseEntity } from '../../infrastructure/firebase/firestore.service';

export type ActivityType =
  | 'social'
  | 'educational'
  | 'community'
  | 'donation_campaign'
  | 'family_support';

export type ActivityStatus = 'planned' | 'in_progress' | 'completed' | 'cancelled';

export interface Activity extends BaseEntity {
  title: string;
  type: ActivityType;
  date: string;
  startTime: string;
  location: string;
  description: string;
  status: ActivityStatus;
  responsibleName: string;
  volunteerIds: string[];
  beneficiaryIds: string[];
  beneficiariesCount: number;
  notes?: string;
}
