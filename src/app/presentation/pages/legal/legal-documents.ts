import { LegalDocumentKey } from '../../../domain/entities/legal-document.entity';
import { LegalDocument } from './legal-document.model';
import { PRIVACY_POLICY } from './privacy-policy.content';
import { TERMS_OF_USE } from './terms-of-use.content';

export const LEGAL_DOCUMENTS: Record<LegalDocumentKey, LegalDocument> = {
  terms: TERMS_OF_USE,
  privacy: PRIVACY_POLICY,
};
