import { useGetOne, useCreatePath, useUpdate, useNotify, useRefresh, Link, TopToolbar, EditButton, DeleteButton, usePermissions, useRecordContext, Loading } from 'react-admin';
import {
    Card,
    CardContent,
    Typography,
    Chip,
    Box,
    Breadcrumbs as MuiBreadcrumbs,
    Skeleton,
    Switch,
    Tooltip,
} from '@mui/material';
import LockIcon from '@mui/icons-material/Lock';
import PublicIcon from '@mui/icons-material/Public';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import AcUnitIcon from '@mui/icons-material/AcUnit';
import TerrainIcon from '@mui/icons-material/Terrain';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import PhotoCameraIcon from '@mui/icons-material/PhotoCamera';

export const SectionCard = ({ title, icon, children, sx }) => (
    <Card variant="outlined" sx={{ mb: 2, ...sx }}>
        {title && (
            <Box sx={{ px: 2, pt: 1.5, pb: 0, display: 'flex', alignItems: 'center', gap: 1 }}>
                {icon}
                <Typography variant="subtitle1" fontWeight={600}>{title}</Typography>
            </Box>
        )}
        <CardContent sx={{ pt: title ? 1 : undefined }}>{children}</CardContent>
    </Card>
);

export const FieldRow = ({ label, children, dimmed }) => (
    <Box sx={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'baseline',
        py: 0.75,
        px: 0.5,
        borderBottom: '1px solid',
        borderColor: 'divider',
        '&:last-child': { borderBottom: 'none' },
    }}>
        <Typography variant="body2" color="text.secondary" sx={{ minWidth: 120, flexShrink: 0 }}>
            {label}
        </Typography>
        <Typography
            variant="body2"
            sx={{ textAlign: 'right', color: dimmed ? 'text.disabled' : 'text.primary' }}
        >
            {children ?? <span style={{ color: '#ccc', fontSize: '0.85em' }}>&mdash;</span>}
        </Typography>
    </Box>
);

export const StatBox = ({ label, value, icon }) => (
    <Card variant="outlined" sx={{ textAlign: 'center', p: 1.5, flex: 1 }}>
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 0.5 }}>
            {icon}
            <Typography variant="h5" fontWeight={700}>
                {value ?? '\u2014'}
            </Typography>
        </Box>
        <Typography variant="caption" color="text.secondary">{label}</Typography>
    </Card>
);

export const PrivacyChip = ({ isPrivate }) => (
    <Chip
        icon={isPrivate ? <LockIcon fontSize="small" /> : <PublicIcon fontSize="small" />}
        label={isPrivate ? 'Private' : 'Public'}
        size="small"
        color={isPrivate ? 'warning' : 'success'}
        variant="outlined"
    />
);

export const PrivacyToggle = ({ resource, id, isPrivate }) => {
    const [update, { isLoading }] = useUpdate();
    const notify = useNotify();
    const refresh = useRefresh();

    const handleToggle = () => {
        const newValue = !isPrivate;
        update(
            resource,
            { id, data: { is_private: newValue }, previousData: { id, is_private: isPrivate } },
            {
                onSuccess: () => {
                    notify(newValue ? 'Set to private' : 'Set to public', { type: 'info' });
                    refresh();
                },
                onError: (error) => {
                    notify(`Error: ${error.message}`, { type: 'error' });
                },
            }
        );
    };

    return (
        <Tooltip title={isPrivate ? 'Private — hidden from public' : 'Public — visible to everyone'}>
            <Chip
                icon={isPrivate ? <LockIcon fontSize="small" /> : <PublicIcon fontSize="small" />}
                label={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.25 }}>
                        {isPrivate ? 'Private' : 'Public'}
                        <Switch
                            size="small"
                            checked={!isPrivate}
                            onChange={handleToggle}
                            disabled={isLoading}
                            sx={{ ml: 0.25 }}
                        />
                    </Box>
                }
                size="small"
                color={isPrivate ? 'warning' : 'success'}
                variant="outlined"
                sx={{ cursor: 'pointer', pr: 0 }}
            />
        </Tooltip>
    );
};

export const SampleTypeChip = ({ type }) => {
    if (!type) return null;
    const isCryo = type.toLowerCase().includes('cryo') || type.toLowerCase().includes('ice') || type.toLowerCase().includes('snow');
    return (
        <Chip
            icon={isCryo ? <AcUnitIcon fontSize="small" /> : <TerrainIcon fontSize="small" />}
            label={type}
            size="small"
            variant="outlined"
            color={isCryo ? 'info' : 'default'}
        />
    );
};

