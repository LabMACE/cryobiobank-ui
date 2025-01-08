import {
    Show,
    SimpleShowLayout,
    TextField,
    NumberField,
    DateField,
    BooleanField,
    FunctionField,
} from 'react-admin';


const ObjectShow = () => {
    return (
        <Show>
            <SimpleShowLayout>
                <TextField source="id" />
                <TextField source="processing_message" />
                <TextField source="filename" />
                <NumberField source="size_bytes" />
                <FunctionField render={record => (record.size_bytes / 1024 / 1024).toFixed(2)} label="Size (MB)" />
                <DateField source="created_on" showTime={true} />
                <BooleanField source="all_parts_received" />
            </SimpleShowLayout>
        </Show >
    )
};

export default ObjectShow;