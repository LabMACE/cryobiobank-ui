/* eslint react/jsx-key: off */
import {
    Create,
    SimpleForm,
    TextField,
    TextInput,
    required,
    ReferenceInput,
    SelectInput,
} from 'react-admin';
import CoordinateInput from '../../maps/CoordinateEntry';

const CreateComponent = () => {

    return (
        <Create redirect="show">
            <SimpleForm >
                <TextField source="id" />
                <ReferenceInput
                    source="area_id"
                    reference="areas"
                    label="Area"
                >
                    <SelectInput optionText="name" validate={[required()]} resettable/>
                </ReferenceInput>
                <TextInput source="name" validate={[required()]}/>
                <CoordinateInput />
            </SimpleForm>
        </Create >
    )
};

export default CreateComponent;
