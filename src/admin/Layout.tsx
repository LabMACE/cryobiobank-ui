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

const MyAppBar = (props) => {
    const { isPending, permissions } = usePermissions();
    const appBarText = () => {
        if (props.deployment) {
            if (props.deployment === 'local') {
                return "⭐Local Development⭐";
            }
            if (props.deployment === 'dev') {
                return "⭐Development⭐";
            }
            if (props.deployment === 'stage') {
                return "⭐Staging⭐";
            }
        }
    };

    if (isPending) return null;

    return (
        <AppBar color="primary">
            <TitlePortal />
            <Typography
                variant="h6"
                color="#FF69B4"
                id="react-admin-title"
            >
                {props.deployment ? appBarText() : ""}&nbsp;&nbsp;
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
        <>
            <CssBaseline />
            <Layout
                appBar={() => <MyAppBar deployment={deployment} />}
                menu={MyMenu}
            >
                {children}
            </Layout>
        </>
    );
};

export default MyLayout;
