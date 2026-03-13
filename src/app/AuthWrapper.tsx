import React from 'react';
import Cookies from 'js-cookie';
import ChunkLoader from '@/components/loader/chunk-loader';
import { generateDerivApiInstance } from '@/external/bot-skeleton/services/api/appId';
import { observer as globalObserver } from '@/external/bot-skeleton/utils/observer';
import { useOfflineDetection } from '@/hooks/useOfflineDetection';
import { clearAuthData } from '@/utils/auth-utils';
import { localize } from '@deriv-com/translations';
import { URLUtils } from '@deriv-com/utils';
import App from './App';

// Extend Window interface to include is_tmb_enabled property
declare global {
    interface Window {
        is_tmb_enabled?: boolean;
    }
}

const setLocalStorageToken = async (
    loginInfo: URLUtils.LoginInfo[],
    paramsToDelete: string[],
    setIsAuthComplete: React.Dispatch<React.SetStateAction<boolean>>,
    isOnline: boolean
) => {
    if (loginInfo.length) {
        try {
            const defaultActiveAccount = URLUtils.getDefaultActiveAccount(loginInfo);
            if (!defaultActiveAccount) return;

            const accountsList: Record<string, string> = {};
            const clientAccounts: Record<string, { loginid: string; token: string; currency: string }> = {};

            loginInfo.forEach((account: { loginid: string; token: string; currency: string }) => {
                accountsList[account.loginid] = account.token;
                clientAccounts[account.loginid] = account;
            });

            localStorage.setItem('accountsList', JSON.stringify(accountsList));
            localStorage.setItem('clientAccounts', JSON.stringify(clientAccounts));

            URLUtils.filterSearchParams(paramsToDelete);

            // Skip API connection when offline
            if (!isOnline) {
                console.log('[Auth] Offline mode - skipping API connection');
                localStorage.setItem('authToken', loginInfo[0].token);
                localStorage.setItem('active_loginid', loginInfo[0].loginid);
                return;
            }

            try {
                const api = await generateDerivApiInstance();

                if (api) {
                    const { authorize, error } = await api.authorize(loginInfo[0].token);
                    api.disconnect();
                    if (error) {
                        // Check if the error is due to an invalid token
                        if (error.code === 'InvalidToken') {
                            // Set isAuthComplete to true to prevent the app from getting stuck in loading state
                            setIsAuthComplete(true);

                            const is_tmb_enabled = window.is_tmb_enabled === true;
                            // Only emit the InvalidToken event if logged_state is true
                            if (Cookies.get('logged_state') === 'true' && !is_tmb_enabled) {
                                // Emit an event that can be caught by the application to retrigger OIDC authentication
                                globalObserver.emit('InvalidToken', { error });
                            }

                            if (Cookies.get('logged_state') === 'false') {
                                // If the user is not logged out, we need to clear the local storage
                                clearAuthData();
                            }
                        }
                    } else {
                        localStorage.setItem('client.country', authorize.country);
                        const firstId = authorize?.account_list[0]?.loginid;
                        const filteredTokens = loginInfo.filter(token => token.loginid === firstId);
                        if (filteredTokens.length) {
                            localStorage.setItem('authToken', filteredTokens[0].token);
                            localStorage.setItem('active_loginid', filteredTokens[0].loginid);
                            return;
                        }
                    }
                }
            } catch (apiError) {
                console.error('[Auth] API connection error:', apiError);
                // Still set token in offline mode
                localStorage.setItem('authToken', loginInfo[0].token);
                localStorage.setItem('active_loginid', loginInfo[0].loginid);
            }

            localStorage.setItem('authToken', loginInfo[0].token);
            localStorage.setItem('active_loginid', loginInfo[0].loginid);
        } catch (error) {
            console.error('Error setting up login info:', error);
        }
    }
};

const getAccessTokenFromHash = () => {
    const hash = window.location.hash;
    if (!hash || hash.length < 2) return null;

    const hash_params = new URLSearchParams(hash.startsWith('#') ? hash.slice(1) : hash);
    const access_token = hash_params.get('access_token');
    if (!access_token) return null;

    hash_params.delete('access_token');
    hash_params.delete('token_type');
    hash_params.delete('expires_in');

    const next_hash = hash_params.toString();
    window.history.replaceState(
        null,
        '',
        `${window.location.pathname}${window.location.search}${next_hash ? `#${next_hash}` : ''}`
    );

    return access_token;
};

