import { useMemo } from 'react';
import { useDocument } from '@hooks/useDocument';
import { getCaseRef } from '../api/caseService';
import type { Case } from '@types-app/case';
import type { AsyncState } from '@types-app/common';

/** Realtime single-case subscription (docs/ARCHITECTURE.md §9/§11) — powers the Details and Edit
 * pages, so an approval or edit from another tab/user is reflected live. */
export function useCase(caseId: string | undefined): AsyncState<Case & { id: string }> {
  const ref = useMemo(() => (caseId ? getCaseRef(caseId) : null), [caseId]);
  return useDocument(ref);
}
