import {
    SimpleForm,
    TextInput,
    BooleanInput,
    Toolbar,
    SaveButton,
    ReferenceInput,
    SelectInput,
    required,
    usePermissions,
} from 'react-admin';
import CustomEdit from '../custom/Edit';
import CoordinateInput from '../../maps/CoordinateEntry';

const MyToolbar = () => (
    <Toolbar>
        <SaveButton alwaysEnable />
    </Toolbar>
);

const EditComponent = () => {
    const { permissions } = usePermissions();
    const isAdmin = permissions === 'admin';

    return (
        <CustomEdit redirect="show">
            <SimpleForm toolbar={<MyToolbar />}>
                <TextInput source="id" disabled />
                <ReferenceInput
                    source="area_id"
                    reference="areas"
                    label="Area"
                >
                    <SelectInput optionText="name" validate={[required()]} resettable/>
                </ReferenceInput>
                <TextInput source="name" />
                <CoordinateInput />
                {isAdmin && (
                    <BooleanInput 
                        source="is_private" 
                        label="Private Record" 
                        helperText="Private records are only visible to authenticated administrators" 
                    />
                )}
            </SimpleForm>
        </CustomEdit>
    )
};

export default EditComponent;
