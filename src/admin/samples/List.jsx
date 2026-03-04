import {
    List,
    Datagrid,
    TextField,
    ReferenceField,
    SelectInput,
    usePermissions,
    Loading,
} from "react-admin";
import { ListActionsByPermission } from '../custom/Toolbars';
import CustomEmptyPage from '../Empty';

const sampleTypeChoices = [
    { id: 'Snow', name: 'Snow' },
    { id: 'Soil', name: 'Soil' },
];

const sampleFilters = [
    <SelectInput source="sample_type" label="Sample Type" choices={sampleTypeChoices} alwaysOn />,
];

const ListComponent = () => {
    const { permissions, isLoading } = usePermissions();
    if (isLoading) return <Loading />;
    
    return (
        <List disableSyncWithLocation
            perPage={25}
            sort={{ field: 'name', order: 'ASC' }}
            actions={<ListActionsByPermission />}
            empty={<CustomEmptyPage/>}
            filters={sampleFilters}
        >
            <Datagrid rowClick="show" bulkActionButtons={permissions === 'admin' ? true : false}>
                <TextField source="name" />
                <ReferenceField source="site_replicate_id" reference="site_replicates" />
                <ReferenceField source="dna_id" reference="dna" />
                <TextField source="sample_type" label="Sample Type" />
                <TextField source="storage_location" />
            </Datagrid>
        </List >

    )
};

export default ListComponent;
