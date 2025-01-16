import {
    NumberInput,
    SimpleForm,
    TextInput,
    minValue,
    maxValue,
    required,
} from 'react-admin';
import CustomEdit from '../custom/Edit';

const EditComponent = () => {
    return (
        <CustomEdit redirect="show">
            <SimpleForm>
                <TextInput source="id" disabled />
                <TextInput source="name" />
                <NumberInput source="y" label="Latitude (°)" validate={[required(), minValue(-90), maxValue(90)]} />
                <NumberInput source="x" label="Longitude (°)" validate={[required(), minValue(-180), maxValue(180)]} />
                <NumberInput source="z" label="Elevation (m)" validate={[required()]} />
            </SimpleForm>
        </CustomEdit>
    )
};

export default EditComponent;
