export const APP_NAME =
  (import.meta.env['VITE_APP_NAME'] as string | undefined) ?? 'جمعية حكاية خير';

export const STORAGE_KEYS = {
  themeMode: 'cms:theme-mode',
  sidebarCollapsed: 'cms:sidebar-collapsed',
  rememberedEmail: 'cms:remembered-email',
} as const;

export const DRAWER_WIDTH = 280;
export const DRAWER_WIDTH_COLLAPSED = 72;
export const TOPBAR_HEIGHT = 64;
