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
    // onLoad: 'login-required',
    // checkLoginIframe: false,
    onLoad: 'check-sso',
    // or omit onLoad entirely for a pure "do nothing" init
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
export const apiUrl = '/api';

const App = () => {
    const [keycloak, setKeycloak] = useState();
    const initializingPromise = useRef<Promise<Keycloak>>(undefined);
    const authProvider = useRef<AuthProvider>();
    const dataProvider = useRef<DataProvider>();
    const [deployment, setDeployment] = useState(undefined);

    useEffect(() => {
        const initKeyCloakClient = async () => {
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
            });
            dataProvider.current = simpleRestProvider(
                apiUrl,
                httpClient(keycloakClient)
            );
            return keycloakClient;
        };

        if (!initializingPromise.current) {
            initializingPromise.current = initKeyCloakClient();
        }

        initializingPromise.current.then(keycloakClient => {
            setKeycloak(keycloakClient);
        });
    }, [keycloak]);

    if (!keycloak) return <p>Loading...</p>;
    return (
        <Admin
            authProvider={authProvider.current}
            dataProvider={dataProvider.current}
            title="CryoBioBank"
            dashboard={Dashboard}
            layout={(props) => <MyLayout {...props} deployment={deployment} />}
        >
            {/* 
                The resource mapping by permissions is done in the Menu 
                component in the <MyLayout/> definition 
            */}
            <Resource name="areas" {...areas} />
            <Resource name="sites" {...sites} />
            <Resource name="site_replicates" {...site_replicates} />
            <Resource name="isolates" {...isolates} />
            <Resource name="samples" {...samples} />
            <Resource name="dna" {...dna} />
        </Admin>
    );
};
export default App;
