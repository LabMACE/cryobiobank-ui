import {
    Show,
    SimpleShowLayout,
    TextField,
    FunctionField,
    ReferenceManyField,
    Datagrid,
    usePermissions,
} from 'react-admin';
import { MyActionsByPermission } from '../custom/Toolbars';

const ShowComponent = () => {
    const { permissions } = usePermissions();
    const isAdmin = permissions === 'admin';

    return (
        <Show actions={<MyActionsByPermission />}>
            <SimpleShowLayout>
                <TextField source="name" />
                <TextField source="extraction_method" />
                <TextField source="description" />
                {isAdmin && (
                    <FunctionField 
                        label="Privacy"
                        render={record => 
                            record?.is_private ? '🔒 Private' : '🌐 Public'
                        } 
                    />
                )}

                <ReferenceManyField reference="isolates" target="dna_id" label="Isolates">
                    <Datagrid>
                        <TextField source="id" />
                        <TextField source="name" />
                        <TextField source="storage_location" />
                    </Datagrid>
                </ReferenceManyField>
                <ReferenceManyField reference="samples" target="dna_id" label="Samples">
                    <Datagrid>
                        <TextField source="id" />
                        <TextField source="name" />
                        <TextField source="storage_location" />
                    </Datagrid>
                </ReferenceManyField>
            </SimpleShowLayout>
        </Show >
    )
};
export default ShowComponent;