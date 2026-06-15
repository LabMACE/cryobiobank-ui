import { useState, useMemo } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    Stepper,
    Step,
    StepLabel,
    Typography,
    Table,
    TableHead,
    TableBody,
    TableRow,
    TableCell,
    Tooltip,
    LinearProgress,
    Box,
    Alert,
    AlertTitle,
    Accordion,
    AccordionSummary,
    AccordionDetails,
    Chip,
} from '@mui/material';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronDown } from '@fortawesome/free-solid-svg-icons';
import Papa from 'papaparse';
import { useRedirect, useRefresh } from 'react-admin';
import {
    IMPORT_CONFIGS,
    generateTemplate,
    validateRow,
    checkDuplicateNames,
    transformRow,
    autoMatchColumns,
    applyMapping,
    isMappingComplete,
    countReferenceNames,
} from './csvImportConfig';
import { useResolveNames } from './useResolveNames';
import { useBatchSubmit } from './useBatchSubmit';
import { ColumnMappingStep } from './ColumnMappingStep';

const UPLOAD_STEP = 0;
const MAPPING_STEP = 1;
const PREVIEW_STEP = 2;
const IMPORT_STEP = 3;

export function CsvImportWizard({ open, onClose, resource }) {
    const config = IMPORT_CONFIGS[resource];
    const [step, setStep] = useState(UPLOAD_STEP);
    const [needsMapping, setNeedsMapping] = useState(false);
    const [rawRows, setRawRows] = useState([]);
    const [headers, setHeaders] = useState([]);
    const [mapping, setMapping] = useState({});
    // Editable canonical rows shown in the preview. Materialised from the raw
    // rows + mapping when entering preview, then edited in place so users can
    // fix flagged cells without re-uploading.
    const [rows, setRows] = useState([]);
    const [uploadError, setUploadError] = useState(null);
    const redirect = useRedirect();
    const refresh = useRefresh();

    // Resolve names as soon as the dialog opens: the upload step shows the valid
    // parent names, and by the preview step the lookups are already loaded.
    const {
        lookups,
        existingNames,
        referenceTrees,
        loading: lookupsLoading,
        error: lookupsError,
    } = useResolveNames(config || { columns: [] }, open && !!config);

    // The mapping step is only shown when the uploaded headers don't already
    // resolve cleanly (the templated case skips straight to preview).
    const steps = needsMapping
        ? ['Upload CSV', 'Map Columns', 'Preview & Validate', 'Import']
        : ['Upload CSV', 'Preview & Validate', 'Import'];
    const activeStep = needsMapping ? step : step === UPLOAD_STEP ? 0 : step - 1;
    const { submit, submitting, progress, result } = useBatchSubmit(resource);

    function goToPreview() {
        setRows(rawRows.map((row) => applyMapping(row, mapping)));
        setStep(PREVIEW_STEP);
    }

    function handleEditCell(rowIndex, key, value) {
        setRows((prev) =>
            prev.map((row, i) =>
                i === rowIndex ? { ...row, [key]: value } : row
            )
        );
    }

    const requiredKeys = useMemo(
        () => (config ? config.columns.filter((c) => c.required).map((c) => c.key) : []),
        [config]
    );
    const mappedTargets = Object.values(mapping).filter(Boolean);
    const missingRequired = requiredKeys.filter((k) => !mappedTargets.includes(k));
    const duplicateTargets = [
        ...new Set(
            mappedTargets.filter((t, i) => mappedTargets.indexOf(t) !== i)
        ),
    ];
    const canProceedMapping =
        missingRequired.length === 0 && duplicateTargets.length === 0;

    const { rowErrors, duplicateRows } = useMemo(() => {
        if (step < PREVIEW_STEP || lookupsLoading || rows.length === 0) {
            return { rowErrors: [], duplicateRows: new Set() };
        }
        return {
            rowErrors: rows.map((row) =>
                validateRow(row, config, lookups, existingNames)
            ),
            duplicateRows: checkDuplicateNames(rows),
        };
    }, [step, rows, config, lookups, existingNames, lookupsLoading]);

    const totalErrors = rowErrors.reduce(
        (sum, errs, i) =>
            sum + Object.keys(errs).length + (duplicateRows.has(i) ? 1 : 0),
        0
    );
    const allValid = totalErrors === 0 && rows.length > 0 && !lookupsLoading;

    function handleDownloadTemplate() {
        const csv = generateTemplate(config);
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = config.templateFilename;
        a.click();
        URL.revokeObjectURL(url);
    }

    function handleFileUpload(e) {
        const file = e.target.files?.[0];
        if (!file) return;

        setUploadError(null);

        Papa.parse(file, {
            header: true,
            skipEmptyLines: true,
            complete(results) {
                if (results.errors.length > 0) {
                    setUploadError(
                        results.errors.map((err) => err.message).join('; ')
                    );
                    return;
                }

                const fileHeaders = results.meta.fields || [];
                if (results.data.length === 0) {
                    setUploadError(
                        'The file has a header row but no data rows to import.'
                    );
                    return;
                }

                const autoMapping = autoMatchColumns(fileHeaders, config);
                setRawRows(results.data);
                setHeaders(fileHeaders);
                setMapping(autoMapping);

                if (isMappingComplete(autoMapping, config)) {
                    setNeedsMapping(false);
                    setRows(results.data.map((row) => applyMapping(row, autoMapping)));
                    setStep(PREVIEW_STEP);
                } else {
                    setNeedsMapping(true);
                    setStep(MAPPING_STEP);
                }
            },
            error(err) {
                setUploadError(err.message);
            },
        });
    }

    function handleMappingChange(header, target) {
        setMapping((prev) => ({ ...prev, [header]: target }));
    }

    async function handleImport() {
        const transformed = rows.map((row) =>
            transformRow(row, config, lookups)
        );
        setStep(IMPORT_STEP);
        await submit(transformed);
    }

    function handleDone() {
        handleReset();
        onClose();
        redirect('list', resource);
        refresh();
    }

    function handleReset() {
        setStep(UPLOAD_STEP);
        setNeedsMapping(false);
        setRawRows([]);
        setHeaders([]);
        setMapping({});
        setRows([]);
        setUploadError(null);
    }

    if (!config) return null;

    return (
        <Dialog
            open={open}
            onClose={step === IMPORT_STEP ? undefined : onClose}
            maxWidth="lg"
            fullWidth
        >
            <DialogTitle>Import {config.label} from CSV</DialogTitle>
            <DialogContent>
                <Stepper activeStep={activeStep} sx={{ mb: 3 }}>
                    {steps.map((label) => (
                        <Step key={label}>
                            <StepLabel>{label}</StepLabel>
                        </Step>
                    ))}
                </Stepper>

                {step === UPLOAD_STEP && (
                    <UploadStep
                        onDownload={handleDownloadTemplate}
                        onUpload={handleFileUpload}
                        uploadError={uploadError}
                        config={config}
                        referenceTrees={referenceTrees}
                        lookupsLoading={lookupsLoading}
                    />
                )}

                {step === MAPPING_STEP && (
                    <ColumnMappingStep
                        headers={headers}
                        mapping={mapping}
                        onChange={handleMappingChange}
                        config={config}
                        missingRequired={missingRequired}
                        duplicateTargets={duplicateTargets}
                    />
                )}

                {step === PREVIEW_STEP && (
                    <PreviewStep
                        rows={rows}
                        columns={config.columns}
                        rowErrors={rowErrors}
                        duplicateRows={duplicateRows}
                        totalErrors={totalErrors}
                        onEditCell={handleEditCell}
                        lookupsLoading={lookupsLoading}
                        lookupsError={lookupsError}
                    />
                )}

                {step === IMPORT_STEP && (
                    <SubmitStep
                        submitting={submitting}
                        progress={progress}
                        result={result}
                    />
                )}
            </DialogContent>
            <DialogActions>
                {step === UPLOAD_STEP && <Button onClick={onClose}>Cancel</Button>}
                {step === MAPPING_STEP && (
                    <>
                        <Button onClick={handleReset}>Back</Button>
                        <Button
                            variant="contained"
                            onClick={goToPreview}
                            disabled={!canProceedMapping}
                        >
                            Next
                        </Button>
                    </>
                )}
                {step === PREVIEW_STEP && (
                    <>
                        <Button
                            onClick={() =>
                                setStep(
                                    needsMapping ? MAPPING_STEP : UPLOAD_STEP
                                )
                            }
                        >
                            Back
                        </Button>
                        <Button
                            variant="contained"
                            onClick={handleImport}
                            disabled={!allValid}
                        >
                            Import {rows.length} rows
                        </Button>
                    </>
                )}
                {step === IMPORT_STEP && result && (
                    <Button variant="contained" onClick={handleDone}>
                        Done
                    </Button>
                )}
            </DialogActions>
        </Dialog>
    );
}

