import { useMemo } from 'react';
import { query, orderBy } from 'firebase/firestore';
import { collectionRef } from '@firebase-app/firestore';
import { useCollection } from '@hooks/useCollection';
import { VISITS_COLLECTION } from '../api/visitService';
import type { VisitAttachment } from '@types-app/visit';

export function useVisitAttachments(visitId: string | undefined) {
  const attachmentsQuery = useMemo(() => {
    if (!visitId) return null;
    const baseRef = collectionRef<VisitAttachment>(`${VISITS_COLLECTION}/${visitId}/attachments`);
    return query(baseRef, orderBy('createdAt', 'desc'));
  }, [visitId]);

  const queryKey = `visitAttachments:${visitId ?? ''}`;
  const { data, loading, error } = useCollection<VisitAttachment>(attachmentsQuery, queryKey);

  const activeAttachments = useMemo(() => {
    return (data ?? []).filter((att) => !(att as unknown as { isDeleted?: boolean }).isDeleted);
  }, [data]);

  return { attachments: activeAttachments, loading, error };
}
