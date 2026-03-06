import {
    Show,
    DateField,
    TextField,
    ArrayField,
    Datagrid,
    ReferenceField,
    useRecordContext,
    usePermissions,
    useCreatePath,
    useRedirect,
    useGetOne,
    Button,
} from 'react-admin';
import { Box, Typography, Grid, Chip } from '@mui/material';
import PlaceIcon from '@mui/icons-material/Place';
import MapIcon from '@mui/icons-material/Map';
import AddIcon from '@mui/icons-material/Add';
import HeightIcon from '@mui/icons-material/Height';
import { SitesMap } from '../../maps/Sites';
import {
    SectionCard,
    PrivacyToggle,
    ShowActions,
} from '../custom/ShowComponents';

const AddSiteReplicateButton = () => {
    const record = useRecordContext();
    const redirect = useRedirect();
    if (!record) return null;
    const handleClick = () => {
        redirect('create', 'site_replicates', null, {}, { record: { site_id: record.id } });
    };
    return (
        <Button onClick={handleClick} label="Add Site Replicate" startIcon={<AddIcon />} />
    );
};

const ShowContent = () => {
    const record = useRecordContext();
    const { permissions } = usePermissions();
    const isAdmin = permissions === 'admin';
    const createPath = useCreatePath();
    const { data: areaData } = useGetOne('areas',
        { id: record?.area_id }, { enabled: !!record?.area_id });

    const objectClick = (id, resource, rec) =>
        createPath({ resource: 'site_replicates', type: 'show', id: rec.id });

    if (!record) return null;

    return (
        <Box sx={{ p: 2, pt: 0 }}>
            <ShowActions breadcrumbItems={[
                { resource: 'areas', id: areaData?.id, label: areaData?.name, type: 'Area' },
                { label: record.name, type: 'Site' },
            ]}>
                <AddSiteReplicateButton />
            </ShowActions>

            {/* Header */}
            <SectionCard>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1, flexWrap: 'wrap' }}>
                    <Typography variant="h5" fontWeight={600}>{record.name}</Typography>
                    <Chip
                        icon={<HeightIcon fontSize="small" />}
                        label={`${record.elevation_metres} m`}
                        size="small"
                        variant="outlined"
                    />
                    <ReferenceField source="area_id" reference="areas" link="show" />
                    {isAdmin && <PrivacyToggle resource="sites" id={record.id} isPrivate={record.is_private} />}
                </Box>
                <Typography variant="body2" color="text.secondary">
                    <a
                        href={`https://map.geo.admin.ch/?lang=en&center=${record.longitude_4326},${record.latitude_4326}&z=17&bgLayer=ch.swisstopo.pixelkarte-farbe`}
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        {record.latitude_4326?.toFixed(5)}, {record.longitude_4326?.toFixed(5)}
                    </a>
                </Typography>
            </SectionCard>

            {/* Two column: replicates + map */}
            <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                    <SectionCard title="Site Replicates" icon={<PlaceIcon fontSize="small" color="action" />}>
                        <ArrayField source="replicates">
                            <Datagrid bulkActionButtons={false} rowClick={objectClick}>
                                <DateField source="sampling_date" label="Date" />
                                <TextField source="sample_depth_cm" label="Sample depth (cm)" />
                                <TextField source="snow_depth_cm" label="Snow depth (cm)" />
                                <TextField source="air_temperature_celsius" label="Air temp (°C)" />
                            </Datagrid>
                        </ArrayField>
                    </SectionCard>
                </Grid>
                <Grid item xs={12} md={6}>
                    <SectionCard title="Map" icon={<MapIcon fontSize="small" color="action" />}>
                        <SitesMap height="400px" labels={false} />
                    </SectionCard>
                </Grid>
            </Grid>
        </Box>
    );
};

const ShowComponent = () => (
    <Show actions={false} component="div">
        <ShowContent />
    </Show>
);

export default ShowComponent;
