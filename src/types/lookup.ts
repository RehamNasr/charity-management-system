/** Shared shape for every lookup collection (docs/ARCHITECTURE.md §6.5): governorates, cities,
 * caseTypes, and — once their modules exist — assistanceTypes/expenseCategories. */
export interface LookupItem {
  id: string;
  name: string;
  isActive: boolean;
  order: number;
}

/** `cities/{id}` additionally carries the governorate it belongs to. */
export interface CityLookupItem extends LookupItem {
  governorateId: string;
}

/** `villages/{id}` additionally carries the city/center it belongs to (docs/ARCHITECTURE.md
 * §6.5 — "village → city" parent/child relationship). */
export interface VillageLookupItem extends LookupItem {
  cityId: string;
}
