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
} from 'react-admin';
import { Grid } from '@mui/material';


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
                                <Labeled label="ID">
                                    <TextField source="id" />
                                </Labeled>
                            </Grid>
                            <Grid item xs={12}>
                                <Labeled label="Name">
                                    <TextField source="name" />
                                </Labeled>
                            </Grid>
                        </Grid>
                    </Grid>
                </Grid>
                <ArrayField source="replicates">
                    <Datagrid bulkActionButtons={false}
                                                rowClick={objectClick}
>
                        <DateField source="sampling_date" />
                        <TextField source="id" />
                        <TextField source="sample_type" />
                        <TextField source="sample_depth_cm" />
                        <TextField source="snow_depth_cm" />
                    </Datagrid>
                </ArrayField>
            </SimpleShowLayout>
        </Show >
    )
};
export default ShowComponent;