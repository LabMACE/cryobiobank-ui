import { createContext, useContext } from 'react';
import {
    Layout,
    Button,
    AppBar,
    TitlePortal,
    usePermissions,
    useAuthProvider,
    Menu,
    LabelIcon,
} from 'react-admin';
import { CssBaseline, Typography } from '@mui/material';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEarthAmericas } from '@fortawesome/free-solid-svg-icons';
import { useNavigate } from 'react-router-dom';
import SearchBar from './components/SearchBar';

const DeploymentContext = createContext(undefined);

const BackToMainButton = () => {
    const navigate = useNavigate();
    return (
        <Button 
            variant="contained" 
            color="secondary" 
            onClick={() => navigate('/')}
            style={{ marginRight: '1rem' }}
        >
            &larr; back to main page
        </Button>
    );
};

const MyAppBar = () => {
    const { isPending } = usePermissions();
    const deployment = useContext(DeploymentContext);
    const appBarText = () => {
        if (deployment) {
            if (deployment === 'local') {
                return "⭐Local Development⭐";
            }
            if (deployment === 'dev') {
                return "⭐Development⭐";
            }
            if (deployment === 'stage') {
                return "⭐Staging⭐";
            }
        }
    };

    if (isPending) return null;

    return (
        <AppBar color="primary">
            <TitlePortal />
            <SearchBar />
            <Typography
                variant="h6"
                color="#FF69B4"
            >
                {deployment ? appBarText() : ""}&nbsp;&nbsp;
            </Typography>
            <BackToMainButton />
            <LoginButton />
        </AppBar>
    );
};

const LoginButton = () => {
    const authProvider = useAuthProvider();
    const { isPending, permissions } = usePermissions();

    const handleLoginLogout = () => {
        if (permissions) {
            authProvider.logout();
        } else {
            authProvider.login();
        }
    };

    if (isPending) return null;
    return (
        <Button variant="contained" color="secondary" onClick={handleLoginLogout}>
            {permissions ? 'Logout' : 'Login'}
        </Button>
    );
};

const MyMenu = () => {
    return (
        <Menu>
            <Menu.DashboardItem primaryText="Map" leftIcon={<FontAwesomeIcon icon={faEarthAmericas} />} />
            <Menu.ResourceItem name="areas" />
            <Menu.ResourceItem name="sites" />
            <Menu.ResourceItem name="isolates" />
            <Menu.ResourceItem name="samples" />
            <Menu.ResourceItem name="dna" />
        </Menu>
    );
};

const MyLayout = ({ children, deployment }) => {
    return (
        <DeploymentContext.Provider value={deployment}>
            <CssBaseline />
            <Layout
                appBar={MyAppBar}
                menu={MyMenu}
            >
                {children}
            </Layout>
        </DeploymentContext.Provider>
    );
};

export default MyLayout;
