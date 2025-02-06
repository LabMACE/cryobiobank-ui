import {
    List,
    Datagrid,
    TextField,
    ReferenceManyCount,
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
                <ReferenceManyCount reference="isolates" target="dna_id" label="Isolates" />
                <ReferenceManyCount reference="samples" target="dna_id" label="Samples" />
            </Datagrid>
        </List >

    )
};

export default ListComponent;
