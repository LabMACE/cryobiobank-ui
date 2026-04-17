import {
    Show,
    TextField,
    BooleanField,
    usePermissions,
    useRecordContext,
    useCreatePath,
    ReferenceManyField,
    ReferenceManyCount,
    Datagrid,
    TabbedShowLayout,
    useGetOne,
    useRedirect,
    Button,
} from 'react-admin';
import { Box, Typography, Grid } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import ThermostatIcon from '@mui/icons-material/Thermostat';
import ScienceIcon from '@mui/icons-material/Science';
import BiotechIcon from '@mui/icons-material/Biotech';
import WaterDropIcon from '@mui/icons-material/WaterDrop';
import {
    SectionCard,
    FieldRow,
    PrivacyToggle,
    SampleTypeChip,
    ShowActions,
    ShowTitle,
} from '../../custom/ShowComponents';

const TabLabelWithCount = ({ label, reference, target }) => (
    <span>
        {label} (<ReferenceManyCount reference={reference} target={target} />)
    </span>
);

const AddChildButton = ({ resource, label }) => {
    const record = useRecordContext();
    const redirect = useRedirect();
    if (!record) return null;
    return (
        <Button
            onClick={() => redirect('create', resource, null, {}, { record: { site_replicate_id: record.id } })}
            label={label}
            startIcon={<AddIcon />}
        />
    );
};

