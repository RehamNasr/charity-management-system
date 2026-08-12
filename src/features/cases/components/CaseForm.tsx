import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslation } from 'react-i18next';
import Grid from '@mui/material/Grid2';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { FormTextField, FormSelect } from '@components/form';
import { caseFormSchema, type CaseFormInput, type CaseFormValues } from '../schemas/caseSchema';
import {
  useLookupCollection,
  useCitiesByGovernorate,
  useVillagesByCity,
} from '@hooks/useLookupCollection';
import { showSnackbar } from '@store/snackbarStore';
import {
  CASE_PRIORITY_OPTIONS,
  SOCIAL_RESEARCH_STATUS_OPTIONS,
  MARITAL_STATUS_OPTIONS,
  ASSISTANCE_TYPE_OPTIONS,
} from '@constants/caseStatus';
import type { CaseStatus } from '@types-app/case';
import type { SelectOption } from '@types-app/common';

interface CaseFormProps {
  defaultValues: CaseFormInput;
  statusOptions: SelectOption<CaseStatus>[];
  onSubmit: (
    values: CaseFormValues,
    governorateName: string,
    cityName: string,
    villageName: string,
  ) => Promise<void>;
  submitLabel: string;
  submitting: boolean;
  onCancel: () => void;
}

export function CaseForm({
  defaultValues,
  statusOptions,
  onSubmit,
  submitLabel,
  submitting,
  onCancel,
}: CaseFormProps) {
  const { t } = useTranslation();
  const { control, handleSubmit, watch } = useForm<CaseFormInput, unknown, CaseFormValues>({
    resolver: zodResolver(caseFormSchema),
    defaultValues,
  });

  const governorateId = watch('governorateId');
  const cityId = watch('cityId');
  const governorates = useLookupCollection('governorates');
  const cities = useCitiesByGovernorate(governorateId || null);
  const villages = useVillagesByCity(cityId || null);
  const caseTypes = useLookupCollection('caseTypes');

  const submit = handleSubmit(
    async (values) => {
      const governorateName =
        governorates.data?.find((g) => g.id === values.governorateId)?.name ?? '';
      const cityName = cities.data?.find((c) => c.id === values.cityId)?.name ?? '';
      const villageName = villages.data?.find((v) => v.id === values.villageId)?.name ?? '';
      await onSubmit(values, governorateName, cityName, villageName);
    },
    (errors) => {
      console.warn('CaseForm validation errors:', errors);
      showSnackbar.error('يرجى التأكد من صحة البيانات المدخلة في جميع الحقول المطلوبة');
    },
  );

  const fieldsDisabled = submitting;

  return (
    <Box component="form" onSubmit={(event) => void submit(event)} noValidate>
      <Grid container spacing={2.5}>
        <Grid size={{ xs: 12, sm: 6 }}>
          <FormTextField
            name="fullName"
            control={control}
            label={t('cases.fields.fullName')}
            disabled={fieldsDisabled}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6 }}>
          <FormTextField
            name="nationalId"
            control={control}
            label={t('cases.fields.nationalId')}
            disabled={fieldsDisabled}
            slotProps={{ htmlInput: { inputMode: 'numeric', maxLength: 14 } }}
          />
        </Grid>

        <Grid size={{ xs: 12, sm: 6 }}>
          <FormTextField
            name="phone"
            control={control}
            label={t('cases.fields.phone')}
            disabled={fieldsDisabled}
            slotProps={{ htmlInput: { inputMode: 'numeric', maxLength: 11 } }}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6 }}>
          <FormSelect
            name="status"
            control={control}
            label={t('cases.fields.status')}
            options={statusOptions}
            disabled={submitting}
          />
        </Grid>

        <Grid size={{ xs: 12, sm: 4 }}>
          <FormSelect
            name="priorityLevel"
            control={control}
            label={t('cases.fields.priority')}
            options={CASE_PRIORITY_OPTIONS}
            disabled={fieldsDisabled}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 4 }}>
          <FormSelect
            name="socialResearchStatus"
            control={control}
            label={t('cases.fields.socialResearchStatus')}
            options={SOCIAL_RESEARCH_STATUS_OPTIONS}
            disabled={fieldsDisabled}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 4 }}>
          <FormSelect
            name="maritalStatus"
            control={control}
            label="الحالة الاجتماعية"
            options={MARITAL_STATUS_OPTIONS}
            disabled={fieldsDisabled}
          />
        </Grid>

        <Grid size={{ xs: 12, sm: 6 }}>
          <FormSelect
            name="assistanceType"
            control={control}
            label="نوع المساعدة"
            options={ASSISTANCE_TYPE_OPTIONS}
            disabled={fieldsDisabled}
          />
        </Grid>

        <Grid size={{ xs: 12, sm: 6 }}>
          <FormSelect
            name="governorateId"
            control={control}
            label={t('cases.fields.governorate')}
            options={(governorates.data ?? []).map((g) => ({ value: g.id, label: g.name }))}
            disabled={fieldsDisabled}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6 }}>
          <Stack spacing={0.5}>
            <FormSelect
              name="cityId"
              control={control}
              label={t('cases.fields.city')}
              options={(cities.data ?? []).map((c) => ({ value: c.id, label: c.name }))}
              disabled={fieldsDisabled || !governorateId || cities.loading}
            />
            {!governorateId ? (
              <Typography variant="caption" color="text.secondary">
                {t('cases.selectGovernorateFirst')}
              </Typography>
            ) : null}
          </Stack>
        </Grid>

        <Grid size={{ xs: 12, sm: 6 }}>
          <Stack spacing={0.5}>
            <FormSelect
              name="villageId"
              control={control}
              label={t('cases.fields.village')}
              options={(villages.data ?? []).map((v) => ({ value: v.id, label: v.name }))}
              disabled={fieldsDisabled || !cityId || villages.loading}
            />
            {!cityId ? (
              <Typography variant="caption" color="text.secondary">
                {t('cases.selectCityFirst')}
              </Typography>
            ) : null}
          </Stack>
        </Grid>
        <Grid size={{ xs: 12, sm: 6 }}>
          <FormTextField
            name="addressDetails"
            control={control}
            label={t('cases.fields.addressDetails')}
            disabled={fieldsDisabled}
          />
        </Grid>

        <Grid size={12}>
          <FormSelect
            name="caseTypeIds"
            control={control}
            label={t('cases.fields.caseType')}
            options={(caseTypes.data ?? []).map((c) => ({ value: c.id, label: c.name }))}
            disabled={fieldsDisabled}
            slotProps={{
              select: {
                multiple: true,
                renderValue: (selected) =>
                  (selected as string[])
                    .map((id) => caseTypes.data?.find((c) => c.id === id)?.name)
                    .filter(Boolean)
                    .join('، '),
              },
            }}
          />
        </Grid>

        <Grid size={{ xs: 12, sm: 4 }}>
          <FormTextField
            name="familyMembersCount"
            control={control}
            label={t('cases.fields.familyMembersCount')}
            type="number"
            disabled={fieldsDisabled}
            slotProps={{ htmlInput: { min: 1 } }}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 4 }}>
          <FormTextField
            name="monthlyIncome"
            control={control}
            label={t('cases.fields.monthlyIncome')}
            type="number"
            disabled={fieldsDisabled}
            slotProps={{ htmlInput: { min: 0, step: '0.01' } }}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 4 }}>
          <FormTextField
            name="monthlyExpenses"
            control={control}
            label={t('cases.fields.monthlyExpenses')}
            type="number"
            disabled={fieldsDisabled}
            slotProps={{ htmlInput: { min: 0, step: '0.01' } }}
          />
        </Grid>

        <Grid size={12}>
          <FormTextField
            name="notes"
            control={control}
            label={t('cases.fields.notes')}
            disabled={fieldsDisabled}
            multiline
            minRows={3}
          />
        </Grid>
      </Grid>

      <Stack direction="row" spacing={2} justifyContent="flex-end" mt={3}>
        <Button onClick={onCancel} color="inherit" disabled={submitting}>
          {t('cases.actions.cancel')}
        </Button>
        <Button type="submit" variant="contained" disabled={submitting}>
          {submitLabel}
        </Button>
      </Stack>
    </Box>
  );
}
