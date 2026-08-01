import TextField, { type TextFieldProps } from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';
import { Controller, type Control, type FieldPath, type FieldValues } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import type { SelectOption } from '@types-app/common';

type FormSelectProps<TFieldValues extends FieldValues> = Omit<
  TextFieldProps,
  'name' | 'error' | 'helperText' | 'value' | 'onChange' | 'onBlur' | 'select'
> & {
  name: FieldPath<TFieldValues>;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- see FormTextField's control prop
  control: Control<TFieldValues, any, any>;
  label: string;
  options: SelectOption[];
  emptyOptionLabel?: string;
};

/** React Hook Form + MUI `TextField select` binding for simple, static option lists (lookup
 * collections — governorates, case types, etc. — once those modules exist). */
export function FormSelect<TFieldValues extends FieldValues>({
  name,
  control,
  label,
  options,
  emptyOptionLabel,
  ...textFieldProps
}: FormSelectProps<TFieldValues>) {
  const { t } = useTranslation();

  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState }) => (
        <TextField
          {...textFieldProps}
          {...field}
          select
          label={label}
          error={Boolean(fieldState.error)}
          helperText={fieldState.error?.message ? t(fieldState.error.message) : undefined}
          fullWidth
        >
          {emptyOptionLabel ? (
            <MenuItem value="">
              <em>{emptyOptionLabel}</em>
            </MenuItem>
          ) : null}
          {options.map((option) => (
            <MenuItem key={option.value} value={option.value}>
              {option.label}
            </MenuItem>
          ))}
        </TextField>
      )}
    />
  );
}
