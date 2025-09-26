import {
    Edit,
    SimpleForm,
    TextInput,
    BooleanInput,
    ReferenceInput,
    SelectInput,
    required,
    usePermissions,
} from 'react-admin';
import { MyActionsByPermission } from '../custom/Toolbars';
import { ColorInput } from 'react-admin-color-picker';


const SampleEdit = (props) => {
    const { permissions } = usePermissions();
    const isAdmin = permissions === 'admin';

    return (
        <Edit {...props} redirect="show" actions={<MyActionsByPermission />}>
            <SimpleForm>
                <TextInput source="name" label="Name" />
                <TextInput source="description" label="Description" />
                <ColorInput source="colour" />
                {isAdmin && (
                    <BooleanInput 
                        source="is_private" 
                        label="Private Record" 
                        helperText="Private records are only visible to authenticated administrators" 
                    />
                )}
            </SimpleForm>
        </Edit>
    );
};

export default SampleEdit;
