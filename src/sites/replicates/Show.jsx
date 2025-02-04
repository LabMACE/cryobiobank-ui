import {
    Show,
    SimpleShowLayout,
    TextField,
    DateField,
    NumberField,
    Labeled,
    ReferenceField,
    usePermissions,
    TopToolbar,
    EditButton,
    DeleteButton,
    Loading,
    useRecordContext,
    useCreatePath,
    ReferenceManyField,
    Datagrid,
} from 'react-admin';
import { Grid, Accordion, AccordionSummary, AccordionDetails, Typography } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

export const MyActionsByPermission = () => {
    const { permissions, isLoading } = usePermissions();
    const record = useRecordContext();
    const createPath = useCreatePath();
    
    // Save site_id to redirect when deleting
    const site_id = record ? record.site_id : null;
    
    if (isLoading) return <Loading />;
    
    return (
    <TopToolbar>
        {permissions && permissions == 'admin' ? (
        <>
            <EditButton />
            <DeleteButton 
            mutationMode='pessimistic' 
            redirect={createPath({ resource: 'sites', type: 'show', id: site_id })}
            />
        </>
        ) : null}
    </TopToolbar>
)};

const SiteReplicateShow = (props) => {

    return (
        <Show {...props} actions={<MyActionsByPermission />}>
            <SimpleShowLayout>
                <Grid container spacing={2}>
                    <Grid item xs={12} sm={8}>
                        <Grid container spacing={2}>
                            <Grid item xs={12} sm={6}>
                                <Labeled label="Site">
                                    <ReferenceField source="site_id" reference="sites" label="Site" />
                                </Labeled>
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <Labeled label="Name">
                                    <TextField source="name" />
                                </Labeled>
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <Labeled label="Sample Type">
                                    <TextField source="sample_type" />
                                </Labeled>
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <Labeled label="Sampling Date">
                                    <DateField source="sampling_date" />
                                </Labeled>
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <Labeled label="Sample Depth (cm)">
                                    <NumberField source="sample_depth_cm" />
                                </Labeled>
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <Labeled label="Snow Depth (cm)">
                                    <NumberField source="snow_depth_cm" />
                                </Labeled>
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <Labeled label="Air Temperature (°C)">
                                    <NumberField source="air_temperature_celsius" />
                                </Labeled>
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <Labeled label="Snow Temperature (°C)">
                                    <NumberField source="snow_temperature_celsius" />
                                </Labeled>
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <Labeled label="Photosynthetic Active Radiation">
                                    <NumberField source="photosynthetic_active_radiation" />
                                </Labeled>
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <Labeled label="Bacterial Abundance">
                                    <NumberField source="bacterial_abundance" />
                                </Labeled>
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <Labeled label="CFU Count R2A">
                                    <NumberField source="cfu_count_r2a" />
                                </Labeled>
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <Labeled label="CFU Count Another">
                                    <NumberField source="cfu_count_another" />
                                </Labeled>
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <Labeled label="pH">
                                    <NumberField source="ph" />
                                </Labeled>
                            </Grid>
                        </Grid>
                    </Grid>
                    <Grid item sm={4}>
                        <Labeled label="Isolates">
                            <ReferenceManyField reference="isolates" target="site_replicate_id" label="Isolates">
                                <Datagrid bulkActionButtons={false}>
                                    <TextField source="name"  />
                                    <TextField source="storage_location" />
                                </Datagrid>
                            </ReferenceManyField>
                        </Labeled>
                        <div style={{ marginBottom: '18px' }} />
                        <Labeled label="Samples">
                            <ReferenceManyField reference="samples" target="site_replicate_id" label="Samples">
                                <Datagrid bulkActionButtons={false} padding="normal"  >
                                    <TextField source="name"  />
                                    <TextField source="storage_location" />
                                </Datagrid>
                            </ReferenceManyField>
                        </Labeled>
                    </Grid>
                </Grid>

                {/* Ions Accordion */}
                <Accordion>
                    <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                        <Typography>Ions</Typography>
                    </AccordionSummary>
                    <AccordionDetails>
                        <Grid container spacing={2}>
                            <Grid item xs={12} sm={4}>
                                <Labeled label="Fluoride">
                                    <NumberField source="ions_fluoride" />
                                </Labeled>
                            </Grid>
                            <Grid item xs={12} sm={4}>
                                <Labeled label="Chloride">
                                    <NumberField source="ions_chloride" />
                                </Labeled>
                            </Grid>
                            <Grid item xs={12} sm={4}>
                                <Labeled label="Nitrite">
                                    <NumberField source="ions_nitrite" />
                                </Labeled>
                            </Grid>
                            <Grid item xs={12} sm={4}>
                                <Labeled label="Nitrate">
                                    <NumberField source="ions_nitrate" />
                                </Labeled>
                            </Grid>
                            <Grid item xs={12} sm={4}>
                                <Labeled label="Bromide">
                                    <NumberField source="ions_bromide" />
                                </Labeled>
                            </Grid>
                            <Grid item xs={12} sm={4}>
                                <Labeled label="Sulfate">
                                    <NumberField source="ions_sulfate" />
                                </Labeled>
                            </Grid>
                            <Grid item xs={12} sm={4}>
                                <Labeled label="Phosphate">
                                    <NumberField source="ions_phosphate" />
                                </Labeled>
                            </Grid>
                            <Grid item xs={12} sm={4}>
                                <Labeled label="Sodium">
                                    <NumberField source="ions_sodium" />
                                </Labeled>
                            </Grid>
                            <Grid item xs={12} sm={4}>
                                <Labeled label="Ammonium">
                                    <NumberField source="ions_ammonium" />
                                </Labeled>
                            </Grid>
                            <Grid item xs={12} sm={4}>
                                <Labeled label="Potassium">
                                    <NumberField source="ions_potassium" />
                                </Labeled>
                            </Grid>
                            <Grid item xs={12} sm={4}>
                                <Labeled label="Magnesium">
                                    <NumberField source="ions_magnesium" />
                                </Labeled>
                            </Grid>
                            <Grid item xs={12} sm={4}>
                                <Labeled label="Calcium">
                                    <NumberField source="ions_calcium" />
                                </Labeled>
                            </Grid>
                        </Grid>
                    </AccordionDetails>
                </Accordion>

                {/* Organic Acids Accordion */}
                <Accordion>
                    <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                        <Typography>Organic Acids</Typography>
                    </AccordionSummary>
                    <AccordionDetails>
                        <Grid container spacing={2}>
                            <Grid item xs={12} sm={4}>
                                <Labeled label="Formate">
                                    <NumberField source="organic_acids_formate" />
                                </Labeled>
                            </Grid>
                            <Grid item xs={12} sm={4}>
                                <Labeled label="Malate">
                                    <NumberField source="organic_acids_malate" />
                                </Labeled>
                            </Grid>
                            <Grid item xs={12} sm={4}>
                                <Labeled label="Propionate">
                                    <NumberField source="organic_acids_propionate" />
                                </Labeled>
                            </Grid>
                            <Grid item xs={12} sm={4}>
                                <Labeled label="Citrate">
                                    <NumberField source="organic_acids_citrate" />
                                </Labeled>
                            </Grid>
                            <Grid item xs={12} sm={4}>
                                <Labeled label="Lactate">
                                    <NumberField source="organic_acids_lactate" />
                                </Labeled>
                            </Grid>
                            <Grid item xs={12} sm={4}>
                                <Labeled label="Butyrate">
                                    <NumberField source="organic_acids_butyrate" />
                                </Labeled>
                            </Grid>
                            <Grid item xs={12} sm={4}>
                                <Labeled label="Oxalate">
                                    <NumberField source="organic_acids_oxalate" />
                                </Labeled>
                            </Grid>
                            <Grid item xs={12} sm={4}>
                                <Labeled label="Acetate">
                                    <NumberField source="organic_acids_acetate" />
                                </Labeled>
                            </Grid>
                        </Grid>
                    </AccordionDetails>
                </Accordion>
            </SimpleShowLayout>
        </Show>
    );
};

export default SiteReplicateShow;
