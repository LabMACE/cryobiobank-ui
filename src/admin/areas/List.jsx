import {
    List,
    Datagrid,
    TextField,
    FunctionField,
    usePermissions,
    useRecordContext,
    ReferenceManyCount,
    Loading,
} from "react-admin";
import { ListActionsByPermission } from '../custom/Toolbars';
import CustomEmptyPage from '../Empty';
import { ColorBox } from './Show';
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
            <Datagrid rowClick="show" bulkActionButtons={permissions === 'admin' ? true : false}>
                <TextField source="name" />
                <FunctionField render={() => <ColorBox />} label="Color" />
                <ReferenceManyCount reference="sites" target="area_id" label="Sites" />
                {permissions === 'admin' && (
                    <FunctionField label="Privacy" render={() => <PrivacyField />} />
                )}
            </Datagrid>
        </List >

    )
};

export default ListComponent;
