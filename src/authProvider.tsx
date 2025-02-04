import { AuthProvider } from 'react-admin';
import Keycloak, { KeycloakTokenParsed } from 'keycloak-js';
import jwt_decode from 'jwt-decode';
// import { getKeycloakHeaders } from 'ra-keycloak';


export type PermissionsFunction = (decoded: KeycloakTokenParsed) => any;

/**
    * Returns an authProvider for react-admin which authenticates
    * against a Keycloak instance.
 * ```
 *
 * @param client the keycloak client
 * @param options.onPermissions function used to transform the permissions fetched from Keycloak into a permissions object in the form of what your react-admin app expects
 * @param options.loginRedirectUri URI used to override the redirect URI after successful login
 * @param options.logoutRedirectUri URI used to override the redirect URI after successful logout
 *
 * @returns an authProvider ready to be used by React-Admin.
 */
export const keycloakAuthProvider = (
    client: Keycloak,
    options: {
        onPermissions?: PermissionsFunction;
        loginRedirectUri?: string;
        logoutRedirectUri?: string;
    } = {}
): AuthProvider => ({
    async login() {
        return client.login({
            redirectUri: options.loginRedirectUri ?? window.location.origin,
        });
    },
    async logout() {
        return client.logout({
            redirectUri: options.logoutRedirectUri ?? window.location.origin,
        });
    },
    async checkError(error) {
        if (error && (error.status === 401 || error.status === 403)) {
            // Return a rejected promise so React-Admin knows it's an auth issue
            return Promise.reject();
        }
        return Promise.resolve();
    },
    async checkAuth() {
        try {
            if (!client.authenticated || !client.token) {
                // Allow public user
                return Promise.resolve();
            }

            // Check if the token is expired or needs refreshing
            const isTokenValid = await this.isTokenValid(client.token);

            if (isTokenValid) {
                // Token is valid, proceed with the request
                return Promise.resolve();
            } else {
                // Token is expired or needs refreshing, initiate token refresh
                await this.refreshToken();
                // Token refreshed successfully, proceed with the request
                return Promise.resolve();
            }
        } catch (error) {
            return Promise.reject(error);
        }
    },
    isTokenValid(token) {
        try {
            const decodedToken = jwt_decode(token);

            // Check if the token has an expiration time
            if (!decodedToken.exp) {
                return false; // Token is considered invalid if there's no expiration time
            }

            // Convert expiration time to milliseconds and compare with the current time
            const expirationTime = new Date(decodedToken.exp * 1000); // Convert seconds to milliseconds
            const currentTime = new Date(Date.now());

            return (currentTime < expirationTime);
        } catch (error) {
            return false; // Consider the token invalid in case of decoding errors
        }
    },
    async refreshToken() {
        // Update the Keycloak client with the new token
        try {
            await client.updateToken();
        } catch (error) {
            console.error('Session has expired', error);
        }
    },
    async getPermissions() {
        if (!client.token) {
            return Promise.resolve(false);
        }
        const decoded = jwt_decode<KeycloakTokenParsed>(client.token);
        return Promise.resolve(
            options.onPermissions ? options.onPermissions(decoded) : decoded
        );
    },
    async getIdentity() {

        if (client.token) {
            const decoded = jwt_decode<KeycloakTokenParsed>(client.token);
            const id = decoded.sub || '';
            const fullName = decoded.name;
            console.log('client.token', decoded);
            return Promise.resolve({ id, fullName });
        }

        // Allow public user, so return a default public user if no token
        return Promise.resolve({ id: 'public', fullName: 'Public User' });

    },
    getToken() {
        return client.token;
    }
});
