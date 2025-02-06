import {
    Show,
    SimpleShowLayout,
    TextField,
    Labeled,
    ReferenceManyField,
    Datagrid,
    useRecordContext,
    ReferenceManyCount,
} from 'react-admin';
import { Grid } from '@mui/material';
import { MyActionsByPermission } from '../custom/Toolbars';

export const ColorBox = () => {
    const record = useRecordContext();
    if (!record) return null;

    return (
        <div style={{ display: 'flex', alignItems: 'center' }}>
            <div
                style={{
                    width: '20px', // Size of the box
                    height: '20px', // Size of the box
                    backgroundColor: record.colour, // Use the record color
                    border: '1px solid #ccc', // Optional border for visibility
                    marginRight: '10px', // Space between box and text
                }}
            />
            <TextField source="colour" />
        </div>
    );
};

const ShowComponent = () => {
    return (
        <Show actions={<MyActionsByPermission />}>
            <SimpleShowLayout>
                <Grid container spacing={2}>
                    <Grid item xs={6}>
                        <Grid container spacing={0}>
                            <Grid item xs={12}>
                                <Labeled label="Name">
                                    <TextField source="name" />
                                </Labeled>
                            </Grid>
                            <Grid item xs={12}>
                                <Labeled label="Description">
                                    <TextField source="description" />
                                </Labeled>
                            </Grid>
                            <Grid item xs={12}>
                                <Labeled label="Colour">
                                    <ColorBox />
                                </Labeled>
                            </Grid>
                        </Grid>
                    </Grid>
                </Grid>
                <ReferenceManyField reference="sites" target="area_id" label="Sites">
                    <Datagrid>
                        <TextField source="name" />
                        <TextField source="elevation_metres" label="Elevation (m)" />
                        <ReferenceManyCount reference="site_replicates" target="site_id" label="Replicates" />
                    </Datagrid>
                </ReferenceManyField>
            </SimpleShowLayout>
        </Show >
    )
};
export default ShowComponent;