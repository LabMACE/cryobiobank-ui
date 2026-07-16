import {
    Create,
    SimpleForm,
    TextInput,
    required,
} from 'react-admin';
import { ColorInput } from 'react-admin-color-picker';

const SampleCreate = (props) => (
    <Create {...props} redirect="show">
        <SimpleForm>
            <TextInput source="name" label="Name" />
            <TextInput source="description" label="Description" />
            <ColorInput source="colour" validate={[required()]} />
        </SimpleForm>
    </Create>
);

export default SampleCreate;
