import { createTheme, type Theme } from '@mui/material/styles';
import { arSD } from '@mui/material/locale';
import { lightPalette, darkPalette } from './palette';
import { typography } from './typography';
import { components } from './components';
import type { ThemeMode } from '@store/themeStore';

export function createAppTheme(mode: ThemeMode): Theme {
  return createTheme(
    {
      direction: 'rtl',
      palette: mode === 'light' ? lightPalette : darkPalette,
      typography,
      shape: { borderRadius: 10 },
      components,
    },
    arSD,
  );
}
