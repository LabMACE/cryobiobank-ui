import {
    Edit,
    SimpleForm,
    TextInput,
    NumberInput,
    ReferenceInput,
    AutocompleteInput,
    required,
    useRecordContext,
    ImageInput,
    ImageField,
} from 'react-admin';
import { MyActionsByPermission } from '../custom/Toolbars';

const ImageFieldPreview = ({ source }) => {
    const record = useRecordContext();
    if (!record || !record[source]) {
        return null;
    }
    const base64Image = record[source];
    return (
        <div style={{ textAlign: 'left', margin: '0 10px' }}>
            <img src={`${base64Image}`} style={{ maxWidth: '30%', height: 'auto' }} />
        </div>
    );

};

const IsolateEdit = (props) => {
    return (
        <Edit {...props} redirect="show" actions={<MyActionsByPermission />} mutationMode="pessimistic">
            <SimpleForm>
                <TextInput source="id" disabled label="ID" />
                <ImageFieldPreview source="photo" />
                <ImageInput
                    source="photo"
                    label="Photo"
                    accept="image/*"
                    multiple={false}
                >
                    <ImageField source="src" title="title" />
                </ImageInput>
                <ReferenceInput
                    source="field_record_id"
                    reference="field_records"
                    label="Field Record"
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
        </Edit>
    );
};

export default IsolateEdit;
