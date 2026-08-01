import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import Button from '@mui/material/Button';
import { useTranslation } from 'react-i18next';
import { useConfirmDialogStore } from '@store/confirmDialogStore';

/**
 * Single app-level confirmation dialog driven by `useConfirmDialogStore` (see `useConfirm`
 * hook). Mounted once near the app root so every destructive action shares one instance instead
 * of each feature rendering its own dialog.
 */
export function ConfirmDialog() {
  const { t } = useTranslation();
  const isOpen = useConfirmDialogStore((state) => state.isOpen);
  const options = useConfirmDialogStore((state) => state.options);
  const handleClose = useConfirmDialogStore((state) => state.handleClose);

  return (
    <Dialog
      open={isOpen}
      onClose={() => {
        handleClose(false);
      }}
      maxWidth="xs"
      fullWidth
    >
      {options ? (
        <>
          <DialogTitle>{options.title}</DialogTitle>
          <DialogContent>
            <DialogContentText>{options.message}</DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button
              onClick={() => {
                handleClose(false);
              }}
              color="inherit"
            >
              {options.cancelLabel ?? t('confirmDialog.defaultCancel')}
            </Button>
            <Button
              onClick={() => {
                handleClose(true);
              }}
              color={options.destructive ? 'error' : 'primary'}
              variant="contained"
              autoFocus
            >
              {options.confirmLabel ?? t('confirmDialog.defaultConfirm')}
            </Button>
          </DialogActions>
        </>
      ) : null}
    </Dialog>
  );
}
