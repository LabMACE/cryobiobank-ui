import {
    List,
    Datagrid,
    TextField,
    DateField,
    ReferenceManyCount,
} from "react-admin";

const ListComponent = () => {

    return (
        <List disableSyncWithLocation
            perPage={25}
            sort={{ field: 'created_on', order: 'DESC' }}
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
