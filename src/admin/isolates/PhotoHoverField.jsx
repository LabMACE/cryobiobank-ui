import { useState } from 'react';
import { useRecordContext, useGetOne } from 'react-admin';
import CameraAltIcon from '@mui/icons-material/CameraAlt';
import CameraAltOutlinedIcon from '@mui/icons-material/CameraAltOutlined';
import CircularProgress from '@mui/material/CircularProgress';
import Box from '@mui/material/Box';

/**
 * Shows a camera icon when the isolate has a photo (`has_photo === true`).
 * On hover, `useGetOne` fetches `/api/isolates/:id` (auth-aware via
 * react-admin dataProvider + React Query cache). Renders a floating preview.
 */
export default function PhotoHoverField() {
    const record = useRecordContext();
    const [hover, setHover] = useState(false);

    const { data, isLoading } = useGetOne(
        'isolates',
        { id: record?.id },
        { enabled: Boolean(hover && record?.id) },
    );

    if (!record || !record.has_photo) {
        return <CameraAltOutlinedIcon fontSize="small" sx={{ color: 'action.disabled' }} titleAccess="No photo" />;
    }

    const photo = data?.photo;

    return (
        <Box
            component="span"
            sx={{ position: 'relative', display: 'inline-flex', alignItems: 'center' }}
            onMouseEnter={() => setHover(true)}
            onMouseLeave={() => setHover(false)}
        >
            <CameraAltIcon fontSize="small" sx={{ color: 'primary.main', cursor: 'pointer' }} titleAccess="Photo available" />

            {hover && (
                <Box
                    sx={{
                        position: 'fixed',
                        zIndex: 2000,
                        pointerEvents: 'none',
                        transform: 'translate(24px, -50%)',
                    }}
                >
                    {isLoading && !photo ? (
                        <Box
                            sx={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                width: 32,
                                height: 32,
                                background: '#fff',
                                border: '1px solid rgba(0,0,0,0.15)',
                                borderRadius: '50%',
                                boxShadow: '0 4px 12px rgba(0,0,0,0.18)',
                            }}
                        >
                            <CircularProgress size={16} thickness={5} />
                        </Box>
                    ) : photo ? (
                        <Box
                            sx={{
                                background: '#fff',
                                border: '1px solid rgba(0,0,0,0.15)',
                                borderRadius: 1,
                                padding: 0.5,
                                boxShadow: '0 8px 24px rgba(0,0,0,0.25)',
                                lineHeight: 0,
                            }}
                        >
                            <img
                                src={photo}
                                alt={record.name}
                                style={{ maxWidth: 240, maxHeight: 240, display: 'block', borderRadius: 3 }}
                            />
                        </Box>
                    ) : null}
                </Box>
            )}
        </Box>
    );
}
