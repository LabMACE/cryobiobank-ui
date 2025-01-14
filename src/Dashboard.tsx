import {
    usePermissions,
    useRedirect,
    useDataProvider,
    useNotify,
    Loading,
} from 'react-admin';
import { Grid, Typography } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { Card } from '@mui/material';
import { Title } from 'react-admin';
import CardContent from '@mui/material/CardContent';
import { LocationFieldAreas } from './maps/Sites';

const Dashboard = () => {
    const { isPending, permissions } = usePermissions();
    if (isPending) return <Loading />;
    return (
        <>< LocationFieldAreas /> <Card>
            <Title title="Welcome to CryoBioBank" />
            {
                (permissions === 'admin') ?
                    (
                        <>
                            <CardContent>Welcome to CryoBioBank</CardContent>

                        </>
                    )
                    : (
                        <>
                            <CardContent>Welcome to CryoBioBank

                                This portal is only available to administrators.
                                <br /><br />
                                Permissions: {permissions.toString()}
                            </CardContent>
                        </>
                    )}
        </Card>
        </>
    );
}

export default Dashboard;
