import { useMemo } from 'react';
import { useCollection } from './useCollection';
import {
  activeCitiesByGovernorateQuery,
  activeLookupQuery,
  type LookupCollectionName,
} from '@services/lookup.service';
import type { CityLookupItem, LookupItem } from '@types-app/lookup';
import type { AsyncState } from '@types-app/common';

import { DEFAULT_CITIES, DEFAULT_LOOKUPS } from '@constants/defaultLookups';

/**
 * Realtime, active+ordered view over a lookup collection (governorates, cities, caseTypes — see
 * docs/ARCHITECTURE.md §6.5). Shared by every form/filter that needs one of these dropdowns, so
 * the query shape (isActive filter, order sort) is defined exactly once.
 */
export function useLookupCollection<T extends LookupItem = LookupItem>(
  name: LookupCollectionName,
): AsyncState<(T & { id: string })[]> {
  const lookupQuery = useMemo(() => activeLookupQuery<T>(name), [name]);
  const result = useCollection(lookupQuery, name);

  const fallbackData = useMemo(() => {
    if (!result.loading && (!result.data || result.data.length === 0)) {
      return (DEFAULT_LOOKUPS[name] || []) as (T & { id: string })[];
    }
    return result.data ?? ((DEFAULT_LOOKUPS[name] || []) as (T & { id: string })[]);
  }, [result.data, result.loading, name]);

  return {
    ...result,
    data: fallbackData,
  };
}

/** Realtime cities scoped to the selected governorate; returns an empty (non-loading) result
 * until a governorate is chosen, so the city select can stay disabled/empty rather than showing
 * every city in the system. */
export function useCitiesByGovernorate(
  governorateId: string | null,
): AsyncState<(CityLookupItem & { id: string })[]> {
  const citiesQuery = useMemo(
    () => (governorateId ? activeCitiesByGovernorateQuery(governorateId) : null),
    [governorateId],
  );
  const result = useCollection(citiesQuery, `cities:${governorateId ?? ''}`);

  const fallbackData = useMemo(() => {
    if (!governorateId) return [];
    if (!result.loading && (!result.data || result.data.length === 0)) {
      const defaultForGov = DEFAULT_CITIES.filter((c) => c.governorateId === governorateId);
      if (defaultForGov.length > 0) return defaultForGov;
      return [{ id: `${governorateId}-main`, governorateId, name: 'المدينة الرئيسية / المركز', order: 1, isActive: true }];
    }
    return result.data ?? [];
  }, [governorateId, result.data, result.loading]);

  return {
    ...result,
    data: fallbackData,
  };
}
