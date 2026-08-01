const isDev = import.meta.env.DEV;

/** Centralized logging so a future remote-logging sink can be wired in one place. */
export const logger = {
  debug: (...args: unknown[]): void => {
    if (isDev) console.debug('[debug]', ...args);
  },
  info: (...args: unknown[]): void => {
    console.info('[info]', ...args);
  },
  warn: (...args: unknown[]): void => {
    console.warn('[warn]', ...args);
  },
  error: (...args: unknown[]): void => {
    console.error('[error]', ...args);
  },
};
