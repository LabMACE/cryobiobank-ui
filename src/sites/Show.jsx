import {
    Show,
    SimpleShowLayout,
    TextField,
    BooleanField,
    useCreatePath,
    DateField,
    Labeled,
    ArrayField,
    Datagrid,
    useRecordContext,
    Loading,
} from 'react-admin';
import { Grid } from '@mui/material';
import { SitesMap } from '../maps/Sites';


const ShowComponent = () => {
    const createPath = useCreatePath();
    const objectClick = (id, resource, record) => (
        createPath({ resource: 'site_replicates', type: 'show', id: record.id })
    );

    return (
        <Show >
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
                                <Labeled label="Elevation (m)">
                                    <TextField source="elevation_metres" />
                                </Labeled>
                            </Grid>
                        </Grid>
                    </Grid>
                    <Grid item xs={6}>
                        <SitesMap height="200px" labels={false} />
                        </Grid>
                </Grid>
                <ArrayField source="replicates">
                    <Datagrid 
                        bulkActionButtons={false}
                        rowClick={objectClick}
                    >
                        <DateField source="sampling_date" label="Date" />
                        <TextField source="sample_type" label="Type" />
                        <TextField source="sample_depth_cm" label="Sample depth (cm)"/>
                        <TextField source="snow_depth_cm" label="Snow depth (cm)"/>
                    </Datagrid>
                </ArrayField>
            </SimpleShowLayout>
        </Show >
    )
};
export default ShowComponent;