import {
    Edit,
    SimpleForm,
    TextInput,
    required,
} from 'react-admin';
import { MyActionsByPermission } from '../custom/Toolbars';
import { ColorInput } from 'react-admin-color-picker';


const SampleEdit = (props) => {
    return (
        <Edit {...props} redirect="show" actions={<MyActionsByPermission />}>
            <SimpleForm>
                <TextInput source="name" label="Name" />
                <TextInput source="description" label="Description" />
                <ColorInput source="colour" defaultValue="#1565c0" validate={[required()]} />
            </SimpleForm>
        </Edit>
    );
};

export default SampleEdit;
