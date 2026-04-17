import {
    Show,
    useRecordContext,
    usePermissions,
} from 'react-admin';
import { Box, Typography } from '@mui/material';
import {
    SectionCard,
    FieldRow,
    PrivacyToggle,
    AvailabilityChip,
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
                { label: record.name, type: 'Sample', isPrivate: record.is_private },
            ]} />

            {/* Header */}
            <SectionCard>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1, flexWrap: 'wrap' }}>
                    <Typography variant="h5" fontWeight={600}>{record.name}</Typography>
                    <AvailabilityChip isAvailable={record.is_available} />
                    {isAdmin && <PrivacyToggle resource="samples" id={record.id} isPrivate={record.is_private} />}
                </Box>
                {record.storage_location && (
                    <FieldRow label="Storage Location">{record.storage_location}</FieldRow>
                )}
                {record.description && (
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                        {record.description}
                    </Typography>
                )}
            </SectionCard>
        </Box>
    );
};

const ShowComponent = () => (
    <Show actions={false} component="div" title={<ShowTitle label="Sample" />}>
        <ShowContent />
    </Show>
);

export default ShowComponent;
