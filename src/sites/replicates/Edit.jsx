import {
    Edit,
    SimpleForm,
    ReferenceInput,
    SelectInput,
    TextInput,
    DateInput,
    NumberInput,
    required
} from 'react-admin';
// import { MyToolbar } from '../../custom/Toolbars';
import { Grid, Accordion, AccordionSummary, AccordionDetails, Typography } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

const SiteReplicateEdit = (props) => {
    return (
        <Edit {...props} mutationMode="pessimistic" redirect="show">
            <SimpleForm >
                <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                        <TextInput source="id" disabled label="ID" />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                        <ReferenceInput
                            source="site_id"
                            reference="sites"
                            label="Site"
                        >
                            <SelectInput optionText="name" validate={[required()]}/>
                        </ReferenceInput>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                        <TextInput source="name" label="Name" validate={[required()]} />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                        <TextInput source="sample_type" label="Sample Type" validate={[required()]}/>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                        <DateInput source="sampling_date" label="Sampling Date" validate={[required()]}/>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                        <NumberInput source="sample_depth_cm" label="Sample Depth (cm)" />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                        <NumberInput source="snow_depth_cm" label="Snow Depth (cm)" />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                        <NumberInput source="air_temperature_celsius" label="Air Temperature (°C)" />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                        <NumberInput source="snow_temperature_celsius" label="Snow Temperature (°C)" />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                        <NumberInput
                            source="photosynthetic_active_radiation"
                            label="Photosynthetic Active Radiation"
                        />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                        <NumberInput source="bacterial_abundance" label="Bacterial Abundance" />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                        <NumberInput source="cfu_count_r2a" label="CFU Count R2A" />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                        <NumberInput source="cfu_count_another" label="CFU Count Another" />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                        <NumberInput source="ph" label="pH" />
                    </Grid>
                </Grid>

                {/* Ions Accordion */}
                <Accordion>
                    <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                        <Typography>Ions</Typography>
                    </AccordionSummary>
                    <AccordionDetails>
                        <Grid container spacing={2}>
                            <Grid item xs={12} sm={6}>
                                <NumberInput source="ions_fluoride" label="Fluoride" />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <NumberInput source="ions_chloride" label="Chloride" />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <NumberInput source="ions_nitrite" label="Nitrite" />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <NumberInput source="ions_nitrate" label="Nitrate" />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <NumberInput source="ions_bromide" label="Bromide" />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <NumberInput source="ions_sulfate" label="Sulfate" />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <NumberInput source="ions_phosphate" label="Phosphate" />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <NumberInput source="ions_sodium" label="Sodium" />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <NumberInput source="ions_ammonium" label="Ammonium" />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <NumberInput source="ions_potassium" label="Potassium" />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <NumberInput source="ions_magnesium" label="Magnesium" />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <NumberInput source="ions_calcium" label="Calcium" />
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
                            <Grid item xs={12} sm={6}>
                                <NumberInput source="organic_acids_formate" label="Formate" />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <NumberInput source="organic_acids_malate" label="Malate" />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <NumberInput source="organic_acids_propionate" label="Propionate" />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <NumberInput source="organic_acids_citrate" label="Citrate" />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <NumberInput source="organic_acids_lactate" label="Lactate" />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <NumberInput source="organic_acids_butyrate" label="Butyrate" />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <NumberInput source="organic_acids_oxalate" label="Oxalate" />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <NumberInput source="organic_acids_acetate" label="Acetate" />
                            </Grid>
                        </Grid>
                    </AccordionDetails>
                </Accordion>
            </SimpleForm>
        </Edit>
    );
};

export default SiteReplicateEdit;
