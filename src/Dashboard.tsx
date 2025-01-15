import {
    usePermissions,
    Loading,
    useGetMany,
    useGetList
} from 'react-admin';
import { Card } from '@mui/material';
import { Title } from 'react-admin';
import CardContent from '@mui/material/CardContent';
import { SiteMap } from './maps/Sites';

const Dashboard = ({ }) => {
    const { isPending: isPendingPermissions, permissions } = usePermissions();
    const { data: sites, total, isPending: isPendingGetList, error } = useGetList('sites', {});
    if (isPendingPermissions || isPendingGetList) return <Loading />;
    // console.log(isPendingGetList, sites);
    return (
        <>
            <Card>
                <Title title="Welcome to CryoBioBank" />
                {
                    (permissions === 'admin') ?
                        (
                            <>
                                <CardContent style={{ textAlign: 'center' }}>Welcome to CryoBioBank</CardContent>
                                <SiteMap sites={sites} />
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
