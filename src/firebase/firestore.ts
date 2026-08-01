import {
  collection,
  doc,
  getDoc,
  onSnapshot,
  query,
  where,
  type CollectionReference,
  type DocumentData,
  type DocumentReference,
  type FirestoreError,
  type Query,
  type QueryConstraint,
  type Unsubscribe,
} from 'firebase/firestore';
import { db } from './config';

// `doc`/`collection` are only generic when called against an already-typed reference; called
// against the root `Firestore` instance they always return the untyped `DocumentData` shape, so
// the cast here is genuinely required to get a typed reference back — not an ESLint false flag.
export function docRef<T = DocumentData>(
  path: string,
  ...segments: string[]
): DocumentReference<T> {
  return doc(db, path, ...segments) as unknown as DocumentReference<T>;
}

export function collectionRef<T = DocumentData>(
  path: string,
  ...segments: string[]
): CollectionReference<T> {
  return collection(db, path, ...segments) as unknown as CollectionReference<T>;
}

export async function getDocumentOnce<T>(ref: DocumentReference<T>): Promise<T | null> {
  const snapshot = await getDoc(ref);
  return snapshot.exists() ? snapshot.data() : null;
}

/**
 * Subscribes to a single document. Returns the unsubscribe function; callers (typically the
 * shared `useDocument` hook) are responsible for calling it on cleanup.
 */
export function subscribeToDocument<T>(
  ref: DocumentReference<T>,
  onData: (data: (T & { id: string }) | null) => void,
  onError?: (error: FirestoreError) => void,
): Unsubscribe {
  return onSnapshot(
    ref,
    (snapshot) => {
      onData(snapshot.exists() ? { id: snapshot.id, ...snapshot.data() } : null);
    },
    onError,
  );
}

/**
 * Subscribes to a collection query. Returns the unsubscribe function; callers (typically the
 * shared `useCollection` hook) are responsible for calling it on cleanup.
 */
export function subscribeToCollection<T>(
  collectionQuery: Query<T>,
  onData: (data: (T & { id: string })[]) => void,
  onError?: (error: FirestoreError) => void,
): Unsubscribe {
  return onSnapshot(
    collectionQuery,
    (snapshot) => {
      onData(snapshot.docs.map((docSnap) => ({ id: docSnap.id, ...docSnap.data() })));
    },
    onError,
  );
}

/**
 * Applies the standard soft-delete filter (docs/ARCHITECTURE.md §6 design principle #7) so
 * feature-level queries don't have to remember it individually.
 */
export function withSoftDeleteFilter<T>(
  collectionQuery: CollectionReference<T> | Query<T>,
  ...constraints: QueryConstraint[]
): Query<T> {
  return query(collectionQuery, where('isDeleted', '==', false), ...constraints);
}

export { where, query };
export type { QueryConstraint };
