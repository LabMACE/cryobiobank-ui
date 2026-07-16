import {
    Edit,
    SimpleForm,
    TextInput,
    NumberInput,
    ReferenceInput,
    AutocompleteInput,
    required,
} from 'react-admin';

import { MyActionsByPermission } from '../custom/Toolbars';

const DNAEdit = (props) => {
    return (
        <Edit {...props} redirect="show" actions={<MyActionsByPermission />} mutationMode="pessimistic">
            <SimpleForm>
                <TextInput source="id" disabled label="ID" />
                <ReferenceInput source="field_record_id" reference="field_records" label="Field Record">
                    <AutocompleteInput
                        optionText={choice => choice ? `${choice.name} (${choice.sampling_date})` : ''}
                        validate={[required()]}
                        filterToQuery={searchText => ({ name: `${searchText}` })}
                        debounce={500}
                    />
                </ReferenceInput>
                <TextInput source="name" label="Name" />
                <TextInput source="extraction_method" label="Extraction Method" />
                <NumberInput source="volume" label="Volume" />
                <NumberInput source="concentration" label="Concentration" />
                <TextInput source="description" label="Description" />
            </SimpleForm>
        </Edit>
    );
};

export default DNAEdit;
