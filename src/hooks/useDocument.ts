import { useEffect, useState } from 'react';
import type { DocumentReference } from 'firebase/firestore';
import { subscribeToDocument } from '@firebase-app/firestore';
import type { AsyncState } from '@types-app/common';

interface InternalState<T> {
  /** The `ref.path` this result belongs to, so a stale result from a just-replaced subscription
   * is never shown as "loaded" for the newly requested ref (see `loading` derivation below). */
  key: string | null;
  data: (T & { id: string }) | null;
  error: string | null;
}

/**
 * Subscribes to a single Firestore document in realtime. Replaces the TanStack-Query-style
 * data-fetching hook with a thin wrapper directly over `onSnapshot` — Firestore already provides
 * the caching/offline/sync behavior a query library would otherwise reimplement
 * (docs/ARCHITECTURE.md §9/§11).
 *
 * Pass `null` for `ref` to skip the subscription (e.g. while a required id is not yet known).
 */
export function useDocument<T>(ref: DocumentReference<T> | null): AsyncState<T & { id: string }> {
  const [state, setState] = useState<InternalState<T>>({ key: null, data: null, error: null });

  useEffect(() => {
    if (!ref) return;

    const unsubscribe = subscribeToDocument<T>(
      ref,
      (data) => {
        setState({ key: ref.path, data, error: null });
      },
      (error) => {
        setState({ key: ref.path, data: null, error: error.message });
      },
    );

    return unsubscribe;
    // eslint-disable-next-line react-hooks/exhaustive-deps -- ref identity/path is the real dependency
  }, [ref?.path]);

  if (!ref) {
    return { data: null, loading: false, error: null };
  }

  const loading = state.key !== ref.path;
  return loading
    ? { data: null, loading: true, error: null }
    : { data: state.data, loading: false, error: state.error };
}
