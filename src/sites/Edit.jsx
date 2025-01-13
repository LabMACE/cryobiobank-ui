import {
    SimpleForm,
    TextInput,
} from 'react-admin';
import CustomEdit from '../custom/Edit';

const EditComponent = () => {
    return (
        <CustomEdit redirect="show">
            <SimpleForm>
                <TextInput source="id" disabled />
                <TextInput source="name" />
                <TextInput source="comment" />
            </SimpleForm>
        </CustomEdit>
    )
};

export default EditComponent;
