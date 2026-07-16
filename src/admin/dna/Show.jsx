import {
    Show,
    useRecordContext,
    usePermissions,
} from 'react-admin';
import { Box, Chip, Typography } from '@mui/material';
import ScienceIcon from '@mui/icons-material/Science';
import ArticleIcon from '@mui/icons-material/Article';
import {
    SectionCard,
    FieldRow,
    PrivacyToggle,
    ShowActions,
    ShowTitle,
    useBreadcrumbChain,
} from '../custom/ShowComponents';

const ShowContent = () => {
    const record = useRecordContext();
    const { permissions } = usePermissions();
    const isAdmin = permissions === 'admin';
    const { fieldRecord, site, area } = useBreadcrumbChain(record, {
        needsFieldRecord: true,
        needsSite: true,
        needsArea: true,
    });

    if (!record) return null;

    return (
        <Box sx={{ p: 2, pt: 0 }}>
            <ShowActions breadcrumbItems={[
                { resource: 'areas', id: area?.id, label: area?.name, type: 'Area', isPrivate: area?.is_private },
                { resource: 'sites', id: site?.id, label: site?.name, type: 'Site', isPrivate: site?.is_private },
                { resource: 'field_records', id: fieldRecord?.id, label: fieldRecord?.name, type: 'Field Record', isPrivate: fieldRecord?.is_private },
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

            {(record.volume != null || record.concentration != null) && (
                <SectionCard title="Properties" icon={<ScienceIcon fontSize="small" color="action" />}>
                    {record.volume != null && <FieldRow label="Volume">{record.volume}</FieldRow>}
                    {record.concentration != null && (
                        <FieldRow label="Concentration">{record.concentration}</FieldRow>
                    )}
                </SectionCard>
            )}

            {/* Inherited from the parent field record: edited there, shown here read-only. */}
            {fieldRecord && (
                <SectionCard title="Field record" icon={<ArticleIcon fontSize="small" color="action" />}>
                    <FieldRow label="Name">{fieldRecord.name}</FieldRow>
                    <FieldRow label="Sampling date">
                        {fieldRecord.sampling_date
                            ? new Date(fieldRecord.sampling_date).toLocaleDateString()
                            : null}
                    </FieldRow>
                    <FieldRow label="Metagenome">
                        {fieldRecord.metagenome_url ? (
                            <a href={fieldRecord.metagenome_url} target="_blank" rel="noopener noreferrer">
                                {fieldRecord.metagenome_url}
                            </a>
                        ) : null}
                    </FieldRow>
                </SectionCard>
            )}
        </Box>
    );
};

const ShowComponent = () => (
    <Show actions={false} component="div" title={<ShowTitle label="DNA extraction" />}>
        <ShowContent />
    </Show>
);

export default ShowComponent;
