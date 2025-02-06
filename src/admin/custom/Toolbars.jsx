import {
    usePermissions,
    TopToolbar,
    EditButton,
    Loading,
    CreateButton,
    ExportButton,
    DeleteButton,
} from 'react-admin';

export const MyActionsByPermission = () => {
    const { permissions, isLoading } = usePermissions();
    
    if (isLoading) return <Loading />;
    
    return (
    <TopToolbar>
        {permissions && permissions == 'admin' ? (
        <>
            <EditButton />
            <DeleteButton mutationMode='pessimistic' />
        </>
        ) : null}
    </TopToolbar>
)};

export const ListActionsByPermission = () => {
    const { permissions, isLoading } = usePermissions();
    
    if (isLoading) return <Loading />;
    
    return (
    <TopToolbar>
        {permissions && permissions == 'admin' ? (
            <>
                <CreateButton/>
                <ExportButton/>
            </>
        ) : null}
    </TopToolbar>
)}