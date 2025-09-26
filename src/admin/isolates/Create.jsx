import {
    Create,
    SimpleForm,
    TextInput,
    NumberInput,
    BooleanInput,
    ReferenceInput,
    SelectInput,
    AutocompleteInput,
    required,
    usePermissions,
} from 'react-admin';

const IsolateCreate = (props) => {
    const { permissions } = usePermissions();
    const isAdmin = permissions === 'admin';

    return (
        <Create {...props} redirect="show">
            <SimpleForm>
                <ReferenceInput
                    source="site_replicate_id"
                    reference="site_replicates"
                    label="Site Replicate"
                >
                    <AutocompleteInput 
                        optionText={choice => choice ? `${choice.name} - ${choice.sample_type} (${choice.sampling_date})` : ''} 
                        validate={[required()]} 
                        filterToQuery={searchText => ({ name: `${searchText}` })}
                        debounce={500}
                    />
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
                    <SelectInput optionText="name" resettable />
                </ReferenceInput>
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

export default IsolateCreate;
