import {
    Show,
    TextField,
    ReferenceManyField,
    ReferenceManyCount,
    Datagrid,
    useRecordContext,
    usePermissions,
} from 'react-admin';
import { Box, Typography, Grid } from '@mui/material';
import MapIcon from '@mui/icons-material/Map';
import PlaceIcon from '@mui/icons-material/Place';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import { SitesMap } from '../../maps/Sites';
import {
    SectionCard,
    StatBox,
    PrivacyToggle,
    ShowActions,
    ShowTitle,
} from '../custom/ShowComponents';

export const ColorBox = () => {
    const record = useRecordContext();
    if (!record) return null;
    return (
        <div style={{ display: 'flex', alignItems: 'center' }}>
            <div
                style={{
                    width: '20px',
                    height: '20px',
                    backgroundColor: record.colour,
                    border: '1px solid #ccc',
                    marginRight: '10px',
                }}
            />
            <TextField source="colour" />
        </div>
    );
};

const ShowContent = () => {
    const record = useRecordContext();
    const { permissions } = usePermissions();
    const isAdmin = permissions === 'admin';

    if (!record) return null;

    return (
        <Box sx={{ p: 2, pt: 0 }}>
            <ShowActions breadcrumbItems={[
                { label: record.name, type: 'Area' },
            ]} />

            {/* Header card with colour accent */}
            <SectionCard
                sx={{
                    borderLeft: `4px solid ${record.colour || '#ccc'}`,
                }}
            >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                    <Typography variant="h5" fontWeight={600}>{record.name}</Typography>
                    <Box
                        sx={{
                            width: 16,
                            height: 16,
                            borderRadius: '50%',
                            backgroundColor: record.colour,
                            border: '1px solid rgba(0,0,0,0.2)',
                            flexShrink: 0,
                        }}
                    />
                    {isAdmin && <PrivacyToggle resource="areas" id={record.id} isPrivate={record.is_private} />}
                </Box>
                {record.description && (
                    <Typography variant="body2" color="text.secondary">{record.description}</Typography>
                )}
            </SectionCard>

            {/* Stats row */}
            <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
                <StatBox
                    label="Sites"
                    icon={<PlaceIcon fontSize="small" color="action" />}
                    value={<ReferenceManyCount reference="sites" target="area_id" />}
                />
                <StatBox
                    label="Total Replicates"
                    icon={<ContentCopyIcon fontSize="small" color="action" />}
                    value={<ReferenceManyCount reference="site_replicates" target="area_id" />}
                />
            </Box>

            {/* Two column: sites table + map */}
            <Grid container spacing={2}>
                <Grid item xs={12} md={8}>
                    <SectionCard title="Sites" icon={<PlaceIcon fontSize="small" color="action" />}>
                        <ReferenceManyField reference="sites" target="area_id" label={false}>
                            <Datagrid bulkActionButtons={false} rowClick="show">
                                <TextField source="name" />
                                <TextField source="elevation_metres" label="Elevation (m)" />
                                <ReferenceManyCount reference="site_replicates" target="site_id" label="Replicates" />
                            </Datagrid>
                        </ReferenceManyField>
                    </SectionCard>
                </Grid>
                <Grid item xs={12} md={4}>
                    <SectionCard title="Map" icon={<MapIcon fontSize="small" color="action" />}>
                        <SitesMap height="350px" labels={false} />
                    </SectionCard>
                </Grid>
            </Grid>
        </Box>
    );
};

const ShowComponent = () => (
    <Show actions={false} component="div" title={<ShowTitle label="Area" />}>
        <ShowContent />
    </Show>
);

export default ShowComponent;
