import {
    List,
    Datagrid,
    TextField,
    DateField,
} from "react-admin";
import { ListActionsByPermission } from '../../custom/Toolbars';


const ListComponent = () => {

    return (
        <List disableSyncWithLocation
            perPage={25}
            sort={{ field: 'created_on', order: 'DESC' }}
            actions={<ListActionsByPermission />}
        >
            <Datagrid rowClick="show" >
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
