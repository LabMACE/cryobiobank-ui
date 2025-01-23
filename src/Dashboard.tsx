import {
    usePermissions,
    Loading,
    useGetMany,
    useGetList
} from 'react-admin';
import { Card } from '@mui/material';
import { Title } from 'react-admin';
import CardContent from '@mui/material/CardContent';
import { SitesMap } from './maps/Sites';

const Dashboard = ({ }) => {
    const { isPending: isPendingPermissions, permissions } = usePermissions();
    if (isPendingPermissions) return <Loading />;
    
    return (
        <>
            <Card>
                <Title title="Welcome to CryoBioBank" />
                
                            <>
                                <CardContent style={{ textAlign: 'center' }}>Welcome to CryoBioBank</CardContent>
                                <SitesMap/>
                            </>
                
            </Card>
        </>
    );
}

export default Dashboard;