export const PhotoCard = ({ base64 }) => (
    <Card variant="outlined">
        <CardContent sx={{ textAlign: 'center', p: base64 ? 0 : 3 }}>
            {base64 ? (
                <img
                    src={base64}
                    alt="Isolate photo"
                    style={{
                        width: '100%',
                        maxHeight: 500,
                        objectFit: 'contain',
                        borderRadius: 4,
                        display: 'block',
                    }}
                />
            ) : (
                <Box sx={{ py: 4, color: 'text.disabled' }}>
                    <PhotoCameraIcon sx={{ fontSize: 64, mb: 1 }} />
                    <Typography>No photo available</Typography>
                </Box>
            )}
        </CardContent>
    </Card>
);

const BreadcrumbLink = ({ resource, id, children }) => {
    const createPath = useCreatePath();
    if (!id) return <Skeleton width={60} />;
    return (
        <Link
            to={createPath({ resource, type: 'show', id })}
            sx={{ textDecoration: 'none', color: 'primary.main', '&:hover': { textDecoration: 'underline' } }}
        >
            {children}
        </Link>
    );
};

export const Breadcrumbs = ({ items }) => (
    <MuiBreadcrumbs separator={<NavigateNextIcon fontSize="small" />}>
        {items.map((item, i) => {
            const isLast = i === items.length - 1;
            const content = isLast ? (
                <Typography color="text.primary" fontWeight={600}>
                    {item.label || <Skeleton width={60} />}
                </Typography>
            ) : (
                <BreadcrumbLink resource={item.resource} id={item.id}>
                    {item.label || <Skeleton width={60} />}
                </BreadcrumbLink>
            );
            return (
                <Box key={i} sx={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    {item.type && (
                        <Typography variant="caption" color="text.disabled" sx={{ fontSize: '0.65rem', lineHeight: 1, display: 'block' }}>
                            {item.type}
                        </Typography>
                    )}
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.25 }}>
                        {content}
                        {item.isPrivate && (
                            <Tooltip title={`${item.type || 'This item'} is private`}>
                                <LockIcon sx={{ fontSize: '0.85rem', color: 'warning.main' }} />
                            </Tooltip>
                        )}
                    </Box>
                </Box>
            );
        })}
    </MuiBreadcrumbs>
);

export const ShowTitle = ({ label }) => {
    const record = useRecordContext();
    if (!record) return null;
    return <span>{label}: {record.name}</span>;
};

const EffectivePrivacyBanner = ({ items }) => {
    if (!items || items.length < 2) return null;
    const privateAncestors = items.slice(0, -1).filter(item => item.isPrivate);
    if (privateAncestors.length === 0) return null;
    const names = privateAncestors.map(a => `${a.type} '${a.label || '...'}'`).join(', ');
    return (
        <Box sx={{
            display: 'flex', alignItems: 'center', gap: 0.75,
            px: 1.5, py: 0.5, mb: 1,
            borderRadius: 1,
            backgroundColor: 'warning.lighter',
            border: '1px solid',
            borderColor: 'warning.light',
        }}>
            <VisibilityOffIcon sx={{ fontSize: '1rem', color: 'warning.main' }} />
            <Typography variant="caption" color="warning.dark">
                Effectively hidden from public API &mdash; {names} {privateAncestors.length === 1 ? 'is' : 'are'} private
            </Typography>
        </Box>
    );
};

export const ShowActions = ({ breadcrumbItems, deleteProps, children }) => {
    const { permissions, isLoading } = usePermissions();
    if (isLoading) return <Loading />;
    return (
        <>
            <TopToolbar sx={{ alignItems: 'center', justifyContent: 'space-between' }}>
                <Breadcrumbs items={breadcrumbItems || []} />
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    {children}
                    {permissions === 'admin' && (
                        <>
                            <EditButton />
                            <DeleteButton {...deleteProps} />
                        </>
                    )}
                </Box>
            </TopToolbar>
            {permissions === 'admin' && <EffectivePrivacyBanner items={breadcrumbItems} />}
        </>
    );
};

export const useBreadcrumbChain = (record, { needsReplicate, needsSite, needsArea } = {}) => {
    const replicateId = record?.site_replicate_id;
    const { data: replicate } = useGetOne('site_replicates',
        { id: replicateId }, { enabled: needsReplicate && !!replicateId });

    const siteIdDirect = record?.site_id;
    const siteIdFromReplicate = replicate?.site_id;
    const siteId = siteIdDirect || siteIdFromReplicate;
    const { data: site } = useGetOne('sites',
        { id: siteId }, { enabled: needsSite && !!siteId });

    const areaIdFromSite = site?.area_id;
    const { data: area } = useGetOne('areas',
        { id: areaIdFromSite }, { enabled: needsArea && !!areaIdFromSite });

    return { replicate, site, area };
};
