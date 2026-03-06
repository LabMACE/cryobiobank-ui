/* eslint react/jsx-key: off */
import { useState, useRef, useEffect } from 'react';
import { Admin, Resource, AuthProvider, DataProvider } from 'react-admin';
import simpleRestProvider from './dataProvider/index'
import Keycloak, { KeycloakTokenParsed, KeycloakInitOptions, } from 'keycloak-js';
import { httpClient } from 'ra-keycloak';
import { keycloakAuthProvider } from './authProvider';
import sites from './sites';
import isolates from './isolates';
import samples from './samples';
import site_replicates from './sites/replicates';
import dna from './dna';
import areas from './areas';
import axios from 'axios';
import Dashboard from './Dashboard';
import MyLayout from './Layout';

const initOptions: KeycloakInitOptions = {
    onLoad: 'login-required', // Force authentication for admin access
    checkLoginIframe: false,
};

const getPermissions = (decoded: KeycloakTokenParsed) => {
    const roles = decoded?.realm_access?.roles;
    if (!roles) {
        return false;
    }
    if (roles.includes('admin')) return 'admin';
    if (roles.includes('user')) return 'user';
    return false;
};

const UIConfigUrl = '/api/config';
export const apiUrl = '/api/admin';

const App = () => {
    const [keycloak, setKeycloak] = useState();
    const initializingPromise = useRef<Promise<Keycloak>>(undefined);
    const authProvider = useRef<AuthProvider>();
    const dataProvider = useRef<DataProvider>();
    const [deployment, setDeployment] = useState(undefined);
    const [initError, setInitError] = useState<string | null>(null);

    useEffect(() => {
        const initKeyCloakClient = async () => {
            try {
                const response = await axios.get(UIConfigUrl);
                const keycloakConfig = response.data.keycloak;
                setDeployment(response.data.deployment);

                // Initialize Keycloak here, once you have the configuration
                const keycloakClient = new Keycloak({
                    url: keycloakConfig.url,
                    realm: keycloakConfig.realm,
                    clientId: keycloakConfig.client_id,
                });
                await keycloakClient.init(initOptions);

                authProvider.current = keycloakAuthProvider(keycloakClient, {
                    onPermissions: getPermissions,
                    loginRedirectUri: window.location.origin + '/admin',
                    logoutRedirectUri: window.location.origin + '/admin',
                });
                dataProvider.current = simpleRestProvider(
                    apiUrl,
                    httpClient(keycloakClient)
                );
                return keycloakClient;
            } catch (error) {
                console.error('Failed to initialize authentication:', error);
                setInitError('Failed to initialize authentication. Please check your network connection and try again.');
                throw error;
            }
        };

        if (!initializingPromise.current) {
            initializingPromise.current = initKeyCloakClient();
        }

        initializingPromise.current
            .then(keycloakClient => {
                setKeycloak(keycloakClient);
            })
            .catch(error => {
                console.error('Authentication initialization failed:', error);
            });
    }, [keycloak]);

    if (initError) return (
        <div style={{ 
            display: 'flex', 
            justifyContent: 'center', 
            alignItems: 'center', 
            height: '100vh',
            flexDirection: 'column',
            fontSize: '18px',
            color: '#d32f2f',
            textAlign: 'center',
            padding: '20px'
        }}>
            <p>Authentication Error</p>
            <p style={{ fontSize: '14px', marginTop: '10px', color: '#666', maxWidth: '400px' }}>
                {initError}
            </p>
            <button 
                onClick={() => window.location.reload()} 
                style={{
                    marginTop: '20px',
                    padding: '10px 20px',
                    backgroundColor: '#2E7D87',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer'
                }}
            >
                Retry
            </button>
        </div>
    );

    if (!keycloak) return (
        <div style={{ 
            display: 'flex', 
            justifyContent: 'center', 
            alignItems: 'center', 
            height: '100vh',
            flexDirection: 'column',
            fontSize: '18px',
            color: '#666'
        }}>
            <p>Loading CryoBioBank Admin...</p>
            <p style={{ fontSize: '14px', marginTop: '10px', color: '#999' }}>
                Initializing authentication...
            </p>
        </div>
    );
    return (
        <Admin
            authProvider={authProvider.current}
            dataProvider={dataProvider.current}
            title="CryoBioBank"
            dashboard={Dashboard}
            layout={(props) => <MyLayout {...props} deployment={deployment} />}
            mutationMode="pessimistic"
        >
            {/* 
                The resource mapping by permissions is done in the Menu 
                component in the <MyLayout/> definition 
            */}
            <Resource name="areas" {...areas} recordRepresentation="name" />
            <Resource name="sites" {...sites} recordRepresentation="name" />
            <Resource name="site_replicates" {...site_replicates} recordRepresentation="name" />
            <Resource name="isolates" {...isolates} recordRepresentation="name" />
            <Resource name="samples" {...samples} recordRepresentation="name" />
            <Resource name="dna" {...dna} recordRepresentation="name" />
        </Admin>
    );
};
export default App;
