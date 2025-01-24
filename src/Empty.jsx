import {
    usePermissions,
    Loading,
    Empty,
    useResourceContext,
} from 'react-admin';
import { Card } from '@mui/material';
import CardContent from '@mui/material/CardContent';

const CustomEmptyPage = () => {
    const { isPending: isPendingPermissions, permissions } = usePermissions();
    const resource = useResourceContext();
    const resourceSingular = resource.endsWith('s') ? resource.slice(0, -1) : resource;
    
    if (isPendingPermissions) return <Loading />;    
    if (permissions === 'admin') {
        // Provide a way to create a new record if logged in as an admin
        return <Empty />;
    }
    
    return (
        <>
            <Card>
                <CardContent style={{ textAlign: 'center' }}>
                    There are currently no {resourceSingular} records to display.
                </CardContent>
            </Card>
        </>
    );
}

export default CustomEmptyPage;
