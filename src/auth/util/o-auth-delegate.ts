import {ApiConfig, ApiService} from '../../api';
import {OAuthSession} from '..';
import {AuthEndPoints} from '../def/auth-end-points';
import {SunbirdOAuthSessionProviderFactory} from './sunbird-o-auth-session-provider-factory';
import {SignInError} from '../errors/sign-in-error';
import * as qs from 'qs';

export interface StepOneCallbackType {
    code?: string;
    access_token?: string;
    refresh_token?: string;
    id?: string;
    googleRedirectUrl?: string;
    error_message?: string;
}

export interface OAuthRedirectUrlQueryParams {
    redirect_uri: string;
    error_callback?: string;
    response_type: string;
    scope: string;
    client_id: string;
    version: string;
}

export class OAuthDelegate {
    constructor(
        private apiConfig: ApiConfig,
        private apiService: ApiService
    ) {
    }

    public async doOAuthStepOne(): Promise<OAuthSession> {
        const oAuthRedirectUrlQueryParams: OAuthRedirectUrlQueryParams = {
            redirect_uri: this.apiConfig.host + '/oauth2callback',
            response_type: 'code',
            scope: 'offline_access',
            client_id: 'android',
            version: '3'
        };

        const launchUrl =
            this.apiConfig.host +
            this.apiConfig.user_authentication.authUrl +
            AuthEndPoints.LOGIN + '?' +
            qs.stringify(oAuthRedirectUrlQueryParams, {encode: false});

        const inAppBrowserRef = cordova.InAppBrowser.open(launchUrl, '_blank', 'zoom=no');

        return new Promise<OAuthSession>((resolve, reject) => {
            inAppBrowserRef.addEventListener('loadstart', (event) => {
                if (event.url) {
                    const sessionProvider = new SunbirdOAuthSessionProviderFactory(
                        this.apiConfig, this.apiService, inAppBrowserRef
                    ).fromUrl(event.url);

                    if ((event.url).indexOf('/sso/sign-in/error') !== -1) {
                        reject(new SignInError('Server Error'));
                    }

                    if (sessionProvider) {
                        resolve(sessionProvider.provide());
                    }
                }
            });
        }).catch((e) => {
            inAppBrowserRef.close();

            throw e;
        });
    }
}

