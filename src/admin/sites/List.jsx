import {
    List,
    Datagrid,
    TextField,
    BooleanField,
    FunctionField,
    useRecordContext,
    useCreatePath,
    ReferenceManyCount,
    usePermissions,
    BulkDeleteButton,
    Loading,
    Link,
    FilterButton,
    TopToolbar,
    ExportButton,
    CreateButton,
} from "react-admin";
// import { Link } from 'react-router-dom';
import { ListActionsByPermission } from '../custom/Toolbars';
import CustomEmptyPage from '../Empty';
import LockIcon from '@mui/icons-material/Lock';
import PublicIcon from '@mui/icons-material/Public';

const PrivacyField = () => {
    const record = useRecordContext();
    return record?.is_private ? (
        <LockIcon color="warning" titleAccess="Private Record" fontSize="small" />
    ) : (
        <PublicIcon color="success" titleAccess="Public Record" fontSize="small" />
    );
};

const PostPanel = () => {
    const record = useRecordContext();
    const createPath = useCreatePath();
    const objectClick = (id, resource, record) => (
        createPath({ resource: 'site_replicates', type: 'show', id: record.id })
    );
    // Get sorted replicate list
    const replicates = record.replicates.sort((a, b) => {
        return new Date(a.sampling_date) - new Date(b.sampling_date);
    });

    return (
        <table>
            <thead>
                <tr>
                    <th style={{ paddingRight: '20px' }}>Date</th>
                </tr>
            </thead>
            <tbody>
                {replicates.map((replicate, index) => (
                    <tr key={index}>
                        <td style={{ paddingRight: '20px' }}>
                            <Link to={objectClick(replicate.id, 'site_replicates', replicate)}>{replicate.sampling_date}</Link>
                        </td>
                    </tr>
                ))}
            </tbody>
        </table>
    );
};

const ListComponent = () => {
    const { permissions, isLoading } = usePermissions();
    if (isLoading) return <Loading />;
    
    return (
        <List disableSyncWithLocation
            perPage={25}
            sort={{ field: 'name', order: 'ASC' }}
            actions={<ListActionsByPermission />}
            empty={<CustomEmptyPage/>}

        >
            <Datagrid 
                rowClick="show" 
                expand={<PostPanel />} 
                bulkActionButtons={permissions === 'admin' ? <BulkDeleteButton /> : false}
            >
                <TextField source="name" />
                <TextField source="latitude_4326" label="Latitude (°)" />
                <TextField source="longitude_4326" label="Longitude (°)" />
                <TextField source="elevation_metres" label="Elevation (m)" />
                <ReferenceManyCount reference="site_replicates" target="site_id" label="Replicates" />
                {permissions === 'admin' && (
                    <FunctionField label="Privacy" render={() => <PrivacyField />} />
                )}
            </Datagrid>
        </List >

    )
};

export default ListComponent;
