import {
    List,
    Datagrid,
    TextField,
    FunctionField,
    ReferenceField,
    useRecordContext,
    usePermissions,
    Loading,
} from "react-admin";
import { ListActionsByPermission } from '../custom/Toolbars';
import CustomEmptyPage from '../Empty';
import LockIcon from '@mui/icons-material/Lock';
import PublicIcon from '@mui/icons-material/Public';
import PhotoHoverField from './PhotoHoverField';

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
                <ReferenceField source="field_record_id" reference="field_records" link={false} label="Site">
                    <ReferenceField source="site_id" reference="sites" link="show">
                        <TextField source="name" />
                    </ReferenceField>
                </ReferenceField>
                <ReferenceField source="field_record_id" reference="field_records" link="show" label="Field Record">
                    <TextField source="name" />
                </ReferenceField>
                <TextField source="taxonomy" />
                <TextField source="storage_location" />
                <TextField source="media_used_for_isolation" />
                <FunctionField label="Photo" render={() => <PhotoHoverField />} />
                {permissions === 'admin' && (
                    <FunctionField label="Privacy" render={() => <PrivacyField />} />
                )}

            </Datagrid>
        </List >

    )
};

export default ListComponent;
