import {
    SimpleForm,
    TextInput,
} from 'react-admin';
import Edit from '../custom/Edit';
const SubmissionEdit = () => {
    return (
        <Edit redirect="show">
            <SimpleForm>
                <TextInput source="id" disabled />
                <TextInput source="name" />
                <TextInput source="comment" />
            </SimpleForm>
        </Edit>
    )
};

export default SubmissionEdit;
