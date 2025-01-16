import {
    Show,
    SimpleShowLayout,
    TextField,
    BooleanField,
    DateField,
    Labeled,
    ReferenceField,
} from 'react-admin';
import { Grid } from '@mui/material';


const ShowComponent = () => {
    return (
        <Show >
            <SimpleShowLayout>
                <Grid container spacing={2}>
                    <Grid item xs={6}>
                        <Grid container spacing={0}>
                            <Grid item xs={12}>
                                <Labeled label="ID">
                                    <TextField source="id" />
                                </Labeled>
                            </Grid>
                            <Grid item xs={12}>
                                <Labeled label="Name">
                                    <TextField source="name" />
                                </Labeled>
                            </Grid>
                            <Grid item xs={12}>
                                <Labeled label="Site Replicate">
                                    <ReferenceField source="site_replicate_id" reference="site_replicates" />
                                </Labeled>
                            </Grid>
                            <Grid item xs={12}>
                                <Labeled label="DNA">
                                    <ReferenceField source="dna_id" reference="dna" />
                                </Labeled>
                            </Grid>
                            <Grid item xs={12}>
                                <Labeled label="Type of sample">
                                    <TextField source="type_of_sample" />
                                </Labeled>
                            </Grid>

                            <Grid item xs={12}>
                                <Labeled label="Description">
                                    <TextField source="description" />
                                </Labeled>
                            </Grid>
                            <Grid item xs={12}>
                                <Labeled label="Storage location">
                                    <TextField source="storage_location" />
                                </Labeled>
                            </Grid>

                        </Grid>
                    </Grid>
                </Grid>
            </SimpleShowLayout>
        </Show >
    )
};
export default ShowComponent;