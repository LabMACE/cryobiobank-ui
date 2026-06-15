import {
    usePermissions,
    useResourceContext,
    TopToolbar,
    EditButton,
    Loading,
    CreateButton,
    ExportButton,
    DeleteButton,
} from 'react-admin';
import { CsvImportButton } from '../import/CsvImportButton';

export const MyActionsByPermission = () => {
    const { permissions, isLoading } = usePermissions();

    if (isLoading) return <Loading />;

    return (
    <TopToolbar>
        {permissions && permissions == 'admin' ? (
        <>
            <EditButton />
            <DeleteButton />
        </>
        ) : null}
    </TopToolbar>
)};

export const ListActionsByPermission = () => {
    const { permissions, isLoading } = usePermissions();
    const resource = useResourceContext();

    if (isLoading) return <Loading />;

    return (
    <TopToolbar>
        {permissions && permissions == 'admin' ? (
            <>
                <CsvImportButton resource={resource} />
                <CreateButton/>
                <ExportButton/>
            </>
        ) : null}
    </TopToolbar>
)}