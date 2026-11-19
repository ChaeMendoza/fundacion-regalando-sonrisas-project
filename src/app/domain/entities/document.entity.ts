import { BaseEntity } from '../../infrastructure/firebase/firestore.service';

export type DocumentModule =
  | 'beneficiaries'
  | 'donations'
  | 'volunteers'
  | 'activities'
  | 'requests'
  | 'institutional';

export type DocumentType =
  | 'identification'
  | 'receipt'
  | 'report'
  | 'evidence'
  | 'certificate'
  | 'other';

export interface FoundationDocument extends BaseEntity {
  title: string;
  module: DocumentModule;
  recordId: string;
  recordLabel: string;
  docType: DocumentType;
  fileName: string;
  mimeType: string;
  size: number;
  storagePath: string;
  downloadUrl: string;
  description?: string;
  uploadedBy: string;
  uploadedByName: string;
}