function UploadStep({
    onDownload,
    onUpload,
    uploadError,
    config,
    referenceTrees,
    lookupsLoading,
}) {
    const requiredCols = config.columns.filter((c) => c.required);
    const fkCols = config.columns.filter((c) => c.fkResource);
    const enumCols = config.columns.filter((c) => c.type === 'enum');

    return (
        <Box>
            <Typography variant="body1" gutterBottom>
                Download the template, fill it in, and upload your file. Your
                column names don't have to match exactly — you'll map them in the
                next step.
            </Typography>

            {config.instructions && (
                <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                    {config.instructions}
                </Typography>
            )}

            <Typography variant="body2" color="text.secondary">
                Required fields:{' '}
                {requiredCols.map((c) => c.label).join(', ') || 'none'}
            </Typography>

            {fkCols.length > 0 && (
                <Typography variant="body2" color="text.secondary">
                    Links are matched by name (case-insensitive):{' '}
                    {fkCols
                        .map((c) => `${c.label} → ${singular(c.fkResource)}`)
                        .join(', ')}
                    .
                </Typography>
            )}

            {enumCols.map((c) => (
                <Typography
                    key={c.key}
                    variant="body2"
                    color="text.secondary"
                >
                    {c.label} must be one of: {c.enumValues.join(', ')}.
                </Typography>
            ))}

            <Box sx={{ display: 'flex', gap: 2, my: 2 }}>
                <Button variant="outlined" onClick={onDownload}>
                    Download Template
                </Button>
                <Button variant="contained" component="label">
                    Upload CSV
                    <input
                        type="file"
                        accept=".csv"
                        hidden
                        onChange={onUpload}
                    />
                </Button>
            </Box>

            {fkCols.map((c) => (
                <ReferenceNames
                    key={c.key}
                    column={c}
                    tree={referenceTrees[c.fkResource]}
                    loading={lookupsLoading}
                />
            ))}

            {uploadError && (
                <Alert severity="error" sx={{ mt: 1 }}>
                    <AlertTitle>Cannot import this file</AlertTitle>
                    {uploadError}
                </Alert>
            )}
        </Box>
    );
}

