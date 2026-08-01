import { z } from 'zod';
import { CASE_STATUSES, CASE_PRIORITIES, SOCIAL_RESEARCH_STATUSES } from '@types-app/case';

const EGYPT_NATIONAL_ID_PATTERN = /^[0-9]{14}$/;
const EGYPT_PHONE_PATTERN = /^01[0125][0-9]{8}$/;

export const caseFormSchema = z.object({
  fullName: z.string().min(3, 'validation.minLength3').max(120, 'validation.maxLength120'),
  nationalId: z.string().regex(EGYPT_NATIONAL_ID_PATTERN, 'validation.invalidNationalId'),
  phone: z.string().regex(EGYPT_PHONE_PATTERN, 'validation.invalidPhone'),
  governorateId: z.string().min(1, 'validation.required'),
  cityId: z.string().min(1, 'validation.required'),
  villageId: z.string().min(1, 'validation.required'),
  addressDetails: z.string().min(3, 'validation.required'),
  caseTypeIds: z.array(z.string()).min(1, 'validation.atLeastOneCaseType'),
  familyMembersCount: z.coerce
    .number({ error: 'validation.invalidNumber' })
    .int('validation.invalidNumber')
    .min(1, 'validation.minValue1'),
  monthlyIncome: z.coerce
    .number({ error: 'validation.invalidNumber' })
    .min(0, 'validation.minValue0'),
  monthlyExpenses: z.coerce
    .number({ error: 'validation.invalidNumber' })
    .min(0, 'validation.minValue0'),
  priorityLevel: z.enum(CASE_PRIORITIES, 'validation.required'),
  status: z.enum(CASE_STATUSES, 'validation.required'),
  socialResearchStatus: z.enum(SOCIAL_RESEARCH_STATUSES, 'validation.required'),
  notes: z.string().max(2000, 'validation.maxLength2000').optional(),
});

/**
 * `z.coerce.number()` accepts `unknown` as its *input* type (it coerces whatever the MUI
 * `TextField` hands back) but only ever *outputs* `number`. RHF's `useForm` therefore needs both
 * generics: `CaseFormInput` types the raw, pre-validation field values (what `defaultValues` and
 * the controlled inputs work with), while `CaseFormValues` (docs/ARCHITECTURE.md-aligned, see
 * `src/types/case.ts`) is the validated/coerced shape `handleSubmit`'s callback receives.
 */
export type CaseFormInput = z.input<typeof caseFormSchema>;
export type CaseFormValues = z.output<typeof caseFormSchema>;
