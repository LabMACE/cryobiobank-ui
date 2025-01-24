import {
    Show,
    SimpleShowLayout,
    TextField,
    ReferenceField,
    NumberField,
    useRecordContext,
    Loading,
    Labeled,
} from 'react-admin';
import { MyActionsByPermission } from '../custom/Toolbars';
import { Typography, Grid } from '@mui/material';

const ImageField = ({ source }) => {
    const record = useRecordContext();
    if (!record) {
        return <Loading />;
    }

    if (!record[source]) {
        return <>
            <br />
            <Typography align="center">No image available</Typography>
        </>;
    }
    const base64Image = record[source];
    return (
        <div style={{ textAlign: 'center', margin: '0 10px' }}>
            <img src={`${base64Image}`} style={{ maxWidth: '80%', height: 'auto' }} />
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
                            <Grid item xs={6}>
                                <Labeled label="Site Replicate ID">
                                    <ReferenceField source="site_replicate_id" reference="site_replicates" />
                                </Labeled>
                            </Grid>
                            <Grid item xs={6}>
                                <Labeled label="Name">
                                    <TextField source="name" />
                                </Labeled>
                            </Grid>
                            <Grid item xs={6}>
                                <Labeled label="Taxonomy">
                                    <TextField source="taxonomy" />
                                </Labeled>
                            </Grid>
                            <Grid item xs={6}>
                                <Labeled label="Storage Location">
                                    <TextField source="storage_location" />
                                </Labeled>
                            </Grid>
                            <Grid item xs={6}>
                                <Labeled label="Temperature of Isolation">
                                    <NumberField source="temperature_of_isolation" />
                                </Labeled>
                            </Grid>
                            <Grid item xs={6}>
                                <Labeled label="Media Used for Isolation">
                                    <TextField source="media_used_for_isolation" />
                                </Labeled>
                            </Grid>
                        </Grid>
                    </Grid>
                    <Grid item xs={6}>
                        <ImageField source="photo" />
                    </Grid>
                </Grid>
            </SimpleShowLayout>
        </Show>
    );
};

export default ShowComponent;