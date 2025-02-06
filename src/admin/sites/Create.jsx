/* eslint react/jsx-key: off */
import {
    Create,
    SimpleForm,
    TextField,
    TextInput,
    required,
} from 'react-admin';
import CoordinateInput from '../../maps/CoordinateEntry';

const CreateComponent = () => {

    return (
        <Create redirect="show">
            <SimpleForm >
                <TextField source="id" />
                <TextInput source="name" validate={[required()]}/>
                <CoordinateInput />
            </SimpleForm>
        </Create >
    )
};

export default CreateComponent;
