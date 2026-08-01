import { useMemo } from 'react';
import { query, orderBy } from 'firebase/firestore';
import { collectionRef } from '@firebase-app/firestore';
import { useCollection } from '@hooks/useCollection';
import { VISITS_COLLECTION } from '../api/visitService';
import type { VisitHistoryEvent } from '@types-app/visit';

export function useVisitHistory(visitId: string | undefined) {
  const historyQuery = useMemo(() => {
    if (!visitId) return null;
    const baseRef = collectionRef<VisitHistoryEvent>(`${VISITS_COLLECTION}/${visitId}/history`);
    return query(baseRef, orderBy('timestamp', 'desc'));
  }, [visitId]);

  const queryKey = `visitHistory:${visitId ?? ''}`;
  const { data, loading, error } = useCollection<VisitHistoryEvent>(historyQuery, queryKey);

  return { events: data ?? [], loading, error };
}
