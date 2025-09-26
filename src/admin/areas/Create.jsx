import {
    Create,
    SimpleForm,
    TextInput,
    BooleanInput,
    usePermissions,
} from 'react-admin';
import { ColorInput } from 'react-admin-color-picker';

const SampleCreate = (props) => {
    const { permissions } = usePermissions();
    const isAdmin = permissions === 'admin';

    return (
        <Create {...props} redirect="show">
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
        </Create>
    );
};

export default SampleCreate;
