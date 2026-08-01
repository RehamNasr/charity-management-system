import Box from '@mui/material/Box';
import CircularProgress, { type CircularProgressProps } from '@mui/material/CircularProgress';

interface LoadingSpinnerProps {
  size?: CircularProgressProps['size'];
  fullHeight?: boolean;
}

export function LoadingSpinner({ size = 32, fullHeight = false }: LoadingSpinnerProps) {
  return (
    <Box
      display="flex"
      alignItems="center"
      justifyContent="center"
      width="100%"
      height={fullHeight ? '100%' : undefined}
      py={fullHeight ? 0 : 4}
    >
      <CircularProgress size={size} />
    </Box>
  );
}