// Shows the existing parent names a user can reference, so they know exactly
// what to type, grouped by their ancestors (e.g. field records under their
// site under their area).
function ReferenceNames({ column, tree, loading }) {
    const total = tree ? countReferenceNames(tree) : 0;
    return (
        <Accordion disableGutters sx={{ mb: 1 }}>
            <AccordionSummary
                expandIcon={<FontAwesomeIcon icon={faChevronDown} />}
            >
                <Typography variant="body2">
                    Valid {singular(column.fkResource)} names to reference
                    {loading ? ' (loading…)' : ` (${total})`}
                </Typography>
            </AccordionSummary>
            <AccordionDetails>
                {loading ? (
                    <LinearProgress />
                ) : total === 0 ? (
                    <Typography variant="body2" color="text.secondary">
                        None exist yet — create some first, or import them with
                        their own template.
                    </Typography>
                ) : (
                    <Box sx={{ maxHeight: 320, overflow: 'auto' }}>
                        <ReferenceTree node={tree} depth={0} />
                    </Box>
                )}
            </AccordionDetails>
        </Accordion>
    );
}

// Renders a reference tree: leaf names as chips, ancestor groups as headings
// (Area at depth 0, Site at depth 1) with their members indented beneath.
function ReferenceTree({ node, depth }) {
    return (
        <Box>
            {node.names.length > 0 && (
                <Box
                    sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mb: 0.5 }}
                >
                    {node.names.map((n) => (
                        <Chip key={n} label={n} size="small" />
                    ))}
                </Box>
            )}
            {node.children.map((child) => (
                <Box key={child.title} sx={{ mt: 0.5, ml: depth > 0 ? 2 : 0 }}>
                    <Typography
                        variant={depth === 0 ? 'subtitle2' : 'body2'}
                        sx={{ fontWeight: 600 }}
                        color="text.secondary"
                    >
                        {child.title}
                    </Typography>
                    <Box sx={{ ml: 1 }}>
                        <ReferenceTree node={child} depth={depth + 1} />
                    </Box>
                </Box>
            ))}
        </Box>
    );
}

