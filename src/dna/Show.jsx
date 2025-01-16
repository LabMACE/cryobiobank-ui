import {
    Show,
    SimpleShowLayout,
    TextField,
    BooleanField,
    DateField,
    Labeled,
    ReferenceManyField,
    Datagrid,
} from 'react-admin';
import { Grid } from '@mui/material';


const ShowComponent = () => {
    return (
        <Show >
            <SimpleShowLayout>
                <TextField source="name" />
                <TextField source="extraction_method" />

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