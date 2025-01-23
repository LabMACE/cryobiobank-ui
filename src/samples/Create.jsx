import {
    Create,
    SimpleForm,
    TextInput,
    ReferenceInput,
    SelectInput,
} from 'react-admin';

const SampleCreate = (props) => {
    return (
        <Create {...props} redirect="show">
            <SimpleForm>
                <ReferenceInput
                    source="site_replicate_id"
                    reference="site_replicates"
                    label="Site Replicate"
                >
                    <SelectInput optionText="name" />
                </ReferenceInput>
                <ReferenceInput
                    source="dna_id"
                    reference="dna"
                    label="DNA"
                >
                    <SelectInput optionText="name" />
                </ReferenceInput>
                <TextInput source="name" label="Name" />
                <TextInput source="type_of_sample" label="Type of Sample" />
                <TextInput source="description" label="Description" />
                <TextInput source="storage_location" label="Storage Location" />
            </SimpleForm>
        </Create>
    );
};

export default SampleCreate;