function singular(resource) {
    return resource.replace(/s$/, '').replace('_', ' ');
}

function PreviewStep({
    rows,
    columns,
    rowErrors,
    duplicateRows,
    totalErrors,
    onEditCell,
    lookupsLoading,
    lookupsError,
}) {
    if (lookupsLoading) {
        return (
            <Box>
                <Typography>Resolving references...</Typography>
                <LinearProgress sx={{ mt: 1 }} />
            </Box>
        );
    }
    if (lookupsError) {
        return (
            <Alert severity="error">
                Failed to load reference data: {lookupsError.message}
            </Alert>
        );
    }

    const errorCount = rows.filter(
        (_, i) => Object.keys(rowErrors[i] || {}).length > 0 || duplicateRows.has(i)
    ).length;

    return (
        <Box>
            <Box sx={{ display: 'flex', gap: 2, mb: 1, alignItems: 'baseline' }}>
                <Typography>{rows.length} rows. </Typography>
                {totalErrors > 0 ? (
                    <Typography color="error">
                        {errorCount} rows with errors — fix the highlighted
                        cells below to enable import.
                    </Typography>
                ) : (
                    <Typography color="success.main">All rows valid.</Typography>
                )}
            </Box>
            <Box sx={{ maxHeight: 420, overflow: 'auto' }}>
                <Table size="small" stickyHeader>
                    <TableHead>
                        <TableRow>
                            <TableCell sx={{ fontWeight: 'bold' }}>#</TableCell>
                            {columns.map((col) => (
                                <TableCell
                                    key={col.key}
                                    sx={{ fontWeight: 'bold', whiteSpace: 'nowrap' }}
                                >
                                    {col.label}
                                    {col.required && ' *'}
                                </TableCell>
                            ))}
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {rows.map((row, i) => {
                            const errs = rowErrors[i] || {};
                            const isDup = duplicateRows.has(i);
                            return (
                                <TableRow key={i}>
                                    <TableCell>{i + 1}</TableCell>
                                    {columns.map((col) => {
                                        const dupErr =
                                            isDup && col.key === 'name'
                                                ? 'Duplicate name in CSV'
                                                : null;
                                        const err = errs[col.key] || dupErr;
                                        return (
                                            <TableCell
                                                key={col.key}
                                                sx={{ p: 0.5 }}
                                            >
                                                <EditableCell
                                                    col={col}
                                                    value={row[col.key]}
                                                    error={err}
                                                    onChange={(v) =>
                                                        onEditCell(i, col.key, v)
                                                    }
                                                />
                                            </TableCell>
                                        );
                                    })}
                                </TableRow>
                            );
                        })}
                    </TableBody>
                </Table>
            </Box>
        </Box>
    );
}

