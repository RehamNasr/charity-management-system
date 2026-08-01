import createCache, { type EmotionCache } from '@emotion/cache';
import rtlPlugin from 'stylis-plugin-rtl';
import { prefixer } from 'stylis';

/** RTL-aware emotion cache for MUI (docs/ARCHITECTURE.md §9). Must be created once and provided
 * at the app root via `CacheProvider`, alongside `theme.direction = 'rtl'`. */
export function createRtlCache(): EmotionCache {
  return createCache({
    key: 'muirtl',
    stylisPlugins: [prefixer, rtlPlugin],
  });
}

export function createLtrCache(): EmotionCache {
  return createCache({ key: 'mui' });
}
