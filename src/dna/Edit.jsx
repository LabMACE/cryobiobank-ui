import {
    Edit,
    SimpleForm,
    TextInput,
} from 'react-admin';

import { MyActionsByPermission } from '../custom/Toolbars';

const DNAEdit = (props) => {
    return (
        <Edit {...props} redirect="show" actions={<MyActionsByPermission />} mutationMode="pessimistic">
            <SimpleForm>
                <TextInput source="id" disabled label="ID" />
                <TextInput source="name" label="Name" />
                <TextInput source="extraction_method" label="Extraction Method" />
                <TextInput source="description" label="Description" />
            </SimpleForm>
        </Edit>
    );
};

export default DNAEdit;
