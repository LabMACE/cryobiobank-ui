import {
    List,
    Datagrid,
    TextField,
    NumberField,
    BooleanField,
    DateField,
} from "react-admin";

const ObjectList = () => {

    return (
        <List>
            <Datagrid rowClick="show" >
                <DateField source="created_on" showTime />
                <TextField source="filename" />
                <TextField source="processing_message" />
                <BooleanField label="Upload complete" source="all_parts_received" />
            </Datagrid>
        </List >
    )
};

export default ObjectList;
