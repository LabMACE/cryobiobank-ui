import {
    Show,
    ReferenceField,
    useRecordContext,
    usePermissions,
    useCreatePath,
    Link,
} from 'react-admin';
import { Box, Typography, Grid } from '@mui/material';
import BiotechIcon from '@mui/icons-material/Biotech';
import {
    SectionCard,
    FieldRow,
    PrivacyToggle,
    SampleTypeChip,
    PhotoCard,
    ShowActions,
    ShowTitle,
    useBreadcrumbChain,
} from '../custom/ShowComponents';

const LineageField = ({ label, resource, id, name }) => {
    const createPath = useCreatePath();
    return (
        <FieldRow label={label}>
            {id ? (
                <Link to={createPath({ resource, type: 'show', id })}>{name}</Link>
            ) : null}
        </FieldRow>
    );
};

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
                { resource: 'areas', id: area?.id, label: area?.name, type: 'Area' },
                { resource: 'sites', id: site?.id, label: site?.name, type: 'Site' },
                { resource: 'site_replicates', id: replicate?.id, label: replicate?.name, type: 'Replicate' },
                { label: record.name, type: 'Isolate' },
            ]} />

            {/* Header with lineage */}
            <SectionCard>
                <Grid container spacing={2}>
                    <Grid item xs={12} md={6}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1, flexWrap: 'wrap' }}>
                            <Typography variant="h5" fontWeight={600}>{record.name}</Typography>
                            <SampleTypeChip type={record.sample_type} />
                            {isAdmin && <PrivacyToggle resource="isolates" id={record.id} isPrivate={record.is_private} />}
                        </Box>
                        {record.taxonomy && (
                            <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic', mb: 1 }}>
                                {record.taxonomy}
                            </Typography>
                        )}
                        {record.genome_url && (
                            <Typography variant="body2">
                                <a href={record.genome_url} target="_blank" rel="noopener noreferrer">
                                    Genome URL
                                </a>
                            </Typography>
                        )}
                    </Grid>

                    <Grid item xs={12} md={6}>
                        <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>Lineage</Typography>
                        <FieldRow label="Site Replicate">
                            <ReferenceField source="site_replicate_id" reference="site_replicates" link="show" />
                        </FieldRow>
                        <LineageField label="Site" resource="sites" id={site?.id} name={site?.name} />
                        <LineageField label="Area" resource="areas" id={area?.id} name={area?.name} />
                    </Grid>
                </Grid>
            </SectionCard>

            <Grid container spacing={2}>
                {/* Left: Isolation Details */}
                <Grid item xs={12} md={6}>
                    <SectionCard title="Isolation Details" icon={<BiotechIcon fontSize="small" color="action" />}>
                        <FieldRow label="Temperature">
                            {record.temperature_of_isolation != null ? `${record.temperature_of_isolation} °C` : null}
                        </FieldRow>
                        <FieldRow label="Media">{record.media_used_for_isolation}</FieldRow>
                        <FieldRow label="Storage Location">{record.storage_location}</FieldRow>
                    </SectionCard>
                </Grid>

                {/* Right: Photo */}
                <Grid item xs={12} md={6}>
                    <PhotoCard base64={record.photo} />
                </Grid>
            </Grid>
        </Box>
    );
};

const ShowComponent = () => (
    <Show actions={false} component="div" title={<ShowTitle label="Isolate" />}>
        <ShowContent />
    </Show>
);

export default ShowComponent;
