// in src/admin/index.tsx
import React, { useState, useRef, useEffect } from 'react';
import { Admin, Resource, ListGuesser } from "react-admin";
import jsonServerProvider from "ra-data-json-server";
import simpleRestProvider from 'ra-data-simple-rest';
import Keycloak, {
    KeycloakConfig,
    KeycloakTokenParsed,
    KeycloakInitOptions,
} from 'keycloak-js';
import { keycloakAuthProvider, httpClient } from 'ra-keycloak';


// const config: KeycloakConfig = {
//     url: '$KEYCLOAK_URL',
//     realm: '$KEYCLOAK_REALM',
//     clientId: '$KEYCLOAK_CLIENT_ID',
// };
const config: KeycloakConfig = {
    url: 'https://enac-it-sso.epfl.ch/',
    realm: 'MACE',
    clientId: "3f0b4510-e066-474f-8df3-f376af976947",
};

// here you can set options for the keycloak client
const initOptions: KeycloakInitOptions = { onLoad: 'login-required' };
const getPermissions = (decoded: KeycloakTokenParsed) => {
    const roles = decoded?.realm_access?.roles;
    console.log('roles', roles);
    if (!roles) {
        return false;
    }
    if (roles.includes('admin')) return 'admin';
    if (roles.includes('user')) return 'user';
    return false;
};
const raKeycloakOptions = {
    onPermissions: getPermissions,
};


const App = () => {
    const [keycloak, setKeycloak] = useState<Keycloak>(undefined);
    const initializingPromise = useRef<Promise<Keycloak>>(undefined);
    const authProvider = useRef<AuthProvider>(undefined);
    const dataProvider = useRef<DataProvider>(undefined);

    useEffect(() => {
        const initKeyCloakClient = async () => {
            const keycloakClient = new Keycloak(config);
            await keycloakClient.init(initOptions);
            authProvider.current = keycloakAuthProvider(keycloakClient, {
                onPermissions: getPermissions,
            });
            dataProvider.current = keyCloakTokenDataProviderBuilder(
                myDataProvider,
                keycloakClient
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

    // hide the admin until the dataProvider and authProvider are ready
    if (!keycloak) return <p>Loading...</p>;

    return (
        Hello!
        // <Admin
        //     authProvider={authProvider.current}
        //     dataProvider={dataProvider.current}
        //     title="CryoBioBank"
        // >
        //     <Resource name="posts" list={ListGuesser} />
        //     {permissions === 'admin' ? (
        //         <Resource name="comments" list={ListGuesser} />
        //     ) : null}
        // </Admin >
    );
};

export default App;