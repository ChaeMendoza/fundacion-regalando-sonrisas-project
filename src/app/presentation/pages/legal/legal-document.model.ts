/** Modelo mínimo para renderizar documentos institucionales sin duplicar estilos. */

export interface LegalLink {
  readonly link: string;
  readonly label: string;
}

export type LegalInline = string | LegalLink;

export interface LegalParagraphBlock {
  readonly kind: 'paragraph';
  readonly parts: readonly LegalInline[];
}

export interface LegalListBlock {
  readonly kind: 'list';
  readonly ordered: boolean;
  readonly items: readonly (readonly LegalInline[])[];
}

export interface LegalNoteBlock {
  readonly kind: 'note';
  readonly title?: string;
  readonly parts: readonly LegalInline[];
}

export interface LegalTableBlock {
  readonly kind: 'table';
  readonly headers: readonly string[];
  readonly rows: readonly (readonly string[])[];
}

export type LegalBlock = LegalParagraphBlock | LegalListBlock | LegalNoteBlock | LegalTableBlock;

export interface LegalSection {
  readonly id: string;
  readonly title: string;
  readonly blocks: readonly LegalBlock[];
}

export interface LegalDocument {
  readonly title: string;
  readonly subtitle: string;
  readonly version: string;
  readonly lastUpdated: string;
  readonly intro: readonly LegalInline[];
  readonly sections: readonly LegalSection[];
}

export function isLegalLink(part: LegalInline): part is LegalLink {
  return typeof part !== 'string';
}

const link = (to: string, label: string): LegalLink => ({ link: to, label });

const paragraph = (...parts: LegalInline[]): LegalParagraphBlock => ({ kind: 'paragraph', parts });

const list = (items: readonly (readonly LegalInline[])[], ordered = false): LegalListBlock => ({
  kind: 'list',
  ordered,
  items,
});

const note = (title: string, ...parts: LegalInline[]): LegalNoteBlock => ({
  kind: 'note',
  title,
  parts,
});

const table = (headers: readonly string[], rows: readonly (readonly string[])[]): LegalTableBlock => ({
  kind: 'table',
  headers,
  rows,
});

/** Atajos de redacción para mantener los documentos legibles en su archivo de contenido. */
export const legal = { link, paragraph, list, note, table } as const;
