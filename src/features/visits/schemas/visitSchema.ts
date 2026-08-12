import { z } from 'zod';
import {
  VISIT_STATUSES,
  VISIT_TYPES,
  VISIT_RECOMMENDATIONS,
  VISIT_PRIORITIES,
} from '@types-app/visit';

export const visitSchema = z
  .object({
    caseId: z.string().min(1, 'validation.required'),
    visitDate: z.string().min(1, 'validation.required'),
    visitType: z.enum(VISIT_TYPES, 'validation.required'),
    status: z.enum(VISIT_STATUSES, 'validation.required'),
    priority: z.enum(VISIT_PRIORITIES, 'validation.required'),
    researcherId: z.string().min(1, 'validation.required'),
    researcherName: z.string().min(1, 'validation.required'),

    // Location
    latitude: z.number().nullable().optional(),
    longitude: z.number().nullable().optional(),
    addressDetails: z.string().optional(),
    governorateId: z.string().optional(),
    cityId: z.string().optional(),

    // Report (Section 3 - Optional)
    summary: z.string().max(2000, 'validation.maxLength2000').optional(),
    livingConditions: z.string().optional(),
    employmentStatus: z.string().optional(),
    incomeVerification: z.string().optional(),
    healthStatus: z.string().optional(),
    childrenStatus: z.string().optional(),
    additionalNotes: z.string().optional(),

    // Recommendation
    recommendation: z.enum(VISIT_RECOMMENDATIONS, 'validation.required'),
    recommendationReason: z
      .string()
      .min(5, 'validation.minLength3')
      .max(2000, 'validation.maxLength2000'),
    suggestedAssistance: z.string().optional(),
    suggestedAmount: z.number().min(0, 'validation.minValue0').optional(),
    nextVisitDate: z.string().nullable().optional(),
  })
  .refine(
    (data) => {
      if (!data.nextVisitDate || data.nextVisitDate.trim() === '') return true;
      const reminderDate = new Date(data.nextVisitDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      return reminderDate >= today;
    },
    {
      message: 'تاريخ الزيارة القادمة يجب أن يكون في المستقبل',
      path: ['nextVisitDate'],
    },
  );

export type VisitFormValues = z.infer<typeof visitSchema>;
