import {
    usePermissions,
    TopToolbar,
    EditButton,
    Loading,
    CreateButton,
    ExportButton,
} from 'react-admin';

export const MyActionsByPermission = () => {
    const { permissions, isLoading } = usePermissions();
    
    if (isLoading) return <Loading />;
    
    return (
    <TopToolbar>
        {permissions && permissions == 'admin' ? <EditButton /> : null}
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