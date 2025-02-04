import {
    Show,
    SimpleShowLayout,
    TextField,
    ReferenceManyField,
    Datagrid,
} from 'react-admin';
import { MyActionsByPermission } from '../custom/Toolbars';

const ShowComponent = () => {
    return (
        <Show actions={<MyActionsByPermission />}>
            <SimpleShowLayout>
                <TextField source="name" />
                <TextField source="extraction_method" />
                <TextField source="description" />

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