const ShowContent = () => {
    const record = useRecordContext();
    const { permissions } = usePermissions();
    const isAdmin = permissions === 'admin';

    const { data: site } = useGetOne('sites',
        { id: record?.site_id }, { enabled: !!record?.site_id });
    const { data: area } = useGetOne('areas',
        { id: site?.area_id }, { enabled: !!site?.area_id });

    const createPath = useCreatePath();
    const deleteRedirect = record?.site_id
        ? createPath({ resource: 'sites', type: 'show', id: record.site_id })
        : undefined;

    if (!record) return null;

    return (
        <Box sx={{ p: 2, pt: 0 }}>
            <ShowActions
                breadcrumbItems={[
                    { resource: 'areas', id: area?.id, label: area?.name, type: 'Area', isPrivate: area?.is_private },
                    { resource: 'sites', id: site?.id, label: site?.name, type: 'Site', isPrivate: site?.is_private },
                    { label: record.name, type: 'Replicate', isPrivate: record.is_private },
                ]}
                deleteProps={{ mutationMode: 'pessimistic', redirect: deleteRedirect }}
            />

            {/* Header */}
            <SectionCard>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1, flexWrap: 'wrap' }}>
                    <Typography variant="h5" fontWeight={600}>{record.name}</Typography>
                    <SampleTypeChip type={record.sample_type} />
                    {isAdmin && <PrivacyToggle resource="site_replicates" id={record.id} isPrivate={record.is_private} />}
                </Box>
                {record.sampling_date && (
                    <Typography variant="body2" color="text.secondary">
                        Sampled: {new Date(record.sampling_date).toLocaleDateString()}
                    </Typography>
                )}
                {record.metagenome_url && (
                    <Typography variant="body2" color="text.secondary">
                        Metagenome: <a href={record.metagenome_url} target="_blank" rel="noopener noreferrer">
                            {record.metagenome_url}
                        </a>
                    </Typography>
                )}
            </SectionCard>

            {(() => {
                const groups = [
                    [
                        ['Sample Depth (cm)', record.sample_depth_cm],
                        ['Snow Depth (cm)', record.snow_depth_cm],
                    ],
                    [
                        ['Air Temperature (°C)', record.air_temperature_celsius],
                        ['Snow Temperature (°C)', record.snow_temperature_celsius],
                        ['pH', record.ph],
                    ],
                    [
                        ['Bacterial Abundance', record.bacterial_abundance],
                        ['CFU Count R2A', record.cfu_count_r2a],
                        ['CFU Count Another', record.cfu_count_another],
                        ['PAR', record.photosynthetic_active_radiation],
                    ],
                ];
                const hasAny = groups.some(g => g.some(([, v]) => v != null));

                return hasAny && (
                    <SectionCard title="Physical Conditions" icon={<ThermostatIcon fontSize="small" color="action" />}>
                        <Grid container spacing={2}>
                            {groups.map((group, i) => {
                                const visible = group.filter(([, v]) => v != null);
                                if (visible.length === 0) return null;
                                return (
                                    <Grid item xs={12} sm={6} md={4} key={i}>
                                        {visible.map(([label, value]) => (
                                            <FieldRow label={label} key={label}>{value}</FieldRow>
                                        ))}
                                    </Grid>
                                );
                            })}
                        </Grid>
                    </SectionCard>
                );
            })()}

            {(() => {
                const ions = [
                    ['Fluoride', record.ions_fluoride],
                    ['Chloride', record.ions_chloride],
                    ['Nitrite', record.ions_nitrite],
                    ['Nitrate', record.ions_nitrate],
                    ['Bromide', record.ions_bromide],
                    ['Sulfate', record.ions_sulfate],
                    ['Phosphate', record.ions_phosphate],
                    ['Sodium', record.ions_sodium],
                    ['Ammonium', record.ions_ammonium],
                    ['Potassium', record.ions_potassium],
                    ['Magnesium', record.ions_magnesium],
                    ['Calcium', record.ions_calcium],
                ].filter(([, value]) => value != null);

                return ions.length > 0 && (
                    <SectionCard title="Ions" icon={<WaterDropIcon fontSize="small" color="action" />}>
                        <Grid container spacing={0} columnGap={2}>
                            {ions.map(([label, value]) => (
                                <Grid item xs={12} sm={5} key={label}>
                                    <FieldRow label={label}>{value}</FieldRow>
                                </Grid>
                            ))}
                        </Grid>
                    </SectionCard>
                );
            })()}

            {(() => {
                const acids = [
                    ['Formate', record.organic_acids_formate],
                    ['Malate', record.organic_acids_malate],
                    ['Propionate', record.organic_acids_propionate],
                    ['Citrate', record.organic_acids_citrate],
                    ['Lactate', record.organic_acids_lactate],
                    ['Butyrate', record.organic_acids_butyrate],
                    ['Oxalate', record.organic_acids_oxalate],
                    ['Acetate', record.organic_acids_acetate],
                ].filter(([, value]) => value != null);

                return acids.length > 0 && (
                    <SectionCard title="Organic Acids" icon={<ScienceIcon fontSize="small" color="action" />}>
                        <Grid container spacing={0} columnGap={2}>
                            {acids.map(([label, value]) => (
                                <Grid item xs={12} sm={5} key={label}>
                                    <FieldRow label={label}>{value}</FieldRow>
                                </Grid>
                            ))}
                        </Grid>
                    </SectionCard>
                );
            })()}

            <TabbedShowLayout syncWithLocation={false}>
                <TabbedShowLayout.Tab
                    label={<TabLabelWithCount label="Isolates" reference="isolates" target="site_replicate_id" />}
                    icon={<BiotechIcon />}
                >
                    {isAdmin && <Box sx={{ mb: 1 }}><AddChildButton resource="isolates" label="Add Isolate" /></Box>}
                    <ReferenceManyField reference="isolates" target="site_replicate_id" label={false}>
                        <Datagrid bulkActionButtons={false} rowClick="show">
                            <TextField source="name" />
                            <TextField source="taxonomy" emptyText="—" />
                            <TextField source="storage_location" emptyText="—" />
                        </Datagrid>
                    </ReferenceManyField>
                </TabbedShowLayout.Tab>

                <TabbedShowLayout.Tab
                    label={<TabLabelWithCount label="Samples" reference="samples" target="site_replicate_id" />}
                    icon={<ScienceIcon />}
                >
                    {isAdmin && <Box sx={{ mb: 1 }}><AddChildButton resource="samples" label="Add Sample" /></Box>}
                    <ReferenceManyField reference="samples" target="site_replicate_id" label={false}>
                        <Datagrid bulkActionButtons={false} rowClick="show">
                            <TextField source="name" />
                            <BooleanField source="is_available" label="Available" />
                            <TextField source="storage_location" emptyText="—" />
                        </Datagrid>
                    </ReferenceManyField>
                </TabbedShowLayout.Tab>

                <TabbedShowLayout.Tab
                    label={<TabLabelWithCount label="DNA" reference="dna" target="site_replicate_id" />}
                    icon={<ScienceIcon />}
                >
                    {isAdmin && <Box sx={{ mb: 1 }}><AddChildButton resource="dna" label="Add DNA" /></Box>}
                    <ReferenceManyField reference="dna" target="site_replicate_id" label={false}>
                        <Datagrid bulkActionButtons={false} rowClick="show">
                            <TextField source="name" />
                            <TextField source="extraction_method" emptyText="—" />
                        </Datagrid>
                    </ReferenceManyField>
                </TabbedShowLayout.Tab>
            </TabbedShowLayout>
        </Box>
    );
};

const SiteReplicateShow = () => (
    <Show actions={false} component="div" title={<ShowTitle label="Site replicate" />}>
        <ShowContent />
    </Show>
);

export default SiteReplicateShow;
