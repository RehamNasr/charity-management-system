import Checkbox from '@mui/material/Checkbox';
import FormControlLabel from '@mui/material/FormControlLabel';
import FormHelperText from '@mui/material/FormHelperText';
import Box from '@mui/material/Box';
import { Controller, type Control, type FieldPath, type FieldValues } from 'react-hook-form';

interface FormCheckboxProps<TFieldValues extends FieldValues> {
  name: FieldPath<TFieldValues>;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- see FormTextField's control prop
  control: Control<TFieldValues, any, any>;
  label: string;
  disabled?: boolean;
}

export function FormCheckbox<TFieldValues extends FieldValues>({
  name,
  control,
  label,
  disabled,
}: FormCheckboxProps<TFieldValues>) {
  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState }) => (
        <Box>
          <FormControlLabel
            control={
              <Checkbox
                checked={Boolean(field.value)}
                onChange={(event) => {
                  field.onChange(event.target.checked);
                }}
                onBlur={field.onBlur}
                disabled={disabled}
              />
            }
            label={label}
          />
          {fieldState.error ? (
            <FormHelperText error>{fieldState.error.message}</FormHelperText>
          ) : null}
        </Box>
      )}
    />
  );
}