const setLocalStorageTokenFromAccessToken = async (
    access_token: string,
    setIsAuthComplete: React.Dispatch<React.SetStateAction<boolean>>,
    isOnline: boolean
) => {
    try {
        localStorage.setItem('authToken', access_token);

        if (!isOnline) {
            console.log('[Auth] Offline mode - storing OAuth access token only');
            return;
        }

        const api = await generateDerivApiInstance();
        if (!api) return;

        const { authorize, error } = await api.authorize(access_token);
        api.disconnect();

        if (error) {
            if (error.code === 'InvalidToken') {
                setIsAuthComplete(true);

                const is_tmb_enabled = window.is_tmb_enabled === true;
                if (Cookies.get('logged_state') === 'true' && !is_tmb_enabled) {
                    globalObserver.emit('InvalidToken', { error });
                }

                if (Cookies.get('logged_state') === 'false') {
                    clearAuthData();
                }
            }
            return;
        }

        if (authorize?.country) localStorage.setItem('client.country', authorize.country);

        const loginid = authorize?.loginid || authorize?.account_list?.[0]?.loginid;
        if (!loginid) return;

        localStorage.setItem('active_loginid', loginid);

        const accountsList: Record<string, string> = { [loginid]: access_token };
        const clientAccounts: Record<string, { loginid: string; token: string; currency: string }> = {
            [loginid]: {
                loginid,
                token: access_token,
                currency: authorize?.currency || '',
            },
        };

        localStorage.setItem('accountsList', JSON.stringify(accountsList));
        localStorage.setItem('clientAccounts', JSON.stringify(clientAccounts));
    } catch (e) {
        console.error('[Auth] Error handling OAuth access token:', e);
    }
};

export const AuthWrapper = () => {
    const [isAuthComplete, setIsAuthComplete] = React.useState(false);
    const { loginInfo, paramsToDelete } = URLUtils.getLoginInfoFromURL();
    const { isOnline } = useOfflineDetection();

    React.useEffect(() => {
        const initializeAuth = async () => {
            try {
                const access_token = getAccessTokenFromHash();
                if (access_token) {
                    await setLocalStorageTokenFromAccessToken(access_token, setIsAuthComplete, isOnline);
                    URLUtils.filterSearchParams(['lang']);
                    setIsAuthComplete(true);
                    return;
                }

                // Pass isOnline to setLocalStorageToken to handle offline mode properly
                await setLocalStorageToken(loginInfo, paramsToDelete, setIsAuthComplete, isOnline);
                URLUtils.filterSearchParams(['lang']);
                setIsAuthComplete(true);
            } catch (error) {
                console.error('[Auth] Authentication initialization failed:', error);
                // Don't block the app if auth fails, especially when offline
                setIsAuthComplete(true);
            }
        };

        // If offline, set auth complete immediately but still run initializeAuth
        // to save login info to localStorage for offline use
        if (!isOnline) {
            console.log('[Auth] Offline detected, proceeding with minimal auth');
            setIsAuthComplete(true);
        }

        initializeAuth();
    }, [loginInfo, paramsToDelete, isOnline]);

    // Add timeout for offline scenarios to prevent infinite loading
    React.useEffect(() => {
        if (!isOnline && !isAuthComplete) {
            console.log('[Auth] Offline detected, setting auth timeout');
            const timeout = setTimeout(() => {
                console.log('[Auth] Offline timeout reached, proceeding without full auth');
                setIsAuthComplete(true);
            }, 2000); // 2 second timeout for offline

            return () => clearTimeout(timeout);
        }
    }, [isOnline, isAuthComplete]);

    const getLoadingMessage = () => {
        if (!isOnline) return localize('Loading offline mode...');
        return localize('Initializing...');
    };

    if (!isAuthComplete) {
        return <ChunkLoader message={getLoadingMessage()} />;
    }

    return <App />;
};
