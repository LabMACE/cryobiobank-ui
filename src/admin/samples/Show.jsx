import {
    Show,
    SimpleShowLayout,
    TextField,
    Labeled,
    ReferenceField,
} from 'react-admin';
import { Grid } from '@mui/material';
import { MyActionsByPermission } from '../custom/Toolbars';


const ShowComponent = () => {
    return (
        <Show actions={<MyActionsByPermission />}>
            <SimpleShowLayout>
                <Grid container spacing={2}>
                    <Grid item xs={6}>
                        <Grid container spacing={0}>
                            <Grid item xs={6}>
                            <Labeled label="Site Replicate">
                                    <ReferenceField source="site_replicate_id" reference="site_replicates" />
                                </Labeled>
                            </Grid>
                            <Grid item xs={6}>
                                <Labeled label="DNA ID">
                                    <ReferenceField source="dna_id" reference="dna" emptyText="N/A"/>
                                </Labeled>
                            </Grid>
                            <Grid item xs={12}>
                                <hr />
                            </Grid>
                            <Grid item xs={12}>
                                <Labeled label="Name">
                                    <TextField source="name" />
                                </Labeled>
                            </Grid>
                            <Grid item xs={12}>
                                <Labeled label="Type of sample">
                                    <TextField source="type_of_sample" />
                                </Labeled>
                            </Grid>
                            <Grid item xs={12}>
                                <Labeled label="Storage location">
                                    <TextField source="storage_location" />
                                </Labeled>
                            </Grid>
                            <Grid item xs={12}>
                                <Labeled label="Description">
                                    <TextField source="description" />
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