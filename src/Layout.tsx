import { Layout, AppBar, TitlePortal, usePermissions } from 'react-admin';
import { CssBaseline, Typography } from '@mui/material';

const MyAppBar = (props) => {
    const { isPending, permissions } = usePermissions();
    const appBarText = () => {
        if (props.deployment) {
            if (props.deployment == 'local') {
                return "⭐Local Development⭐"
            }
            if (props.deployment == 'dev') {
                return "⭐Development⭐"
            }
            if (props.deployment == 'stage') {
                return "⭐Staging⭐"
            }
        }
    }

    if (isPending) return null;

    return (
        <AppBar color="primary" >
            <TitlePortal />
            <Typography
                variant="h6"
                color='#FF69B4'
                id="react-admin-title"
            >
                {props.deployment ? appBarText() : ""}&nbsp;&nbsp;

            </Typography>

        </AppBar>
    )
};


const MyLayout = ({ children, deployment }) => {
    return (
        <>
            <CssBaseline />
            <Layout
                appBar={() => <MyAppBar deployment={deployment} />}
            >
                {children}
            </Layout>
        </>
    )
};

export default MyLayout;
