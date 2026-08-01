/**
 * Produces the `normalizedName`/`normalizedNationalId`/`normalizedPhone` values described in
 * docs/ARCHITECTURE.md §6 design principle #6: lowercased, trimmed, collapsed whitespace, with
 * Arabic diacritics and common letter-shape variants folded so `"مُحَمَّد"`, `"محمد"`, and `"محمّد "`
 * all normalize to the same searchable value. Firestore has no server-side normalization step in
 * this project yet (no Cloud Functions), so this runs client-side at write time instead of via a
 * trigger — the field it produces and how it's queried (range prefix match) are unchanged from
 * what the architecture specifies.
 */
export function normalizeSearchValue(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/[ً-ْٰـ]/g, '') // strip Arabic diacritics (tashkeel) + tatweel
    .replace(/[إأآا]/g, 'ا')
    .replace(/ى/g, 'ي')
    .replace(/ة/g, 'ه')
    .replace(/\s+/g, ' ');
}

/** Digits-only normalization for national ID / phone fields — search should match regardless of
 * spacing or formatting the user happened to type. */
export function normalizeDigits(value: string): string {
  return value.replace(/\D/g, '');
}
