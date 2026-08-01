/** Thin, type-safe wrapper around localStorage — swallows quota/availability errors (private
 * browsing, disabled storage) instead of crashing the app over a non-critical persistence write. */
export function getStorageItem<T>(key: string, fallback: T): T {
  try {
    const raw = window.localStorage.getItem(key);
    if (raw === null) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export function setStorageItem<T>(key: string, value: T): void {
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Ignore write failures (quota exceeded, private browsing, etc.)
  }
}

export function removeStorageItem(key: string): void {
  try {
    window.localStorage.removeItem(key);
  } catch {
    // Ignore
  }
}
