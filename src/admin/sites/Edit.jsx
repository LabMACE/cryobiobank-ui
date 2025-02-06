import {
    SimpleForm,
    TextInput,
    Toolbar,
    SaveButton,
    ReferenceInput,
    SelectInput,
    required,
} from 'react-admin';
import CustomEdit from '../custom/Edit';
import CoordinateInput from '../../maps/CoordinateEntry';

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
                <ReferenceInput
                    source="area_id"
                    reference="areas"
                    label="Area"
                >
                    <SelectInput optionText="name" validate={[required()]} resettable/>
                </ReferenceInput>
                <TextInput source="name" />
                <CoordinateInput />
            </SimpleForm>
        </CustomEdit>
    )
};

export default EditComponent;
