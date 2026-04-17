import {
    Show,
    useRecordContext,
    usePermissions,
} from 'react-admin';
import { Box, Chip, Typography } from '@mui/material';
import {
    SectionCard,
    PrivacyToggle,
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
                { label: record.name, type: 'DNA', isPrivate: record.is_private },
            ]} />

            {/* Header */}
            <SectionCard>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1, flexWrap: 'wrap' }}>
                    <Typography variant="h5" fontWeight={600}>{record.name}</Typography>
                    {record.extraction_method && (
                        <Chip label={record.extraction_method} size="small" color="primary" variant="outlined" />
                    )}
                    {isAdmin && <PrivacyToggle resource="dna" id={record.id} isPrivate={record.is_private} />}
                </Box>
                {record.description && (
                    <Typography variant="body2" color="text.secondary">
                        {record.description}
                    </Typography>
                )}
            </SectionCard>
        </Box>
    );
};

const ShowComponent = () => (
    <Show actions={false} component="div" title={<ShowTitle label="DNA extraction" />}>
        <ShowContent />
    </Show>
);

export default ShowComponent;
