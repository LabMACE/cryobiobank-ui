import {
    List,
    Datagrid,
    TextField,
    DateField,
    ReferenceField,
    ReferenceManyCount,
    FunctionField,
    SelectInput,
    useRecordContext,
    usePermissions,
    Loading,
} from "react-admin";
import { ListActionsByPermission } from '../custom/Toolbars';
import CustomEmptyPage from '../Empty';
import LockIcon from '@mui/icons-material/Lock';
import PublicIcon from '@mui/icons-material/Public';

const PrivacyField = () => {
    const record = useRecordContext();
    return record?.is_private ? (
        <LockIcon color="warning" titleAccess="Private Record" fontSize="small" />
    ) : (
        <PublicIcon color="success" titleAccess="Public Record" fontSize="small" />
    );
};

const sampleTypeChoices = [
    { id: 'Snow', name: 'Snow' },
    { id: 'Soil', name: 'Soil' },
];

const fieldRecordFilters = [
    <SelectInput source="sample_type" label="Sample Type" choices={sampleTypeChoices} alwaysOn />,
];

const ListComponent = () => {
    const { permissions, isLoading } = usePermissions();
    if (isLoading) return <Loading />;

    return (
        <List disableSyncWithLocation
            perPage={25}
            sort={{ field: 'sampling_date', order: 'DESC' }}
            actions={<ListActionsByPermission />}
            empty={<CustomEmptyPage/>}
            filters={fieldRecordFilters}
        >
            <Datagrid rowClick="show" bulkActionButtons={permissions === 'admin' ? true : false}>
                <TextField source="name" />
                <DateField source="sampling_date" label="Sampling Date" />
                <TextField source="sample_type" label="Type" />
                <ReferenceField source="site_id" reference="sites" link="show" label="Site">
                    <TextField source="name" />
                </ReferenceField>
                <ReferenceManyCount reference="isolates" target="field_record_id" label="Isolates" />
                <ReferenceManyCount reference="samples" target="field_record_id" label="Samples" />
                <ReferenceManyCount reference="dna" target="field_record_id" label="DNA" />
                {permissions === 'admin' && (
                    <FunctionField label="Privacy" render={() => <PrivacyField />} />
                )}
            </Datagrid>
        </List >

    )
};

export default ListComponent;
