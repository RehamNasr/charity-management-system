import { useMemo } from 'react';
import { useDocument } from '@hooks/useDocument';
import { getVisitRef } from '../api/visitService';
import type { Visit } from '@types-app/visit';

export function useVisit(visitId: string | undefined) {
  const docRef = useMemo(() => (visitId ? getVisitRef(visitId) : null), [visitId]);
  return useDocument<Visit>(docRef);
}
