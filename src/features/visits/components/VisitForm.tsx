import { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import Grid from '@mui/material/Grid2';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Divider from '@mui/material/Divider';
import Alert from '@mui/material/Alert';
import IconButton from '@mui/material/IconButton';
import InputAdornment from '@mui/material/InputAdornment';
import MyLocationIcon from '@mui/icons-material/MyLocation';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import DeleteIcon from '@mui/icons-material/Delete';
import PersonSearchIcon from '@mui/icons-material/PersonSearch';
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile';
import ImageIcon from '@mui/icons-material/Image';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { useTranslation } from 'react-i18next';
import { visitSchema, type VisitFormValues } from '../schemas/visitSchema';
import {
  VISIT_STATUSES,
  VISIT_TYPES,
  VISIT_RECOMMENDATIONS,
  VISIT_PRIORITIES,
  type VisitAttachment,
} from '@types-app/visit';
import type { Case } from '@types-app/case';
import { CaseSelectModal } from './CaseSelectModal';
import { useLookupCollection, useCitiesByGovernorate } from '@hooks/useLookupCollection';
import { showSnackbar } from '@store/snackbarStore';
import { useAuthStore } from '@store/authStore';

interface VisitFormProps {
  initialValues?: Partial<VisitFormValues>;
  initialCase?: Case | null;
  existingAttachments?: VisitAttachment[];
  onSubmit: (values: VisitFormValues, selectedCase: Case, filesToUpload: File[]) => Promise<void>;
  onDeleteAttachment?: (attachmentId: string, filePath: string, fileName: string) => Promise<void>;
  isSubmitting?: boolean;
  isEditMode?: boolean;
}

export function VisitForm({
  initialValues,
  initialCase,
  existingAttachments = [],
  onSubmit,
  onDeleteAttachment,
  isSubmitting = false,
  isEditMode = false,
}: VisitFormProps) {
  const { t } = useTranslation();
  const currentUser = useAuthStore((state) => state.user);

  const [selectedCase, setSelectedCase] = useState<Case | null>(initialCase ?? null);
  const [caseModalOpen, setCaseModalOpen] = useState(false);
  const [filesToUpload, setFilesToUpload] = useState<File[]>([]);
  const [dragActive, setDragActive] = useState(false);

  // An empty string (visit's own address not set) must fall through to the case's address,
  // unlike `??` which would stop at ''.
  // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
  const defaultGovId = initialValues?.governorateId || selectedCase?.address?.governorateId || '';
  const [selectedGovId, setSelectedGovId] = useState<string>(defaultGovId);

  const { data: governorates } = useLookupCollection('governorates');
  // '' (no governorate selected yet) must map to `null` so the cities hook stays disabled;
  // `??` wouldn't catch '' since `selectedGovId` is a plain (non-nullable) string.
  const { data: cities } = useCitiesByGovernorate(selectedGovId || null);

  const todayStr = new Date().toISOString().split('T')[0];

  const {
    control,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<VisitFormValues>({
    resolver: zodResolver(visitSchema),
    defaultValues: {
      caseId: initialCase?.id ?? initialValues?.caseId ?? '',
      visitDate: initialValues?.visitDate ?? todayStr,
      visitType: initialValues?.visitType ?? 'initial_visit',
      status: initialValues?.status ?? 'completed',
      priority: initialValues?.priority ?? 'medium',
      researcherId: initialValues?.researcherId ?? currentUser?.uid ?? '',
      researcherName: initialValues?.researcherName ?? currentUser?.profile?.displayName ?? '',
      latitude: initialValues?.latitude ?? undefined,
      longitude: initialValues?.longitude ?? undefined,
      addressDetails: initialValues?.addressDetails ?? selectedCase?.address?.details ?? '',
      governorateId: defaultGovId,
      // Same '' vs. case-fallback reasoning as `defaultGovId` above.
      // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
      cityId: initialValues?.cityId || selectedCase?.address?.cityId || '',

      summary: initialValues?.summary ?? '',
      livingConditions: initialValues?.livingConditions ?? '',
      employmentStatus: initialValues?.employmentStatus ?? '',
      incomeVerification: initialValues?.incomeVerification ?? '',
      healthStatus: initialValues?.healthStatus ?? '',
      childrenStatus: initialValues?.childrenStatus ?? '',
      additionalNotes: initialValues?.additionalNotes ?? '',

      recommendation: initialValues?.recommendation ?? 'approve',
      recommendationReason: initialValues?.recommendationReason ?? '',
      suggestedAssistance: initialValues?.suggestedAssistance ?? '',
      suggestedAmount: initialValues?.suggestedAmount ?? 0,
      nextVisitDate: initialValues?.nextVisitDate ?? '',
    },
  });

  function handleSelectCase(c: Case): void {
    setSelectedCase(c);
    setValue('caseId', c.id, { shouldValidate: true });
    if (c.address?.governorateId) {
      setSelectedGovId(c.address.governorateId);
      setValue('governorateId', c.address.governorateId);
      if (c.address.cityId) {
        setValue('cityId', c.address.cityId);
      }
    }
    if (c.address?.details) {
      setValue('addressDetails', c.address.details);
    }
  }

  function handleGetGps(): void {
    if (!navigator.geolocation) {
      showSnackbar.error(t('visits.messages.gpsError'));
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setValue('latitude', pos.coords.latitude);
        setValue('longitude', pos.coords.longitude);
        showSnackbar.success(t('visits.messages.gpsSuccess'));
      },
      () => {
        showSnackbar.error(t('visits.messages.gpsError'));
      },
    );
  }

  function handleFileDrop(e: React.DragEvent<HTMLDivElement>): void {
    e.preventDefault();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const newFiles = Array.from(e.dataTransfer.files);
      setFilesToUpload((prev) => [...prev, ...newFiles]);
    }
  }

  function handleFileInputChange(e: React.ChangeEvent<HTMLInputElement>): void {
    if (e.target.files && e.target.files.length > 0) {
      const newFiles = Array.from(e.target.files);
      setFilesToUpload((prev) => [...prev, ...newFiles]);
    }
  }

  function removeFileToUpload(index: number): void {
    setFilesToUpload((prev) => prev.filter((_, i) => i !== index));
  }

  const onSubmitForm = async (values: VisitFormValues) => {
    if (!selectedCase) {
      showSnackbar.error('يرجى اختيار الحالة المستفيدة أولاً');
      return;
    }
    await onSubmit(values, selectedCase, filesToUpload);
  };

  return (
    <Box component="form" onSubmit={handleSubmit(onSubmitForm)} noValidate>
      <Stack spacing={4}>
        {/* SECTION 1: CASE INFORMATION */}
        <Paper variant="outlined" sx={{ p: 3, borderRadius: 2 }}>
          <Typography variant="h6" color="primary" gutterBottom sx={{ fontWeight: 'bold' }}>
            {t('visits.sections.caseInfo')}
          </Typography>
          <Divider sx={{ mb: 3 }} />

          {selectedCase ? (
            <Card variant="outlined" sx={{ bgcolor: 'action.hover', mb: 2 }}>
              <CardContent>
                <Grid container spacing={2} alignItems="center">
                  <Grid size={{ xs: 12, md: 8 }}>
                    <Stack direction="row" spacing={1} alignItems="center" mb={1}>
                      <CheckCircleIcon color="success" />
                      <Typography variant="subtitle1" fontWeight="bold">
                        {selectedCase.fullName}
                      </Typography>
                    </Stack>
                    <Typography variant="body2" color="text.secondary">
                      رقم الحالة: <strong>{selectedCase.caseNumber}</strong> | الرقم القومي: <strong>{selectedCase.nationalId}</strong>
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      أفراد الأسرة: <strong>{selectedCase.familyMembersCount}</strong> | الحالة الحالية: <strong>{selectedCase.status}</strong>
                    </Typography>
                  </Grid>

                  {!isEditMode && (
                    <Grid size={{ xs: 12, md: 4 }} textAlign={{ xs: 'left', md: 'right' }}>
                      <Button
                        variant="outlined"
                        size="small"
                        startIcon={<PersonSearchIcon />}
                        onClick={() => setCaseModalOpen(true)}
                      >
                        {t('visits.changeCase')}
                      </Button>
                    </Grid>
                  )}
                </Grid>
              </CardContent>
            </Card>
          ) : (
            <Box textAlign="center" py={3}>
              <Alert severity="warning" sx={{ mb: 2 }}>
                {t('visits.noCaseSelected')}
              </Alert>
              <Button
                variant="contained"
                startIcon={<PersonSearchIcon />}
                onClick={() => setCaseModalOpen(true)}
              >
                {t('visits.selectCase')}
              </Button>
              {errors.caseId && (
                <Typography color="error" variant="caption" display="block" sx={{ mt: 1 }}>
                  {t(errors.caseId.message ?? 'validation.required')}
                </Typography>
              )}
            </Box>
          )}
        </Paper>

        {/* SECTION 2: VISIT INFORMATION */}
        <Paper variant="outlined" sx={{ p: 3, borderRadius: 2 }}>
          <Typography variant="h6" color="primary" gutterBottom sx={{ fontWeight: 'bold' }}>
            {t('visits.sections.visitInfo')}
          </Typography>
          <Divider sx={{ mb: 3 }} />

          <Grid container spacing={3}>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <Controller
                name="visitDate"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    type="date"
                    label={t('visits.fields.visitDate')}
                    fullWidth
                    required
                    error={Boolean(errors.visitDate)}
                    helperText={errors.visitDate ? t(errors.visitDate.message ?? '') : ''}
                    InputLabelProps={{ shrink: true }}
                  />
                )}
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <Controller
                name="visitType"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    select
                    label={t('visits.fields.visitType')}
                    fullWidth
                    required
                    error={Boolean(errors.visitType)}
                    helperText={errors.visitType ? t(errors.visitType.message ?? '') : ''}
                  >
                    {VISIT_TYPES.map((type) => (
                      <MenuItem key={type} value={type}>
                        {t(`visits.types.${type}`)}
                      </MenuItem>
                    ))}
                  </TextField>
                )}
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <Controller
                name="priority"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    select
                    label={t('visits.fields.priority')}
                    fullWidth
                    required
                    error={Boolean(errors.priority)}
                    helperText={errors.priority ? t(errors.priority.message ?? '') : ''}
                  >
                    {VISIT_PRIORITIES.map((p) => (
                      <MenuItem key={p} value={p}>
                        {t(`visits.priorities.${p}`)}
                      </MenuItem>
                    ))}
                  </TextField>
                )}
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <Controller
                name="status"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    select
                    label={t('visits.fields.status')}
                    fullWidth
                    required
                    error={Boolean(errors.status)}
                    helperText={errors.status ? t(errors.status.message ?? '') : ''}
                  >
                    {VISIT_STATUSES.map((st) => (
                      <MenuItem key={st} value={st}>
                        {t(`visits.statuses.${st}`)}
                      </MenuItem>
                    ))}
                  </TextField>
                )}
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 6 }}>
              <Controller
                name="researcherName"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label={t('visits.fields.researcher')}
                    fullWidth
                    required
                    error={Boolean(errors.researcherName)}
                    helperText={errors.researcherName ? t(errors.researcherName.message ?? '') : ''}
                  />
                )}
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 6 }}>
              <Button
                variant="outlined"
                color="secondary"
                startIcon={<MyLocationIcon />}
                onClick={handleGetGps}
                fullWidth
                sx={{ height: 56 }}
              >
                {t('visits.fields.getGpsLocation')}
              </Button>
            </Grid>

            <Grid size={{ xs: 12, sm: 6 }}>
              <Controller
                name="latitude"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    type="number"
                    value={field.value ?? ''}
                    onChange={(e) => field.onChange(e.target.value === '' ? null : Number(e.target.value))}
                    label={t('visits.fields.latitude')}
                    fullWidth
                  />
                )}
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 6 }}>
              <Controller
                name="longitude"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    type="number"
                    value={field.value ?? ''}
                    onChange={(e) => field.onChange(e.target.value === '' ? null : Number(e.target.value))}
                    label={t('visits.fields.longitude')}
                    fullWidth
                  />
                )}
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 6 }}>
              <Controller
                name="governorateId"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    select
                    label={t('cases.fields.governorate')}
                    fullWidth
                    onChange={(e) => {
                      field.onChange(e.target.value);
                      setSelectedGovId(e.target.value);
                      setValue('cityId', '');
                    }}
                  >
                    <MenuItem value="">{t('cases.filters.statusFilterLabel')}</MenuItem>
                    {(governorates ?? []).map((gov) => (
                      <MenuItem key={gov.id} value={gov.id}>
                        {gov.name}
                      </MenuItem>
                    ))}
                  </TextField>
                )}
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 6 }}>
              <Controller
                name="cityId"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    select
                    label={t('cases.fields.city')}
                    fullWidth
                    disabled={!selectedGovId}
                  >
                    {(cities ?? []).map((city) => (
                      <MenuItem key={city.id} value={city.id}>
                        {city.name}
                      </MenuItem>
                    ))}
                  </TextField>
                )}
              />
            </Grid>

            <Grid size={{ xs: 12 }}>
              <Controller
                name="addressDetails"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label={t('visits.fields.addressDetails')}
                    fullWidth
                    multiline
                    rows={2}
                  />
                )}
              />
            </Grid>
          </Grid>
        </Paper>

        {/* SECTION 3: VISIT REPORT */}
        <Paper variant="outlined" sx={{ p: 3, borderRadius: 2 }}>
          <Typography variant="h6" color="primary" gutterBottom sx={{ fontWeight: 'bold' }}>
            {t('visits.sections.visitReport')}
          </Typography>
          <Divider sx={{ mb: 3 }} />

          <Grid container spacing={3}>
            <Grid size={{ xs: 12 }}>
              <Controller
                name="summary"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label={t('visits.fields.summary')}
                    fullWidth
                    required
                    multiline
                    rows={3}
                    error={Boolean(errors.summary)}
                    helperText={errors.summary ? t(errors.summary.message ?? '') : ''}
                  />
                )}
              />
            </Grid>

            <Grid size={{ xs: 12, md: 6 }}>
              <Controller
                name="livingConditions"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label={t('visits.fields.livingConditions')}
                    fullWidth
                    required
                    multiline
                    rows={3}
                    error={Boolean(errors.livingConditions)}
                    helperText={errors.livingConditions ? t(errors.livingConditions.message ?? '') : ''}
                  />
                )}
              />
            </Grid>

            <Grid size={{ xs: 12, md: 6 }}>
              <Controller
                name="employmentStatus"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label={t('visits.fields.employmentStatus')}
                    fullWidth
                    required
                    multiline
                    rows={3}
                    error={Boolean(errors.employmentStatus)}
                    helperText={errors.employmentStatus ? t(errors.employmentStatus.message ?? '') : ''}
                  />
                )}
              />
            </Grid>

            <Grid size={{ xs: 12, md: 6 }}>
              <Controller
                name="incomeVerification"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label={t('visits.fields.incomeVerification')}
                    fullWidth
                    required
                    multiline
                    rows={3}
                    error={Boolean(errors.incomeVerification)}
                    helperText={errors.incomeVerification ? t(errors.incomeVerification.message ?? '') : ''}
                  />
                )}
              />
            </Grid>

            <Grid size={{ xs: 12, md: 6 }}>
              <Controller
                name="healthStatus"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label={t('visits.fields.healthStatus')}
                    fullWidth
                    required
                    multiline
                    rows={3}
                    error={Boolean(errors.healthStatus)}
                    helperText={errors.healthStatus ? t(errors.healthStatus.message ?? '') : ''}
                  />
                )}
              />
            </Grid>

            <Grid size={{ xs: 12, md: 6 }}>
              <Controller
                name="childrenStatus"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label={t('visits.fields.childrenStatus')}
                    fullWidth
                    required
                    multiline
                    rows={3}
                    error={Boolean(errors.childrenStatus)}
                    helperText={errors.childrenStatus ? t(errors.childrenStatus.message ?? '') : ''}
                  />
                )}
              />
            </Grid>

            <Grid size={{ xs: 12, md: 6 }}>
              <Controller
                name="additionalNotes"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label={t('visits.fields.additionalNotes')}
                    fullWidth
                    multiline
                    rows={3}
                  />
                )}
              />
            </Grid>
          </Grid>
        </Paper>

        {/* SECTION 4: RECOMMENDATION */}
        <Paper variant="outlined" sx={{ p: 3, borderRadius: 2 }}>
          <Typography variant="h6" color="primary" gutterBottom sx={{ fontWeight: 'bold' }}>
            {t('visits.sections.recommendation')}
          </Typography>
          <Divider sx={{ mb: 3 }} />

          <Grid container spacing={3}>
            <Grid size={{ xs: 12, md: 6 }}>
              <Controller
                name="recommendation"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    select
                    label={t('visits.fields.recommendation')}
                    fullWidth
                    required
                    error={Boolean(errors.recommendation)}
                    helperText={errors.recommendation ? t(errors.recommendation.message ?? '') : ''}
                  >
                    {VISIT_RECOMMENDATIONS.map((rec) => (
                      <MenuItem key={rec} value={rec}>
                        {t(`visits.recommendations.${rec}`)}
                      </MenuItem>
                    ))}
                  </TextField>
                )}
              />
            </Grid>

            <Grid size={{ xs: 12, md: 6 }}>
              <Controller
                name="nextVisitDate"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    type="date"
                    value={field.value ?? ''}
                    onChange={(e) => field.onChange(e.target.value === '' ? null : e.target.value)}
                    label={t('visits.fields.nextVisitDate')}
                    fullWidth
                    InputLabelProps={{ shrink: true }}
                    error={Boolean(errors.nextVisitDate)}
                    helperText={errors.nextVisitDate ? errors.nextVisitDate.message : ''}
                  />
                )}
              />
            </Grid>

            <Grid size={{ xs: 12, md: 6 }}>
              <Controller
                name="suggestedAssistance"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label={t('visits.fields.suggestedAssistance')}
                    fullWidth
                  />
                )}
              />
            </Grid>

            <Grid size={{ xs: 12, md: 6 }}>
              <Controller
                name="suggestedAmount"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    type="number"
                    value={field.value ?? ''}
                    onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))}
                    label={t('visits.fields.suggestedAmount')}
                    fullWidth
                    InputProps={{
                      endAdornment: <InputAdornment position="end">ج.م</InputAdornment>,
                    }}
                  />
                )}
              />
            </Grid>

            <Grid size={{ xs: 12 }}>
              <Controller
                name="recommendationReason"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label={t('visits.fields.recommendationReason')}
                    fullWidth
                    required
                    multiline
                    rows={3}
                    error={Boolean(errors.recommendationReason)}
                    helperText={
                      errors.recommendationReason ? t(errors.recommendationReason.message ?? '') : ''
                    }
                  />
                )}
              />
            </Grid>
          </Grid>
        </Paper>

        {/* SECTION 5: ATTACHMENTS */}
        <Paper variant="outlined" sx={{ p: 3, borderRadius: 2 }}>
          <Typography variant="h6" color="primary" gutterBottom sx={{ fontWeight: 'bold' }}>
            {t('visits.sections.attachments')}
          </Typography>
          <Divider sx={{ mb: 3 }} />

          <Box
            onDragOver={(e) => {
              e.preventDefault();
              setDragActive(true);
            }}
            onDragLeave={() => setDragActive(false)}
            onDrop={handleFileDrop}
            sx={{
              p: 4,
              border: '2px dashed',
              borderColor: dragActive ? 'primary.main' : 'divider',
              borderRadius: 2,
              bgcolor: dragActive ? 'action.hover' : 'background.paper',
              textAlign: 'center',
              cursor: 'pointer',
              mb: 3,
            }}
            onClick={() => document.getElementById('visit-file-input')?.click()}
          >
            <input
              id="visit-file-input"
              type="file"
              multiple
              accept="image/*,application/pdf"
              style={{ display: 'none' }}
              onChange={handleFileInputChange}
            />
            <CloudUploadIcon color="primary" sx={{ fontSize: 48, mb: 1 }} />
            <Typography variant="subtitle1" fontWeight="bold">
              {t('visits.attachments.dragDrop')}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {t('visits.attachments.supportedFormats')}
            </Typography>
          </Box>

          {/* New files to upload */}
          {filesToUpload.length > 0 && (
            <Box mb={3}>
              <Typography variant="subtitle2" gutterBottom>
                الملفات الجاهزة للرفع ({filesToUpload.length}):
              </Typography>
              <Stack spacing={1}>
                {filesToUpload.map((file, idx) => (
                  <Paper
                    key={idx}
                    variant="outlined"
                    sx={{ p: 1.5, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}
                  >
                    <Stack direction="row" spacing={1.5} alignItems="center">
                      {file.type.startsWith('image/') ? (
                        <ImageIcon color="primary" />
                      ) : (
                        <InsertDriveFileIcon color="action" />
                      )}
                      <Box>
                        <Typography variant="body2" fontWeight="bold">
                          {file.name}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {(file.size / 1024 / 1024).toFixed(2)} MB
                        </Typography>
                      </Box>
                    </Stack>
                    <IconButton size="small" color="error" onClick={() => removeFileToUpload(idx)}>
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </Paper>
                ))}
              </Stack>
            </Box>
          )}

          {/* Existing uploaded attachments */}
          {existingAttachments.length > 0 && (
            <Box>
              <Typography variant="subtitle2" gutterBottom>
                المرفقات المرفوعة سابقاً ({existingAttachments.length}):
              </Typography>
              <Grid container spacing={2}>
                {existingAttachments.map((att) => (
                  <Grid size={{ xs: 12, sm: 6, md: 4 }} key={att.id}>
                    <Paper
                      variant="outlined"
                      sx={{ p: 1.5, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}
                    >
                      <Stack direction="row" spacing={1.5} alignItems="center" overflow="hidden">
                        {att.fileType?.startsWith('image/') ? (
                          <ImageIcon color="primary" />
                        ) : (
                          <InsertDriveFileIcon color="action" />
                        )}
                        <Typography variant="body2" noWrap>
                          {att.fileName}
                        </Typography>
                      </Stack>
                      {onDeleteAttachment && (
                        <IconButton
                          size="small"
                          color="error"
                          onClick={() => onDeleteAttachment(att.id, att.filePath, att.fileName)}
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      )}
                    </Paper>
                  </Grid>
                ))}
              </Grid>
            </Box>
          )}
        </Paper>

        {/* SUBMIT BUTTONS */}
        <Stack direction="row" spacing={2} justifyContent="flex-end">
          <Button
            type="submit"
            variant="contained"
            size="large"
            disabled={isSubmitting}
            sx={{ minWidth: 160 }}
          >
            {isSubmitting
              ? t('common.loading')
              : isEditMode
                ? t('visits.actions.save')
                : t('visits.actions.create')}
          </Button>
        </Stack>
      </Stack>

      <CaseSelectModal
        open={caseModalOpen}
        onClose={() => setCaseModalOpen(false)}
        onSelect={handleSelectCase}
      />
    </Box>
  );
}
