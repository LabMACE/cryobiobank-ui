import {
    usePermissions,
    Loading,
    useGetMany,
    useGetList
} from 'react-admin';
import { Card } from '@mui/material';
import { Title } from 'react-admin';
import CardContent from '@mui/material/CardContent';
import { SitesMap } from '../maps/Sites';

const Dashboard = ({ }) => {
    const { isPending: isPendingPermissions, permissions } = usePermissions();
    if (isPendingPermissions) return <Loading />;

    return (
        <Card sx={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 100px)' }}>
            <Title title="Welcome to CryoBioBank" />
            <CardContent style={{ textAlign: 'center', paddingBottom: 0 }}>Welcome to CryoBioBank</CardContent>
            <CardContent sx={{ flex: 1, p: 0, '&:last-child': { pb: 0 } }}>
                <SitesMap height="100%" />
            </CardContent>
        </Card>
    );
}

export default Dashboard;
