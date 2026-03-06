import {
    Show,
    ReferenceField,
    useRecordContext,
    usePermissions,
    useCreatePath,
    Link,
} from 'react-admin';
import { Box, Typography, Grid } from '@mui/material';
import {
    SectionCard,
    FieldRow,
    PrivacyToggle,
    SampleTypeChip,
    ShowActions,
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
                { label: record.name, type: 'Sample' },
            ]} />

            {/* Header with lineage */}
            <SectionCard>
                <Grid container spacing={2}>
                    <Grid item xs={12} md={6}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1, flexWrap: 'wrap' }}>
                            <Typography variant="h5" fontWeight={600}>{record.name}</Typography>
                            <SampleTypeChip type={record.sample_type} />
                            {isAdmin && <PrivacyToggle resource="samples" id={record.id} isPrivate={record.is_private} />}
                        </Box>
                        <FieldRow label="Storage Location">{record.storage_location}</FieldRow>
                        {record.description && (
                            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                                {record.description}
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
        </Box>
    );
};

const ShowComponent = () => (
    <Show actions={false} component="div">
        <ShowContent />
    </Show>
);

export default ShowComponent;
