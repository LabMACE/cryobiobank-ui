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
import PublicIcon from '@mui/icons-material/Public';

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
            <LoginButton  />

        </AppBar>
    )
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


const MyMenu = (props) => {
    // const { isPending, permissions } = usePermissions();
    // if (isPending) return null;
    return (
        <Menu>
            <Menu.DashboardItem primaryText="Map" leftIcon={<PublicIcon/>}/>
            {/* {permissions === 'admin' ? (
                <> */}
                    <Menu.ResourceItem name="sites" />
                    <Menu.ResourceItem name="isolates" />
                    <Menu.ResourceItem name="samples" />
                    <Menu.ResourceItem name="dna" />
                {/* </> */}
        {/* ) : null} */}
        </Menu>
)};

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
    )
};

export default MyLayout;
