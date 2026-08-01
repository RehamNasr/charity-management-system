import type { PaletteOptions } from '@mui/material/styles';

/** Brand green — chosen to read as trustworthy/charitable without leaning on any specific org's
 * branding; swap freely once real brand colors are provided. */
export const lightPalette: PaletteOptions = {
  mode: 'light',
  primary: {
    main: '#0f5132',
    light: '#3d7a5a',
    dark: '#083320',
    contrastText: '#ffffff',
  },
  secondary: {
    main: '#b8860b',
    light: '#d4a537',
    dark: '#8a6508',
    contrastText: '#ffffff',
  },
  error: { main: '#d32f2f' },
  warning: { main: '#ed6c02' },
  success: { main: '#2e7d32' },
  info: { main: '#0288d1' },
  background: {
    default: '#f5f7f6',
    paper: '#ffffff',
  },
};

export const darkPalette: PaletteOptions = {
  mode: 'dark',
  primary: {
    main: '#4caf80',
    light: '#7bc9a3',
    dark: '#2e7d55',
    contrastText: '#04150c',
  },
  secondary: {
    main: '#d4a537',
    light: '#e3bd63',
    dark: '#a97f21',
    contrastText: '#1a1200',
  },
  error: { main: '#f44336' },
  warning: { main: '#ffa726' },
  success: { main: '#66bb6a' },
  info: { main: '#29b6f6' },
  background: {
    default: '#0e1512',
    paper: '#161f1a',
  },
};
