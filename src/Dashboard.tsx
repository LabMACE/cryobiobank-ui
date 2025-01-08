import {
    usePermissions,
    useGetList,
    Button,
    useRedirect,
    useDataProvider,
    useNotify,
    Loading,
} from 'react-admin';
import { Grid, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper } from '@mui/material';
import Box from '@mui/material/Box';
import { useNavigate } from 'react-router-dom';


const Dashboard = () => {
    const { isPending, permissions } = usePermissions();
    // const {
    //     data,
    //     total,
    //     isPending,
    //     error
    // } = useGetList('layers');

    // const {
    //     data: enabledLayers,
    //     total: totalEnabledLayers,
    //     isPending: enabledLayersIsPending,
    //     error: enabledLayersError
    // } = useGetList('layers', {
    //     filter: { enabled: true }
    // });

    // const {
    //     data: styles,
    //     total: totalStyles,
    //     isPending: stylesIsPending,
    //     error: stylesError
    // } = useGetList('layers', {
    //     filter: { style: null }
    // });

    // const totalLayersWithoutStyles = total - totalStyles;
    const navigate = useNavigate();
    const redirect = useRedirect();
    const notify = useNotify();
    const dataProvider = useDataProvider();

    const handleRedirectDisabledLayers = () => {
        // Navigate to list with filter
        navigate({
            pathname: '/layers',
            search: '?filter={"enabled":false}',
        });
    }

    const handleRedirectAllLayers = () => {
        redirect('list', '/layers');
    }

    // if (isPending || enabledLayersIsPending) return <Loading />;
    // if (!data) return null;
    // if (error) return <p>Error: {error}</p>;
    if (isPending) return <Loading />;
    console.log('permissions', permissions);
    return (
        <>{
            (permissions === 'admin') ?
                (
                    <>
                        <Grid container spacing={3}>
                            Welcome
                        </Grid>
                    </>
                )
                : (
                    <>
                        <Typography
                            variant="body"
                            color="error"
                            align='center'
                            gutterBottom>
                            This portal is only available to administrators.<br /><br /> Permissions: {permissions.toString()}
                        </Typography>
                    </>
                )}
        </>
    );
}

export default Dashboard;
