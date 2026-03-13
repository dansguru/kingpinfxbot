import { generateDerivApiInstance } from '@/external/bot-skeleton/services/api/appId';
import { Button } from '@deriv-com/ui';
import React from 'react';
import { DERIV_AUTH_ORIGIN, getDerivAuthRedirectUri, getOAuthClientId } from '@/components/shared/utils/config/config';

const CallbackPage = () => {
    const [error, setError] = React.useState<string | null>(null);

    React.useEffect(() => {
        const run = async () => {
            try {
                const url_params = new URLSearchParams(window.location.search);
                const oauth_error = url_params.get('error');
                const oauth_error_description = url_params.get('error_description');
                if (oauth_error) {
                    setError(`${oauth_error}: ${oauth_error_description || 'Login failed.'}`);
                    return;
                }

                const code = url_params.get('code');
                const state = url_params.get('state');

                if (!code) {
                    setError('Missing authorization code.');
                    return;
                }

                const stored_state = sessionStorage.getItem('kp.oauth_state');
                if (stored_state && state && stored_state !== state) {
                    setError('Invalid login state. Please try again.');
                    return;
                }

                const code_verifier = sessionStorage.getItem('kp.oauth_code_verifier');
                if (!code_verifier) {
                    setError('Missing PKCE verifier. Please try logging in again.');
                    return;
                }

                const state_payload_raw = sessionStorage.getItem('kp.oauth_state_payload');
                const state_payload = state_payload_raw ? (JSON.parse(state_payload_raw) as { account?: string }) : null;

                const body = new URLSearchParams();
                body.set('grant_type', 'authorization_code');
                body.set('client_id', getOAuthClientId());
                body.set('redirect_uri', getDerivAuthRedirectUri());
                body.set('code_verifier', code_verifier);
                body.set('code', code);

                const token_res = await fetch(`${DERIV_AUTH_ORIGIN}/oauth2/token`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded',
                        Accept: 'application/json',
                    },
                    body: body.toString(),
                });

                if (!token_res.ok) {
                    const text = await token_res.text();
                    setError(`Token exchange failed (${token_res.status}). ${text}`);
                    return;
                }

                const token_json = (await token_res.json()) as {
                    access_token?: string;
                    expires_in?: number;
                    token_type?: string;
                };

                const access_token = token_json.access_token;
                if (!access_token) {
                    setError('Token exchange succeeded but no access_token was returned.');
                    return;
                }

                // Store token for API usage
                localStorage.setItem('authToken', access_token);

                // Try to authorize immediately to resolve loginid/currency
                let selected_currency = state_payload?.account || 'USD';
                try {
                    const api = await generateDerivApiInstance();
                    if (api) {
                        const { authorize, error: auth_error } = await api.authorize(access_token);
                        api.disconnect();
                        if (!auth_error && authorize) {
                            if (authorize.country) localStorage.setItem('client.country', authorize.country);
                            if (authorize.loginid) localStorage.setItem('active_loginid', authorize.loginid);
                            if (authorize.currency) selected_currency = authorize.currency;
                        }
                    }
                } catch (e) {
                    // Non-fatal: app will re-authorize later.
                    console.error(e);
                }

                // Cleanup one-time PKCE items
                sessionStorage.removeItem('kp.oauth_code_verifier');
                sessionStorage.removeItem('kp.oauth_state');
                sessionStorage.removeItem('kp.oauth_state_payload');

                // Preserve prior behavior: go to bot route with account query
                window.location.replace(window.location.origin + `bot/?account=${selected_currency}`);
            } catch (e) {
                console.error(e);
                setError('Unexpected error during login callback. Please try again.');
            }
        };

        run();
    }, []);

    return (
        <div style={{ padding: '2.4rem' }}>
            {error ? (
                <>
                    <p>{error}</p>
                    <Button
                        className='callback-return-button'
                        onClick={() => {
                            window.location.href = '/';
                        }}
                    >
                        {'Return to Bot'}
                    </Button>
                </>
            ) : (
                <p>{'Completing login…'}</p>
            )}
        </div>
    );
};

export default CallbackPage;
