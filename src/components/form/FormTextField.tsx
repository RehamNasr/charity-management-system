import TextField, { type TextFieldProps } from '@mui/material/TextField';
import { Controller, type Control, type FieldPath, type FieldValues } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

type FormTextFieldProps<TFieldValues extends FieldValues> = Omit<
  TextFieldProps,
  'name' | 'error' | 'helperText' | 'value' | 'onChange' | 'onBlur'
> & {
  name: FieldPath<TFieldValues>;
  /** A resolver (e.g. z.coerce fields) may transform values to a different output type;
   * Controller itself only cares about TFieldValues for field-name typing, so the
   * transformed-output generic is intentionally left open here. */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  control: Control<TFieldValues, any, any>;
  label: string;
};

/** React Hook Form + MUI TextField binding, wired to a Zod-validated form. Every text input in
 * the app should use this instead of manually wiring `register`/`Controller` each time. */
export function FormTextField<TFieldValues extends FieldValues>({
  name,
  control,
  label,
  ...textFieldProps
}: FormTextFieldProps<TFieldValues>) {
  const { t } = useTranslation();

  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState }) => (
        <TextField
          {...textFieldProps}
          {...field}
          label={label}
          error={Boolean(fieldState.error)}
          helperText={fieldState.error?.message ? t(fieldState.error.message) : undefined}
          fullWidth
        />
      )}
    />
  );
}
