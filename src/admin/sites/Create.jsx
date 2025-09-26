/* eslint react/jsx-key: off */
import {
    Create,
    SimpleForm,
    TextField,
    TextInput,
    BooleanInput,
    required,
    ReferenceInput,
    SelectInput,
    usePermissions,
} from 'react-admin';
import CoordinateInput from '../../maps/CoordinateEntry';

const CreateComponent = () => {
    const { permissions } = usePermissions();
    const isAdmin = permissions === 'admin';

    return (
        <Create redirect="show">
            <SimpleForm >
                <TextField source="id" />
                <ReferenceInput
                    source="area_id"
                    reference="areas"
                    label="Area"
                >
                    <SelectInput optionText="name" validate={[required()]} resettable/>
                </ReferenceInput>
                <TextInput source="name" validate={[required()]}/>
                <CoordinateInput />
                {isAdmin && (
                    <BooleanInput 
                        source="is_private" 
                        label="Private Record" 
                        helperText="Private records are only visible to authenticated administrators" 
                    />
                )}
            </SimpleForm>
        </Create >
    )
};

export default CreateComponent;
