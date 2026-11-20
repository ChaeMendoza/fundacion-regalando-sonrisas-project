import { Component, computed, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { map } from 'rxjs';
import { LegalDocumentKey } from '../../../domain/entities/legal-document.entity';
import { LEGAL_DOCUMENTS } from './legal-documents';
import { isLegalLink } from './legal-document.model';

/** Vista pública compartida por los documentos institucionales. */
@Component({
  selector: 'app-legal-document',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './legal-document.component.html',
  styleUrl: './legal-document.component.scss',
})
export class LegalDocumentComponent {
  private readonly route = inject(ActivatedRoute);

  private readonly documentKey = toSignal(
    this.route.data.pipe(map((data) => data['legalDocument'] as LegalDocumentKey)),
    { initialValue: this.route.snapshot.data['legalDocument'] as LegalDocumentKey },
  );

  readonly document = computed(() => LEGAL_DOCUMENTS[this.documentKey()]);
  readonly isLink = isLegalLink;
}
