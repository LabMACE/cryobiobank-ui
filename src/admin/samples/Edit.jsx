import {
    Edit,
    SimpleForm,
    TextInput,
    BooleanInput,
    ReferenceInput,
    SelectInput,
    required,
} from 'react-admin';
import { MyActionsByPermission } from '../custom/Toolbars';

const SampleEdit = (props) => {
    return (
        <Edit {...props} redirect="show" actions={<MyActionsByPermission />} mutationMode="pessimistic">
            <SimpleForm>
                <TextInput source="id" disabled label="ID" />
                <ReferenceInput
                    source="field_record_id"
                    reference="field_records"
                    label="Field Record"
                >
                    <SelectInput optionText="name" validate={[required()]} resettable/>
                </ReferenceInput>
                <TextInput source="name" label="Name" validate={[required()]} />
                <BooleanInput source="is_available" label="Available (in stock)" />
                <TextInput source="description" label="Description" multiline />
                <TextInput source="storage_location" label="Storage Location" />
            </SimpleForm>
        </Edit>
    );
};

export default SampleEdit;
