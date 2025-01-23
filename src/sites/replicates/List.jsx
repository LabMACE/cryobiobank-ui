import {
    List,
    Datagrid,
    TextField,
    DateField,
    usePermissions,
    Loading,
} from "react-admin";
import { ListActionsByPermission } from '../../custom/Toolbars';


const ListComponent = () => {
    const { permissions, isLoading } = usePermissions();
    if (isLoading) return <Loading />;
    
    return (
        <List disableSyncWithLocation
            perPage={25}
            sort={{ field: 'created_on', order: 'DESC' }}
            actions={<ListActionsByPermission />}
        >
            <Datagrid rowClick="show" bulkActionButtons={permissions === 'admin' ? true : false}>
                <TextField source="name" />
                <TextField source="comment" />
                <DateField
                    label="Created on (UTC)"
                    source="created_on"
                    transform={value => new Date(value + 'Z')}
                    showTime={true}
                />
                <DateField
                    label="Last updated (UTC)"
                    source="last_updated"
                    transform={value => new Date(value + 'Z')}
                    showTime={true}
                />
            </Datagrid>
        </List >

    )
};

export default ListComponent;
