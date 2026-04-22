import {
    Create,
    SimpleForm,
    TextInput,
    NumberInput,
    ReferenceInput,
    AutocompleteInput,
    required,
} from 'react-admin';

const IsolateCreate = (props) => (
    <Create {...props} redirect="show">
        <SimpleForm>
            <ReferenceInput
                source="site_replicate_id"
                reference="site_replicates"
                label="Site Replicate"
            >
                <AutocompleteInput
                    optionText={choice => choice ? `${choice.name} (${choice.sampling_date})` : ''}
                    validate={[required()]}
                    filterToQuery={searchText => ({ name: `${searchText}` })}
                    debounce={500}
                />
            </ReferenceInput>
            <TextInput source="name" label="Name" validate={[required()]} />
            <TextInput source="taxonomy" label="Taxonomy" />
            <TextInput source="description" label="Description" multiline />
            <TextInput source="storage_location" label="Storage Location" />
            <NumberInput
                source="temperature_of_isolation"
                label="Temperature of Isolation (°C)"
            />
            <TextInput source="media_used_for_isolation" label="Media Used for Isolation" />
            <TextInput source="genome_url" label="Genome URL" />
        </SimpleForm>
    </Create>
);

export default IsolateCreate;
