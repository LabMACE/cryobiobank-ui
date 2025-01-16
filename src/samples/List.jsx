import {
    List,
    Datagrid,
    TextField,
    DateField,
    ReferenceField,
} from "react-admin";

const ListComponent = () => {

    return (
        <List disableSyncWithLocation
            perPage={25}
            sort={{ field: 'name', order: 'ASC' }}
        >
            <Datagrid rowClick="show" >
                <TextField source="name" />
                <ReferenceField source="site_replicate_id" reference="site_replicates" />
                <ReferenceField source="dna_id" reference="dna" />
                <TextField source="type_of_sample" />
                <TextField source="storage_location" />
            </Datagrid>
        </List >

    )
};

export default ListComponent;
