import {
    List,
    Datagrid,
    TextField,
    BooleanField,
    FunctionField,
    ReferenceField,
    useRecordContext,
    useCreatePath,
    usePermissions,
    BulkDeleteButton,
    Loading,
    Link,
    FilterButton,
    TopToolbar,
    ExportButton,
    CreateButton,
    useGetOne,
} from "react-admin";
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
    const { data, isLoading } = useGetOne('sites', { id: record?.id }, { enabled: !!record });
    const createPath = useCreatePath();

    if (isLoading) return <Loading />;

    const replicates = [...(data?.replicates || [])].sort((a, b) => {
        return new Date(a.sampling_date) - new Date(b.sampling_date);
    });

    if (replicates.length === 0) {
        return <em>No replicates recorded for this site.</em>;
    }

    return (
        <table>
            <thead>
                <tr>
                    <th style={{ paddingRight: '20px', textAlign: 'left' }}>Replicate</th>
                    <th style={{ paddingRight: '20px', textAlign: 'left' }}>Date</th>
                    <th style={{ paddingRight: '20px', textAlign: 'left' }}>Samples</th>
                    <th style={{ paddingRight: '20px', textAlign: 'left' }}>Isolates</th>
                    <th style={{ paddingRight: '20px', textAlign: 'left' }}>DNA</th>
                </tr>
            </thead>
            <tbody>
                {replicates.map((replicate) => (
                    <tr key={replicate.id}>
                        <td style={{ paddingRight: '20px' }}>
                            <Link to={createPath({ resource: 'site_replicates', type: 'show', id: replicate.id })}>
                                {replicate.name}
                            </Link>
                        </td>
                        <td style={{ paddingRight: '20px' }}>{replicate.sampling_date}</td>
                        <td style={{ paddingRight: '20px' }}>{replicate.sample_count ?? 0}</td>
                        <td style={{ paddingRight: '20px' }}>{replicate.isolate_count ?? 0}</td>
                        <td style={{ paddingRight: '20px' }}>{replicate.dna_count ?? 0}</td>
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
                <ReferenceField source="area_id" reference="areas" link="show" label="Area">
                    <TextField source="name" />
                </ReferenceField>
                <TextField source="latitude_4326" label="Latitude (°)" />
                <TextField source="longitude_4326" label="Longitude (°)" />
                <TextField source="elevation_metres" label="Elevation (m)" />
                <FunctionField label="Replicates" render={record => record?.replicates?.length ?? 0} />
                {permissions === 'admin' && (
                    <FunctionField label="Privacy" render={() => <PrivacyField />} />
                )}
            </Datagrid>
        </List >

    )
};

export default ListComponent;
