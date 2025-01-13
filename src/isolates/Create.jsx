/* eslint react/jsx-key: off */
import {
    Create,
    SimpleForm,
    TextField,
    TextInput,
    required,
} from 'react-admin';


const CreateComponent = () => {

    return (
        <Create redirect="show">
            <SimpleForm >
                <TextField source="id" />
                <TextInput source="name" helperText="Name your submission" validate={[required()]} />
                <TextInput source="comment" />
            </SimpleForm>
        </Create >
    )
};

export default CreateComponent;
