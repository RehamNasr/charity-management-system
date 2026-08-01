import { useEffect, useState } from 'react';
import type { Query } from 'firebase/firestore';
import { subscribeToCollection } from '@firebase-app/firestore';
import type { AsyncState } from '@types-app/common';

interface InternalState<T> {
  /** The `queryKey` this result belongs to, so a stale result from a just-replaced subscription
   * is never shown as "loaded" for the newly requested query (see `loading` derivation below). */
  key: string | null;
  data: (T & { id: string })[] | null;
  error: string | null;
}

/**
 * Subscribes to a Firestore collection query in realtime (docs/ARCHITECTURE.md §9/§11).
 *
 * `collectionQuery` should be memoized by the caller (e.g. `useMemo`); pass `null` to skip
 * subscribing. Re-subscribes whenever `queryKey` changes — pass a stable string that encodes the
 * query's actual filter/sort parameters (Firestore `Query` objects don't have a cheap identity
 * check, so an explicit key avoids resubscribing on every render even if the caller recreates the
 * query object each render).
 */
export function useCollection<T>(
  collectionQuery: Query<T> | null,
  queryKey: string,
): AsyncState<(T & { id: string })[]> {
  const [state, setState] = useState<InternalState<T>>({ key: null, data: null, error: null });

  useEffect(() => {
    if (!collectionQuery) return;

    const unsubscribe = subscribeToCollection<T>(
      collectionQuery,
      (data) => {
        setState({ key: queryKey, data, error: null });
      },
      (error) => {
        setState({ key: queryKey, data: null, error: error.message });
      },
    );

    return unsubscribe;
    // eslint-disable-next-line react-hooks/exhaustive-deps -- queryKey is the intentional dependency
  }, [queryKey]);

  if (!collectionQuery) {
    return { data: null, loading: false, error: null };
  }

  const loading = state.key !== queryKey;
  return loading
    ? { data: null, loading: true, error: null }
    : { data: state.data, loading: false, error: state.error };
}
