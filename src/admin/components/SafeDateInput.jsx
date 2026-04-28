import { useInput } from 'react-admin';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import dayjs from 'dayjs';

const SafeDateInput = ({ source, label, validate, ...rest }) => {
    const { field, fieldState, isRequired } = useInput({ source, validate, ...rest });

    return (
        <DatePicker
            label={label}
            value={field.value ? dayjs(field.value) : null}
            onChange={(date) => {
                field.onChange(date?.isValid() ? date.format('YYYY-MM-DD') : null);
            }}
            onClose={field.onBlur}
            format="DD/MM/YYYY"
            slotProps={{
                textField: {
                    fullWidth: true,
                    variant: 'filled',
                    size: 'small',
                    margin: 'dense',
                    required: isRequired,
                    error: !!fieldState.error,
                    helperText: fieldState.error?.message,
                    name: field.name,
                    onBlur: field.onBlur,
                },
            }}
        />
    );
};

export default SafeDateInput;
