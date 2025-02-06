import {
    List,
    Datagrid,
    TextField,
    FunctionField,
    usePermissions,
    ReferenceManyCount,
    Loading,
} from "react-admin";
import { ListActionsByPermission } from '../custom/Toolbars';
import CustomEmptyPage from '../Empty';
import { ColorBox } from './Show';

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
            </Datagrid>
        </List >

    )
};

export default ListComponent;
