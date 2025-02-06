import {
    Create,
    SimpleForm,
    TextInput,
} from 'react-admin';
import { ColorInput } from 'react-admin-color-picker';

const SampleCreate = (props) => {
    return (
        <Create {...props} redirect="show">
            <SimpleForm>
                <TextInput source="name" label="Name" />
                <TextInput source="description" label="Description" />
                <ColorInput source="colour" />
            </SimpleForm>
        </Create>
    );
};

export default SampleCreate;
