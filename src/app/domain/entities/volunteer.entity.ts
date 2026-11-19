import { BaseEntity } from '../../infrastructure/firebase/firestore.service';

export type VolunteerStatus = 'active' | 'paused' | 'inactive';

export interface Volunteer extends BaseEntity {
  fullName: string;
  documentId: string;
  email: string;
  phone: string;
  sector: string;
  address: string;
  availability: string;
  areas: string[];
  skills: string;
  emergencyContactName: string;
  emergencyContactPhone: string;
  status: VolunteerStatus;
  joinedDate: string;
  notes?: string;
}
