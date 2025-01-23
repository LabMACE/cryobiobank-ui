import {
    Edit,
    SimpleForm,
    TextInput,
    NumberInput,
    ReferenceInput,
    SelectInput,
    required,
} from 'react-admin';
import { MyActionsByPermission } from '../custom/Toolbars';

const IsolateEdit = (props) => {
    return (
        <Edit {...props} redirect="show" actions={<MyActionsByPermission />} mutationMode="pessimistic">
            <SimpleForm>
                <TextInput source="id" disabled label="ID" />
                <ReferenceInput
                    source="site_replicate_id"
                    reference="site_replicates"
                    label="Site Replicate"
                >
                    <SelectInput optionText="name" validate={[required()]} resettable/>
                </ReferenceInput>
                <TextInput source="name" label="Name" validate={[required()]} />
                <TextInput source="taxonomy" label="Taxonomy" />
                <TextInput source="storage_location" label="Storage Location" />
                <NumberInput
                    source="temperature_of_isolation"
                    label="Temperature of Isolation (°C)"
                />
                <TextInput source="media_used_for_isolation" label="Media Used for Isolation" />
                <ReferenceInput source="dna_id" reference="dna" label="DNA">
                    <SelectInput optionText="name" resettable/>
                </ReferenceInput>
            </SimpleForm>
        </Edit>
    );
};

export default IsolateEdit;
