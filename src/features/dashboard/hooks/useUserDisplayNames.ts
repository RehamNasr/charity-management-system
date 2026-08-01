import { useEffect, useState } from 'react';
import { fetchUserProfile } from '@services/user.service';

/**
 * Resolves a small set of `createdBy` UIDs (from the Recent Activity feed — capped at ~15 items,
 * so at most ~15 unique UIDs) to display names. Cases/donations/expenses only store the UID, not
 * a denormalized name, so this is a one-time, deduped batch fetch rather than a per-row read.
 */
export function useUserDisplayNames(uids: string[]): Record<string, string> {
  const [names, setNames] = useState<Record<string, string>>({});
  const uniqueKey = Array.from(new Set(uids)).sort().join(',');

  useEffect(() => {
    const uniqueUids = uniqueKey ? uniqueKey.split(',') : [];
    const missing = uniqueUids.filter((uid) => !(uid in names));
    if (missing.length === 0) return;

    let cancelled = false;
    void (async () => {
      const entries = await Promise.all(
        missing.map(async (uid) => {
          const profile = await fetchUserProfile(uid);
          return [uid, profile?.displayName ?? 'مستخدم'] as const;
        }),
      );
      if (!cancelled) {
        setNames((prev) => ({ ...prev, ...Object.fromEntries(entries) }));
      }
    })();

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- `uniqueKey` captures the real input
  }, [uniqueKey]);

  return names;
}
