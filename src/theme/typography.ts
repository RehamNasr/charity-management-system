import type { TypographyOptions } from '@mui/material/styles/createTypography';

/** Cairo/Tajawal-style Arabic-first stack, falling back gracefully to system fonts. */
export const typography: TypographyOptions = {
  fontFamily: [
    '"Cairo"',
    '"Tajawal"',
    '"Segoe UI"',
    'Tahoma',
    'system-ui',
    '-apple-system',
    'sans-serif',
  ].join(', '),
  h1: { fontWeight: 700, fontSize: '2.5rem' },
  h2: { fontWeight: 700, fontSize: '2rem' },
  h3: { fontWeight: 600, fontSize: '1.75rem' },
  h4: { fontWeight: 600, fontSize: '1.5rem' },
  h5: { fontWeight: 600, fontSize: '1.25rem' },
  h6: { fontWeight: 600, fontSize: '1.1rem' },
  subtitle1: { fontWeight: 500 },
  subtitle2: { fontWeight: 500 },
  button: { fontWeight: 600, textTransform: 'none' },
};
