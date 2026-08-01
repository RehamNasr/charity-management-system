import { useMemo } from 'react';
import { query, orderBy } from 'firebase/firestore';
import { collectionRef } from '@firebase-app/firestore';
import { useCollection } from '@hooks/useCollection';
import type { CaseAttachment, CaseAttachmentCategory } from '@types-app/case';

export function useCaseAttachments(caseId: string | undefined, category: CaseAttachmentCategory) {
  const attachmentsQuery = useMemo(() => {
    if (!caseId) return null;
    const baseRef = collectionRef<CaseAttachment>(`cases/${caseId}/attachments`);
    return query(baseRef, orderBy('createdAt', 'desc'));
  }, [caseId]);

  const queryKey = `caseAttachments:${caseId ?? ''}`;
  const { data, loading, error } = useCollection<CaseAttachment>(attachmentsQuery, queryKey);

  const attachments = useMemo(
    () => (data ?? []).filter((att) => !att.isDeleted && att.category === category),
    [data, category],
  );

  return { attachments, loading, error };
}
