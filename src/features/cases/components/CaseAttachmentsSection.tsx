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
import { useCaseAttachments } from '../hooks/useCaseAttachments';
import { uploadCaseAttachment, deleteCaseAttachment } from '../api/caseService';
import { useAuthStore } from '@store/authStore';
import { showSnackbar } from '@store/snackbarStore';
import { LoadingSpinner, EmptyState } from '@components/common';
import type { CaseAttachment, CaseAttachmentCategory } from '@types-app/case';

interface CaseAttachmentsSectionProps {
  caseId: string;
  category: CaseAttachmentCategory;
  title: string;
  accept?: string;
}

/** ID card images / supporting documents for a case, uploaded to Cloudinary (same unsigned-upload
 * service the Visits module uses). Mirrors `VisitAttachmentsTab`'s shape by design — this
 * codebase keeps each feature's attachment UI self-contained rather than sharing a generic
 * component across features (see `VisitForm`/`CaseForm` for the same precedent). */
export function CaseAttachmentsSection({
  caseId,
  category,
  title,
  accept = 'image/*,application/pdf',
}: CaseAttachmentsSectionProps) {
  const { t } = useTranslation();
  const currentUser = useAuthStore((state) => state.user);
  const { attachments, loading } = useCaseAttachments(caseId, category);

  const [previewAttachment, setPreviewAttachment] = useState<CaseAttachment | null>(null);
  const [uploading, setUploading] = useState(false);

  async function handleFileUpload(files: FileList | null): Promise<void> {
    if (!files || files.length === 0 || !currentUser) return;
    setUploading(true);
    try {
      for (const file of Array.from(files)) {
        await uploadCaseAttachment(caseId, file, category, {
          uid: currentUser.uid,
          displayName: currentUser.profile?.displayName ?? 'مستخدم',
        });
      }
      showSnackbar.success(t('cases.attachments.uploadSuccess'));
    } catch {
      showSnackbar.error(t('cases.attachments.uploadError'));
    } finally {
      setUploading(false);
    }
  }

  async function handleDelete(att: CaseAttachment): Promise<void> {
    try {
      await deleteCaseAttachment(caseId, att.id);
      showSnackbar.success(t('cases.attachments.deleteSuccess'));
    } catch {
      showSnackbar.error(t('cases.attachments.deleteError'));
    }
  }

  return (
    <Paper variant="outlined" sx={{ p: 3, borderRadius: 2 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h6" color="primary" fontWeight="bold">
          {title}
        </Typography>

        <Button variant="contained" component="label" startIcon={<CloudUploadIcon />} disabled={uploading}>
          {uploading ? t('common.loading') : t('cases.attachments.uploadFiles')}
          <input
            type="file"
            multiple
            accept={accept}
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
          title={t('cases.attachments.empty')}
          description={t('cases.attachments.supportedFormats')}
        />
      ) : (
        <Grid container spacing={3}>
          {attachments.map((att) => {
            const isImage = att.fileType?.startsWith('image/');
            return (
              <Grid size={{ xs: 12, sm: 6, md: 4 }} key={att.id}>
                <Card
                  variant="outlined"
                  sx={{ borderRadius: 2, height: '100%', display: 'flex', flexDirection: 'column' }}
                >
                  {isImage ? (
                    <CardMedia
                      component="img"
                      height="160"
                      image={att.fileUrl}
                      alt={att.fileName}
                      sx={{ objectFit: 'cover', cursor: 'pointer' }}
                      onClick={() => setPreviewAttachment(att)}
                    />
                  ) : (
                    <Box
                      height={160}
                      bgcolor="action.hover"
                      display="flex"
                      flexDirection="column"
                      alignItems="center"
                      justifyContent="center"
                    >
                      <InsertDriveFileIcon color="action" sx={{ fontSize: 56, mb: 1 }} />
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
                      {(att.fileSize / 1024 / 1024).toFixed(2)} MB
                    </Typography>
                  </CardContent>

                  <CardActions sx={{ justifyContent: 'space-between', px: 2, pb: 2 }}>
                    <Button size="small" startIcon={<VisibilityIcon />} onClick={() => setPreviewAttachment(att)}>
                      {t('cases.attachments.preview')}
                    </Button>

                    <Stack direction="row" spacing={1}>
                      <IconButton size="small" component="a" href={att.fileUrl} target="_blank" download={att.fileName}>
                        <DownloadIcon fontSize="small" />
                      </IconButton>
                      <IconButton size="small" color="error" onClick={() => void handleDelete(att)}>
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

      <Dialog open={Boolean(previewAttachment)} onClose={() => setPreviewAttachment(null)} maxWidth="md" fullWidth>
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
            <Box
              component="img"
              src={previewAttachment.fileUrl}
              alt={previewAttachment.fileName}
              sx={{ maxWidth: '100%', maxHeight: '70vh', borderRadius: 1 }}
            />
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
    </Paper>
  );
}
