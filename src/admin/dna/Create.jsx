import {
    Create,
    SimpleForm,
    TextInput,
    required,
} from 'react-admin';

const DNACreate = (props) => {
    return (
        <Create {...props} redirect="show">
            <SimpleForm>
                <TextInput source="name" label="Name" validate={[required()]} />
                <TextInput source="extraction_method" label="Extraction Method" />
                <TextInput source="description" label="Description" />
            </SimpleForm>
        </Create>
    );
};

export default DNACreate;