// One editable cell in the preview. Enum/boolean fields render as dropdowns
// (which also normalises e.g. "snow" -> "Snow"), everything else as a text
// input. Invalid values stay visible and the cell is outlined red with the
// reason in a tooltip.
function EditableCell({ col, value, error, onChange }) {
    const raw = value == null ? '' : String(value);
    const base = {
        value: undefined,
        onChange: (e) => onChange(e.target.value),
        style: {
            width: '100%',
            boxSizing: 'border-box',
            padding: '4px 6px',
            borderRadius: 4,
            border: error
                ? '1px solid #d32f2f'
                : '1px solid rgba(0,0,0,0.23)',
            background: error ? 'rgba(211,47,47,0.08)' : 'transparent',
            font: 'inherit',
            color: 'inherit',
        },
    };

    let control;
    if (col.type === 'enum') {
        const match = col.enumValues.find(
            (v) => v.toLowerCase() === raw.toLowerCase()
        );
        control = (
            <select {...base} value={match ?? raw}>
                <option value="">—</option>
                {col.enumValues.map((v) => (
                    <option key={v} value={v}>
                        {v}
                    </option>
                ))}
                {raw && !match && <option value={raw}>{raw}</option>}
            </select>
        );
    } else if (col.type === 'boolean') {
        const low = raw.toLowerCase();
        const known = ['true', 'yes', '1'].includes(low)
            ? 'true'
            : ['false', 'no', '0'].includes(low)
              ? 'false'
              : '';
        control = (
            <select {...base} value={known !== '' ? known : raw}>
                <option value="">(default)</option>
                <option value="true">true</option>
                <option value="false">false</option>
                {raw && known === '' && <option value={raw}>{raw}</option>}
            </select>
        );
    } else {
        control = (
            <input
                {...base}
                type="text"
                value={raw}
                style={{ ...base.style, minWidth: 120 }}
            />
        );
    }

    if (error) {
        return (
            <Tooltip title={error}>
                <Box component="span" sx={{ display: 'block' }}>
                    {control}
                </Box>
            </Tooltip>
        );
    }
    return control;
}

function SubmitStep({ submitting, progress, result }) {
    if (submitting) {
        const pct =
            progress.total > 0 ? (progress.current / progress.total) * 100 : 0;
        return (
            <Box>
                <Typography>
                    Uploading batch {progress.current} of {progress.total}...
                </Typography>
                <LinearProgress
                    variant="determinate"
                    value={pct}
                    sx={{ mt: 1 }}
                />
            </Box>
        );
    }

    if (!result) return null;

    return (
        <Box>
            <Alert
                severity={result.failed.length > 0 ? 'warning' : 'success'}
                sx={{ mb: 2 }}
            >
                <AlertTitle>Import Complete</AlertTitle>
                {result.succeeded} records created.
                {result.failed.length > 0 && ` ${result.failed.length} failed.`}
            </Alert>
            {result.failed.length > 0 && (
                <Box sx={{ maxHeight: 200, overflow: 'auto' }}>
                    <Table size="small">
                        <TableHead>
                            <TableRow>
                                <TableCell sx={{ fontWeight: 'bold' }}>
                                    Row
                                </TableCell>
                                <TableCell sx={{ fontWeight: 'bold' }}>
                                    Error
                                </TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {result.failed.map((f, i) => (
                                <TableRow key={i}>
                                    <TableCell>{f.row}</TableCell>
                                    <TableCell>{f.error}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </Box>
            )}
        </Box>
    );
}
