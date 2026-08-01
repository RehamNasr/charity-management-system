import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';
import Stack from '@mui/material/Stack';
import { useSnackbarStore } from '@store/snackbarStore';

const MAX_VISIBLE = 3;

/**
 * App-level snackbar/toast stack, driven entirely by `useSnackbarStore` (`showSnackbar.success(...)`
 * etc.). Mounted once near the app root, same "one shared instance" pattern as `ConfirmDialog`.
 */
export function SnackbarHost() {
  const queue = useSnackbarStore((state) => state.queue);
  const dismiss = useSnackbarStore((state) => state.dismiss);
  const visible = queue.slice(0, MAX_VISIBLE);

  return (
    <Stack
      spacing={1}
      sx={{
        position: 'fixed',
        bottom: 24,
        insetInlineStart: 24,
        zIndex: (theme) => theme.zIndex.snackbar,
      }}
    >
      {visible.map((item, index) => (
        <Snackbar
          key={item.id}
          open
          autoHideDuration={item.autoHideDuration}
          onClose={(_event, reason) => {
            if (reason === 'clickaway') return;
            dismiss(item.id);
          }}
          sx={{ position: 'static', transform: 'none' }}
          style={{ order: index }}
        >
          <Alert
            onClose={() => {
              dismiss(item.id);
            }}
            severity={item.severity}
            variant="filled"
            sx={{ minWidth: 280 }}
          >
            {item.message}
          </Alert>
        </Snackbar>
      ))}
    </Stack>
  );
}
