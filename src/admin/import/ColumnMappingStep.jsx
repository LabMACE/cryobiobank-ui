import {
    Box,
    Typography,
    Table,
    TableHead,
    TableBody,
    TableRow,
    TableCell,
    TextField,
    MenuItem,
    Chip,
    Alert,
} from '@mui/material';

const SKIP = '';

// Lets the user map each uploaded CSV column to a target field. Targets are
// pre-suggested by autoMatchColumns; the user can correct any of them.
export function ColumnMappingStep({
    headers,
    mapping,
    onChange,
    config,
    missingRequired,
    duplicateTargets,
}) {
    const columnByKey = new Map(config.columns.map((c) => [c.key, c]));
    const mappedTargets = Object.values(mapping).filter(Boolean);

    return (
        <Box>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Match each column from your file to a {config.label.toLowerCase()}{' '}
                field. Columns you don't need can stay as "Skip". Fields marked *
                are required.
            </Typography>

            {missingRequired.length > 0 && (
                <Alert severity="error" sx={{ mb: 2 }}>
                    Map a column to every required field before continuing:{' '}
                    {missingRequired
                        .map((k) => columnByKey.get(k)?.label || k)
                        .join(', ')}
                    .
                </Alert>
            )}
            {duplicateTargets.length > 0 && (
                <Alert severity="warning" sx={{ mb: 2 }}>
                    Two columns are mapped to the same field:{' '}
                    {duplicateTargets
                        .map((k) => columnByKey.get(k)?.label || k)
                        .join(', ')}
                    . Each field can only be used once.
                </Alert>
            )}

            <Table size="small">
                <TableHead>
                    <TableRow>
                        <TableCell sx={{ fontWeight: 'bold' }}>
                            Your column
                        </TableCell>
                        <TableCell sx={{ fontWeight: 'bold' }}>
                            Maps to
                        </TableCell>
                        <TableCell sx={{ fontWeight: 'bold' }}>Notes</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {headers.map((header) => {
                        const target = mapping[header] || SKIP;
                        const col = target ? columnByKey.get(target) : null;
                        const isDup =
                            target &&
                            mappedTargets.filter((t) => t === target).length >
                                1;
                        return (
                            <TableRow key={header}>
                                <TableCell>{header}</TableCell>
                                <TableCell>
                                    <TextField
                                        select
                                        size="small"
                                        value={target}
                                        onChange={(e) =>
                                            onChange(
                                                header,
                                                e.target.value || null
                                            )
                                        }
                                        sx={{ minWidth: 220 }}
                                        error={isDup}
                                    >
                                        <MenuItem value={SKIP}>
                                            <em>— Skip this column —</em>
                                        </MenuItem>
                                        {config.columns.map((c) => (
                                            <MenuItem key={c.key} value={c.key}>
                                                {c.label}
                                                {c.required ? ' *' : ''}
                                            </MenuItem>
                                        ))}
                                    </TextField>
                                </TableCell>
                                <TableCell>
                                    {!target && (
                                        <Chip
                                            label="skipped"
                                            size="small"
                                            variant="outlined"
                                        />
                                    )}
                                    {col?.fkResource && (
                                        <Typography
                                            variant="caption"
                                            color="text.secondary"
                                        >
                                            matched by name to an existing{' '}
                                            {singular(col.fkResource)}
                                        </Typography>
                                    )}
                                    {col?.type === 'enum' && (
                                        <Typography
                                            variant="caption"
                                            color="text.secondary"
                                        >
                                            allowed: {col.enumValues.join(', ')}
                                        </Typography>
                                    )}
                                </TableCell>
                            </TableRow>
                        );
                    })}
                </TableBody>
            </Table>
        </Box>
    );
}

function singular(resource) {
    return resource.replace(/s$/, '').replace('_', ' ');
}
