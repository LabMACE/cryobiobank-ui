import {
    List,
    Datagrid,
    TextField,
    ReferenceField,
} from "react-admin";
import { ListActionsByPermission } from '../custom/Toolbars';

const ListComponent = () => {

    return (
        <List disableSyncWithLocation
            perPage={25}
            sort={{ field: 'name', order: 'ASC' }}
            actions={<ListActionsByPermission />}
        >
            <Datagrid rowClick="show" >
                <TextField source="name" />
                <ReferenceField source="site_replicate_id" reference="site_replicates" />
                <ReferenceField source="dna_id" reference="dna" />
                <TextField source="taxonomy" />
                <TextField source="storage_location" />
                <TextField source="media_used_for_isolation" />

            </Datagrid>
        </List >

    )
};

export default ListComponent;
