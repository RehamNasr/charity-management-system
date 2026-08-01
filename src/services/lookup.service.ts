import { collectionRef, query, where } from '@firebase-app/firestore';
import { orderBy, type CollectionReference, type Query } from 'firebase/firestore';
import type { CityLookupItem, LookupItem } from '@types-app/lookup';

/** Names of every lookup collection defined so far (docs/ARCHITECTURE.md §6.5). Kept as a literal
 * union rather than a free string so a typo in a feature can't silently query a nonexistent
 * collection. */
export type LookupCollectionName = 'governorates' | 'cities' | 'caseTypes';

export function lookupCollectionRef<T extends LookupItem = LookupItem>(
  name: LookupCollectionName,
): CollectionReference<T> {
  return collectionRef<T>(name);
}

/** Active, ordered lookup entries — the standard query every lookup dropdown uses. */
export function activeLookupQuery<T extends LookupItem = LookupItem>(
  name: LookupCollectionName,
): Query<T> {
  return query(
    lookupCollectionRef<T>(name),
    where('isActive', '==', true),
    orderBy('order', 'asc'),
  );
}

/** Active, ordered cities scoped to one governorate — used by the Case form's dependent
 * governorate → city selects. */
export function activeCitiesByGovernorateQuery(governorateId: string): Query<CityLookupItem> {
  return query(
    lookupCollectionRef<CityLookupItem>('cities'),
    where('isActive', '==', true),
    where('governorateId', '==', governorateId),
    orderBy('order', 'asc'),
  );
}
