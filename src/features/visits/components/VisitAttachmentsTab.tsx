import { useState } from 'react';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';
import Grid from '@mui/material/Grid2';
import Card from '@mui/material/Card';
import CardMedia from '@mui/material/CardMedia';
import CardContent from '@mui/material/CardContent';
import CardActions from '@mui/material/CardActions';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import Divider from '@mui/material/Divider';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import DownloadIcon from '@mui/icons-material/Download';
import DeleteIcon from '@mui/icons-material/Delete';
import VisibilityIcon from '@mui/icons-material/Visibility';
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile';
import CloseIcon from '@mui/icons-material/Close';
import { useTranslation } from 'react-i18next';
import { useVisitAttachments } from '../hooks/useVisitAttachments';
import { uploadVisitAttachment, deleteVisitAttachment } from '../api/visitService';
import { useAuthStore } from '@store/authStore';
import { showSnackbar } from '@store/snackbarStore';
import { LoadingSpinner, EmptyState } from '@components/common';
import type { VisitAttachment } from '@types-app/visit';

interface VisitAttachmentsTabProps {
  visitId: string;
}

export function VisitAttachmentsTab({ visitId }: VisitAttachmentsTabProps) {
  const { t } = useTranslation();
  const currentUser = useAuthStore((state) => state.user);
  const { attachments, loading } = useVisitAttachments(visitId);

  const [previewAttachment, setPreviewAttachment] = useState<VisitAttachment | null>(null);
  const [uploading, setUploading] = useState(false);

  async function handleFileUpload(files: FileList | null): Promise<void> {
    if (!files || files.length === 0 || !currentUser) return;
    setUploading(true);
    try {
      for (const file of Array.from(files)) {
        await uploadVisitAttachment(
          visitId,
          file,
          { uid: currentUser.uid, displayName: currentUser.profile?.displayName ?? 'مستخدم' },
        );
      }
      showSnackbar.success(t('visits.attachments.uploadSuccess'));
    } catch {
      showSnackbar.error('تعذر رفع المرفق، حاول مرة أخرى');
    } finally {
      setUploading(false);
    }
  }

  async function handleDelete(att: VisitAttachment): Promise<void> {
    if (!currentUser) return;
    try {
      await deleteVisitAttachment(
        visitId,
        att.id,
        att.filePath,
        att.fileName,
        { uid: currentUser.uid, displayName: currentUser.profile?.displayName ?? 'مستخدم' },
      );
      showSnackbar.success(t('visits.attachments.deleteSuccess'));
    } catch {
      showSnackbar.error('تعذر حذف المرفق');
    }
  }

  return (
    <Stack spacing={3}>
      <Paper variant="outlined" sx={{ p: 3, borderRadius: 2 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <Typography variant="h6" color="primary" fontWeight="bold">
            مرفقات وصور الزيارة
          </Typography>

          <Button
            variant="contained"
            component="label"
            startIcon={<CloudUploadIcon />}
            disabled={uploading}
          >
            {uploading ? t('common.loading') : t('visits.actions.uploadFiles')}
            <input
              type="file"
              multiple
              accept="image/*,application/pdf"
              hidden
              onChange={(e) => void handleFileUpload(e.target.files)}
            />
          </Button>
        </Box>
        <Divider sx={{ mb: 3 }} />

        {loading ? (
          <LoadingSpinner />
        ) : attachments.length === 0 ? (
          <EmptyState
            title={t('visits.attachments.empty')}
            description={t('visits.attachments.supportedFormats')}
          />
        ) : (
          <Grid container spacing={3}>
            {attachments.map((att) => {
              const isImage = att.fileType?.startsWith('image/');
              return (
                <Grid size={{ xs: 12, sm: 6, md: 4 }} key={att.id}>
                  <Card variant="outlined" sx={{ borderRadius: 2, height: '100%', display: 'flex', flexDirection: 'column' }}>
                    {isImage ? (
                      <CardMedia
                        component="img"
                        height="180"
                        image={att.fileUrl}
                        alt={att.fileName}
                        sx={{ objectFit: 'cover', cursor: 'pointer' }}
                        onClick={() => setPreviewAttachment(att)}
                      />
                    ) : (
                      <Box
                        height={180}
                        bgcolor="action.hover"
                        display="flex"
                        flexDirection="column"
                        alignItems="center"
                        justifyContent="center"
                      >
                        <InsertDriveFileIcon color="action" sx={{ fontSize: 64, mb: 1 }} />
                        <Typography variant="caption" color="text.secondary">
                          مستند PDF / ملف
                        </Typography>
                      </Box>
                    )}

                    <CardContent sx={{ flexGrow: 1 }}>
                      <Typography variant="subtitle2" noWrap fontWeight="bold" title={att.fileName}>
                        {att.fileName}
                      </Typography>
                      <Typography variant="caption" color="text.secondary" display="block">
                        الحجم: {(att.fileSize / 1024 / 1024).toFixed(2)} MB
                      </Typography>
                    </CardContent>

                    <CardActions sx={{ justifyContent: 'space-between', px: 2, pb: 2 }}>
                      <Button
                        size="small"
                        startIcon={<VisibilityIcon />}
                        onClick={() => setPreviewAttachment(att)}
                      >
                        معاينة
                      </Button>

                      <Stack direction="row" spacing={1}>
                        <IconButton
                          size="small"
                          component="a"
                          href={att.fileUrl}
                          target="_blank"
                          download={att.fileName}
                        >
                          <DownloadIcon fontSize="small" />
                        </IconButton>

                        <IconButton
                          size="small"
                          color="error"
                          onClick={() => void handleDelete(att)}
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Stack>
                    </CardActions>
                  </Card>
                </Grid>
              );
            })}
          </Grid>
        )}
      </Paper>

      {/* Preview Dialog */}
      <Dialog
        open={Boolean(previewAttachment)}
        onClose={() => setPreviewAttachment(null)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="subtitle1" fontWeight="bold">
            {previewAttachment?.fileName}
          </Typography>
          <IconButton onClick={() => setPreviewAttachment(null)} size="small">
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers sx={{ p: 2, textAlign: 'center' }}>
          {previewAttachment?.fileType?.startsWith('image/') ? (
            <Box component="img" src={previewAttachment.fileUrl} alt={previewAttachment.fileName} sx={{ maxWidth: '100%', maxHeight: '70vh', borderRadius: 1 }} />
          ) : (
            <iframe
              src={previewAttachment?.fileUrl}
              title={previewAttachment?.fileName}
              width="100%"
              height="500px"
              style={{ border: 'none' }}
            />
          )}
        </DialogContent>
      </Dialog>
    </Stack>
  );
}
