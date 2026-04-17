import {
    Show,
    useRecordContext,
    usePermissions,
} from 'react-admin';
import { Box, Typography, Grid } from '@mui/material';
import BiotechIcon from '@mui/icons-material/Biotech';
import {
    SectionCard,
    FieldRow,
    PrivacyToggle,
    PhotoCard,
    ShowActions,
    ShowTitle,
    useBreadcrumbChain,
} from '../custom/ShowComponents';

const ShowContent = () => {
    const record = useRecordContext();
    const { permissions } = usePermissions();
    const isAdmin = permissions === 'admin';
    const { replicate, site, area } = useBreadcrumbChain(record, {
        needsReplicate: true,
        needsSite: true,
        needsArea: true,
    });

    if (!record) return null;

    return (
        <Box sx={{ p: 2, pt: 0 }}>
            <ShowActions breadcrumbItems={[
                { resource: 'areas', id: area?.id, label: area?.name, type: 'Area', isPrivate: area?.is_private },
                { resource: 'sites', id: site?.id, label: site?.name, type: 'Site', isPrivate: site?.is_private },
                { resource: 'site_replicates', id: replicate?.id, label: replicate?.name, type: 'Replicate', isPrivate: replicate?.is_private },
                { label: record.name, type: 'Isolate', isPrivate: record.is_private },
            ]} />

            {/* Header */}
            <SectionCard>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1, flexWrap: 'wrap' }}>
                    <Typography variant="h5" fontWeight={600}>{record.name}</Typography>
                    {isAdmin && <PrivacyToggle resource="isolates" id={record.id} isPrivate={record.is_private} />}
                </Box>
                {record.taxonomy && (
                    <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic', mb: 1 }}>
                        {record.taxonomy}
                    </Typography>
                )}
                {record.description && (
                    <Typography variant="body2" sx={{ mb: 1 }}>
                        {record.description}
                    </Typography>
                )}
                {record.genome_url && (
                    <Typography variant="body2">
                        <a href={record.genome_url} target="_blank" rel="noopener noreferrer">
                            Genome URL
                        </a>
                    </Typography>
                )}
            </SectionCard>

            {(() => {
                const details = [
                    ['Temperature', record.temperature_of_isolation != null ? `${record.temperature_of_isolation} °C` : null],
                    ['Media', record.media_used_for_isolation],
                    ['Storage Location', record.storage_location],
                ].filter(([, v]) => v != null && v !== '');
                const hasDetails = details.length > 0;
                const hasPhoto = !!record.photo;
                if (!hasDetails && !hasPhoto) return null;
                return (
                    <Grid container spacing={2}>
                        {hasDetails && (
                            <Grid item xs={12} md={hasPhoto ? 6 : 12}>
                                <SectionCard title="Isolation Details" icon={<BiotechIcon fontSize="small" color="action" />}>
                                    {details.map(([label, value]) => (
                                        <FieldRow label={label} key={label}>{value}</FieldRow>
                                    ))}
                                </SectionCard>
                            </Grid>
                        )}
                        {hasPhoto && (
                            <Grid item xs={12} md={hasDetails ? 6 : 12}>
                                <PhotoCard base64={record.photo} />
                            </Grid>
                        )}
                    </Grid>
                );
            })()}
        </Box>
    );
};

const ShowComponent = () => (
    <Show actions={false} component="div" title={<ShowTitle label="Isolate" />}>
        <ShowContent />
    </Show>
);

export default ShowComponent;
