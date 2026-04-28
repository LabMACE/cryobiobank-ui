import { createContext, useContext, useState } from 'react';
import {
    List,
    Datagrid,
    TextField,
    FunctionField,
    ReferenceField,
    useRecordContext,
    useCreatePath,
    usePermissions,
    useRedirect,
    useGetOne,
    BulkDeleteButton,
    Loading,
    Button,
} from "react-admin";
import { Box, Typography, Chip, Card, CardContent, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Link as MuiLink } from '@mui/material';
import HeightIcon from '@mui/icons-material/Height';
import AddIcon from '@mui/icons-material/Add';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import PlaceIcon from '@mui/icons-material/Place';
import LockIcon from '@mui/icons-material/Lock';
import PublicIcon from '@mui/icons-material/Public';
import proj4 from 'proj4';
import { ListActionsByPermission } from '../custom/Toolbars';
import CustomEmptyPage from '../Empty';

proj4.defs("EPSG:2056", "+proj=somerc +lat_0=46.9524055555556 +lon_0=7.43958333333333 +k_0=1 +x_0=2600000 +y_0=1200000 +ellps=bessel +towgs84=674.374,15.056,405.346,0,0,0,0 +units=m +no_defs +type=crs");

const SelectedSiteContext = createContext({ selectedSite: null, setSelectedSite: () => {} });

const PrivacyField = () => {
    const record = useRecordContext();
    return record?.is_private ? (
        <LockIcon color="warning" titleAccess="Private Record" fontSize="small" />
    ) : (
        <PublicIcon color="success" titleAccess="Public Record" fontSize="small" />
    );
};

const HighlightRow = ({ children, ...props }) => {
    const record = useRecordContext();
    const { selectedSite } = useContext(SelectedSiteContext);
    const isSelected = selectedSite && record && selectedSite.id === record.id;
    return (
        <TableRow
            {...props}
            sx={{
                ...(isSelected && {
                    backgroundColor: 'action.selected',
                }),
                cursor: 'pointer',
            }}
        >
            {children}
        </TableRow>
    );
};

const SiteAside = () => {
    const { selectedSite } = useContext(SelectedSiteContext);
    const { permissions } = usePermissions();
    const isAdmin = permissions === 'admin';
    const redirect = useRedirect();
    const createPath = useCreatePath();

    const { data: fullSite, isLoading: siteLoading } = useGetOne(
        'sites',
        { id: selectedSite?.id },
        { enabled: !!selectedSite }
    );

    if (!selectedSite) {
        return (
            <Box sx={{ width: 420, ml: 2, mt: 1 }}>
                <Card>
                    <CardContent sx={{ textAlign: 'center', py: 6 }}>
                        <PlaceIcon sx={{ fontSize: 48, color: 'text.disabled', mb: 1 }} />
                        <Typography color="text.secondary">
                            Select a site to view its field records
                        </Typography>
                    </CardContent>
                </Card>
            </Box>
        );
    }

    const record = fullSite || selectedSite;
    const fieldRecords = [...(record.field_records || [])].sort(
        (a, b) => new Date(a.sampling_date) - new Date(b.sampling_date)
    );

    const [swissE, swissN] = record.longitude_4326 && record.latitude_4326
        ? proj4('EPSG:4326', 'EPSG:2056', [record.longitude_4326, record.latitude_4326]).map(Math.round)
        : [null, null];

    const swissTopoUrl = swissE
        ? `https://map.geo.admin.ch/?lang=en&center=${swissE},${swissN}&z=13&crosshair=marker&bgLayer=ch.swisstopo.pixelkarte-farbe`
        : null;

    return (
        <Box sx={{ width: 420, ml: 2, mt: 1 }}>
            <Card>
                <CardContent>
                    {/* Site header */}
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5, flexWrap: 'wrap' }}>
                        <Typography variant="h6" fontWeight={600}>{record.name}</Typography>
                        <Chip
                            icon={<HeightIcon fontSize="small" />}
                            label={`${record.elevation_metres} m`}
                            size="small"
                            variant="outlined"
                        />
                    </Box>
                    <ReferenceField record={record} source="area_id" reference="areas" link="show" resource="sites">
                        <TextField source="name" />
                    </ReferenceField>
                    {swissTopoUrl && (
                        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                            <MuiLink href={swissTopoUrl} target="_blank" rel="noopener noreferrer">
                                {record.latitude_4326?.toFixed(5)}, {record.longitude_4326?.toFixed(5)}
                            </MuiLink>
                        </Typography>
                    )}

                    {/* Action buttons */}
                    <Box sx={{ display: 'flex', gap: 1, mt: 1.5, mb: 1.5 }}>
                        <Button
                            label="View Site"
                            onClick={() => redirect('show', 'sites', record.id)}
                            startIcon={<OpenInNewIcon />}
                            size="small"
                        />
                        {isAdmin && (
                            <Button
                                label="Add Field Record"
                                onClick={() => redirect('create', 'field_records', null, {}, { record: { site_id: record.id } })}
                                startIcon={<AddIcon />}
                                size="small"
                            />
                        )}
                    </Box>

                    {/* Field records table */}
                    <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>
                        Field Records ({fieldRecords.length})
                    </Typography>

                    {fieldRecords.length === 0 ? (
                        <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic' }}>
                            No field records recorded for this site.
                        </Typography>
                    ) : (
                        <TableContainer>
                            <Table size="small">
                                <TableHead>
                                    <TableRow>
                                        <TableCell>Name</TableCell>
                                        <TableCell>Date</TableCell>
                                        <TableCell>Type</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {fieldRecords.map((rep) => (
                                        <TableRow
                                            key={rep.id}
                                            hover
                                            sx={{ cursor: 'pointer' }}
                                            onClick={() => redirect('show', 'field_records', rep.id)}
                                        >
                                            <TableCell>{rep.name}</TableCell>
                                            <TableCell>{rep.sampling_date}</TableCell>
                                            <TableCell>{rep.sample_type}</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    )}
                </CardContent>
            </Card>
        </Box>
    );
};

const ListComponent = () => {
    const { permissions, isLoading } = usePermissions();
    const [selectedSite, setSelectedSite] = useState(null);

    if (isLoading) return <Loading />;

    const handleRowClick = (id, resource, record) => {
        setSelectedSite(record);
        return false; // prevent navigation
    };

    return (
        <SelectedSiteContext.Provider value={{ selectedSite, setSelectedSite }}>
            <List
                disableSyncWithLocation
                perPage={25}
                sort={{ field: 'name', order: 'ASC' }}
                actions={<ListActionsByPermission />}
                empty={<CustomEmptyPage />}
                aside={<SiteAside />}
            >
                <Datagrid
                    rowClick={handleRowClick}
                    bulkActionButtons={permissions === 'admin' ? <BulkDeleteButton /> : false}
                >
                    <TextField source="name" />
                    <ReferenceField source="area_id" reference="areas" link="show" label="Area">
                        <TextField source="name" />
                    </ReferenceField>
                    <TextField source="elevation_metres" label="Elev (m)" />
                    <FunctionField label="Field Records" render={record => record?.field_records?.length ?? 0} />
                    {permissions === 'admin' && (
                        <FunctionField label="" render={() => <PrivacyField />} />
                    )}
                </Datagrid>
            </List>
        </SelectedSiteContext.Provider>
    );
};

export default ListComponent;
