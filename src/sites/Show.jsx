import {
    Show,
    SimpleShowLayout,
    TextField,
    useCreatePath,
    DateField,
    Labeled,
    ArrayField,
    Datagrid,
    FunctionField,
} from 'react-admin';
import { Grid } from '@mui/material';
import { SitesMap } from '../maps/Sites';
import { MyActionsByPermission } from '../custom/Toolbars';


const ShowComponent = () => {
    const createPath = useCreatePath();
    const objectClick = (id, resource, record) => (
        createPath({ resource: 'site_replicates', type: 'show', id: record.id })
    );

    return (
        <Show actions={<MyActionsByPermission />}>
            <SimpleShowLayout>
                <Grid container spacing={2}>
                    <Grid item xs={6}>
                        <Grid container spacing={0}>
                            <Grid item xs={4}>
                                <Labeled label="Name">
                                    <TextField source="name" />
                                </Labeled>
                            </Grid>
                            <Grid item xs={4}>
                                <Labeled label="Latitude, Longitude (°)">
                                    <FunctionField render={record => (
                                        <a 
                                            href={`https://www.google.com/maps/search/?api=1&query=${record.latitude_4326},${record.longitude_4326}`} 
                                            target="_blank" 
                                            rel="noopener noreferrer"
                                        >
                                            {`${record.latitude_4326.toFixed(5)}, ${record.longitude_4326.toFixed(5)}`}
                                        </a>
                                    )} />
                                </Labeled>
                            </Grid>
                            <Grid item xs={4}>
                                <Labeled label="Elevation (m)">
                                    <TextField source="elevation_metres" />
                                </Labeled>
                            </Grid>
                        </Grid>
                        
                        <Grid item xs={12} style={{ marginTop: '16px' }}>
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
                        </Grid>
                    </Grid>
                    <Grid item xs={6}>
                        <SitesMap height="400px" labels={false} />
                    </Grid>
                </Grid>
            </SimpleShowLayout>
        </Show >
    )
};
export default ShowComponent;