import {
    List,
    Datagrid,
    TextField,
    ReferenceField,
    usePermissions,
    Loading,
} from "react-admin";
import { ListActionsByPermission } from '../custom/Toolbars';
import CustomEmptyPage from '../Empty';

const ListComponent = () => {
    const { permissions, isLoading } = usePermissions();
    if (isLoading) return <Loading />;

    return (
        <List disableSyncWithLocation
            perPage={25}
            sort={{ field: 'created_on', order: 'DESC' }}
            actions={<ListActionsByPermission />}
            empty={<CustomEmptyPage/>}

        >
            <Datagrid rowClick="show" bulkActionButtons={permissions === 'admin' ? true : false}>
                <TextField source="name" />
                <TextField source="extraction_method" />
                <ReferenceField source="field_record_id" reference="field_records" label="Field Record">
                    <TextField source="name" />
                </ReferenceField>
                <ReferenceField source="field_record_id" reference="field_records" link={false} label="Site">
                    <ReferenceField source="site_id" reference="sites" link="show">
                        <TextField source="name" />
                    </ReferenceField>
                </ReferenceField>
            </Datagrid>
        </List >

    )
};

export default ListComponent;
