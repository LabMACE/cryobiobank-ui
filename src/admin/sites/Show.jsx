import {
    Show,
    DateField,
    TextField,
    ArrayField,
    Datagrid,
    FunctionField,
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
import proj4 from 'proj4';
import { SitesMap } from '../../maps/Sites';

proj4.defs("EPSG:2056", "+proj=somerc +lat_0=46.9524055555556 +lon_0=7.43958333333333 +k_0=1 +x_0=2600000 +y_0=1200000 +ellps=bessel +towgs84=674.374,15.056,405.346,0,0,0,0 +units=m +no_defs +type=crs");
import {
    SectionCard,
    PrivacyToggle,
    ShowActions,
    ShowTitle,
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

    const [swissE, swissN] = record.longitude_4326 && record.latitude_4326
        ? proj4('EPSG:4326', 'EPSG:2056', [record.longitude_4326, record.latitude_4326]).map(Math.round)
        : [null, null];

    return (
        <Box sx={{ p: 2, pt: 0 }}>
            <ShowActions breadcrumbItems={[
                { resource: 'areas', id: areaData?.id, label: areaData?.name, type: 'Area', isPrivate: areaData?.is_private },
                { label: record.name, type: 'Site', isPrivate: record.is_private },
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
                    {isAdmin && <PrivacyToggle resource="sites" id={record.id} isPrivate={record.is_private} />}
                </Box>
                <Typography variant="body2" color="text.secondary">
                    <a
                        href={swissE ? `https://map.geo.admin.ch/?lang=en&center=${swissE},${swissN}&z=13&crosshair=marker&bgLayer=ch.swisstopo.pixelkarte-farbe` : '#'}
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
                                <TextField source="name" />
                                <DateField source="sampling_date" label="Date" />
                                <TextField source="sample_type" label="Type" />
                                <FunctionField label="Isolates" render={rec => rec?.isolates?.length ?? 0} />
                                <FunctionField label="Samples" render={rec => rec?.samples?.length ?? 0} />
                                <FunctionField label="DNA" render={rec => rec?.dna?.length ?? 0} />
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
    <Show actions={false} component="div" title={<ShowTitle label="Site" />}>
        <ShowContent />
    </Show>
);

export default ShowComponent;
