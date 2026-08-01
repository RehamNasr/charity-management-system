import { z } from 'zod';

export const loginSchema = z.object({
  email: z.email('validation.invalidEmail'),
  password: z.string().min(6, 'validation.passwordMinLength'),
  rememberMe: z.boolean(),
});

export type LoginFormValues = z.infer<typeof loginSchema>;

export const forgotPasswordSchema = z.object({
  email: z.email('validation.invalidEmail'),
});

export type ForgotPasswordFormValues = z.infer<typeof forgotPasswordSchema>;
