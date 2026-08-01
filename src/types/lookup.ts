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
