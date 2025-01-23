import {
    List,
    Datagrid,
    TextField,
    ReferenceManyCount,
} from "react-admin";
import { ListActionsByPermission } from '../custom/Toolbars';

const ListComponent = () => {

    return (
        <List disableSyncWithLocation
            perPage={25}
            sort={{ field: 'created_on', order: 'DESC' }}
            actions={<ListActionsByPermission />}
        >
            <Datagrid rowClick="show" >
                <TextField source="name" />
                <TextField source="extraction_method" />
                <ReferenceManyCount reference="isolates" target="dna_id" label="Isolates" />
                <ReferenceManyCount reference="samples" target="dna_id" label="Samples" />
            </Datagrid>
        </List >

    )
};

export default ListComponent;
