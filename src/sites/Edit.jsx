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
        <CustomEdit redirect="show" mutationMode="pessimistic">
            <SimpleForm>
                <TextInput source="id" disabled />
                <TextInput source="name" />
                <NumberInput source="latitude_4326" label="Latitude (°)" validate={[required(), minValue(-90), maxValue(90)]} />
                <NumberInput source="longitude_4326" label="Longitude (°)" validate={[required(), minValue(-180), maxValue(180)]} />
                <NumberInput source="elevation_metres" label="Elevation (m)" validate={[required()]} />
            </SimpleForm>
        </CustomEdit>
    )
};

export default EditComponent;
