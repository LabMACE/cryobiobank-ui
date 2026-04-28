import {
    Create,
    SimpleForm,
    TextInput,
    BooleanInput,
    ReferenceInput,
    SelectInput,
    required,
} from 'react-admin';

const SampleCreate = (props) => {
    return (
        <Create {...props} redirect="show">
            <SimpleForm defaultValues={{ is_available: true }}>
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
        </Create>
    );
};

export default SampleCreate;
