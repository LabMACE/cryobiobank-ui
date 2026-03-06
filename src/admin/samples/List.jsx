import {
    List,
    Datagrid,
    TextField,
    ReferenceField,
    FunctionField,
    SelectInput,
    useRecordContext,
    usePermissions,
    Loading,
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

const sampleTypeChoices = [
    { id: 'Snow', name: 'Snow' },
    { id: 'Soil', name: 'Soil' },
];

const sampleFilters = [
    <SelectInput source="sample_type" label="Sample Type" choices={sampleTypeChoices} alwaysOn />,
];

const ListComponent = () => {
    const { permissions, isLoading } = usePermissions();
    if (isLoading) return <Loading />;

    return (
        <List disableSyncWithLocation
            perPage={25}
            sort={{ field: 'name', order: 'ASC' }}
            actions={<ListActionsByPermission />}
            empty={<CustomEmptyPage/>}
            filters={sampleFilters}
        >
            <Datagrid rowClick="show" bulkActionButtons={permissions === 'admin' ? true : false}>
                <TextField source="name" />
                <ReferenceField source="site_replicate_id" reference="site_replicates" link={false} label="Site">
                    <ReferenceField source="site_id" reference="sites" link="show">
                        <TextField source="name" />
                    </ReferenceField>
                </ReferenceField>
                <ReferenceField source="site_replicate_id" reference="site_replicates" link="show" label="Replicate">
                    <TextField source="name" />
                </ReferenceField>
                <TextField source="sample_type" label="Sample Type" />
                <TextField source="storage_location" />
                {permissions === 'admin' && (
                    <FunctionField label="Privacy" render={() => <PrivacyField />} />
                )}
            </Datagrid>
        </List >

    )
};

export default ListComponent;
