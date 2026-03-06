import {
    Create,
    SimpleForm,
    TextInput,
    ReferenceInput,
    AutocompleteInput,
    required,
} from 'react-admin';

const DNACreate = (props) => {
    return (
        <Create {...props} redirect="show">
            <SimpleForm>
                <ReferenceInput source="site_replicate_id" reference="site_replicates" label="Site Replicate">
                    <AutocompleteInput
                        optionText={choice => choice ? `${choice.name} (${choice.sampling_date})` : ''}
                        validate={[required()]}
                        filterToQuery={searchText => ({ name: `${searchText}` })}
                        debounce={500}
                    />
                </ReferenceInput>
                <TextInput source="name" label="Name" validate={[required()]} />
                <TextInput source="extraction_method" label="Extraction Method" />
                <TextInput source="description" label="Description" />
            </SimpleForm>
        </Create>
    );
};

export default DNACreate;
