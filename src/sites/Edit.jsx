import {
    NumberInput,
    SimpleForm,
    TextInput,
    Toolbar,
    SaveButton,
} from 'react-admin';
import CustomEdit from '../custom/Edit';
import CoordinateInput from '../maps/CoordinateEntry';

const MyToolbar = () => (
    <Toolbar>
        <SaveButton alwaysEnable />
    </Toolbar>
);

const EditComponent = () => {
    return (
        <CustomEdit redirect="show" mutationMode="pessimistic">
            <SimpleForm toolbar={<MyToolbar />}>
                <TextInput source="id" disabled />
                <TextInput source="name" />
                {/* <NumberInput source="latitude_4326" label="Latitude (°)" validate={[required(), minValue(-90), maxValue(90)]} /> */}
                {/* <NumberInput source="longitude_4326" label="Longitude (°)" validate={[required(), minValue(-180), maxValue(180)]} /> */}
                {/* <NumberInput source="elevation_metres" label="Elevation (m)" validate={[required()]} /> */}
                <CoordinateInput />
            </SimpleForm>
        </CustomEdit>
    )
};

export default EditComponent;
