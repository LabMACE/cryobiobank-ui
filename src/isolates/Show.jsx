import {
    Show,
    SimpleShowLayout,
    TextField,
    BooleanField,
    DateField,
    Labeled,
    ReferenceField,
    NumberField,
} from 'react-admin';
import { Grid } from '@mui/material';


const ShowComponent = () => {
    return (
        <Show >
            <SimpleShowLayout>
                <ReferenceField source="site_replicate_id" reference="site_replicates" />
                <TextField source="name" />
                <TextField source="taxonomy" />
                <TextField source="storage_location" />
                <NumberField source="temperature_of_isolation" />
                <TextField source="media_used_for_isolation" />
            </SimpleShowLayout>
        </Show >
    )
};
export default ShowComponent;