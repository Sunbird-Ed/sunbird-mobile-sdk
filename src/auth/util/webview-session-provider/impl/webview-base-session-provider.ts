import {ApiConfig, ApiService, HttpRequestType, HttpSerializer, Request, Response} from '../../../../api';
import * as qs from 'qs';
import {EventsBusService} from '../../../../events-bus';
import {SessionProvider} from '../../../def/session-provider';
import {OAuthSession} from '../../../def/o-auth-session';
import {SignInError} from '../../../errors/sign-in-error';
import { JwtUtil } from '../../../../util/jwt-util';

export abstract class WebviewBaseSessionProvider implements SessionProvider {
    private static async parseAccessToken(accessToken: string): Promise<{
        userToken: string;
        accessTokenExpiresOn: number;
    }> {
        let playload = await JwtUtil.decodeJWT(accessToken);
        const payload: { sub: string, exp: number } = JSON.parse(playload);
        return {
            userToken: payload.sub.split(':').length === 3 ? <string>payload.sub.split(':').pop() : payload.sub,
            accessTokenExpiresOn: payload.exp * 1000
        };
    }

    protected constructor(
        protected apiConfig: ApiConfig,
        protected apiService: ApiService,
        protected eventsBusService: EventsBusService
    ) {
    }

    abstract provide(): Promise<OAuthSession>;

    protected buildGoogleTargetUrl(captured: {[key: string]: string}, extras: {[key: string]: string}): URL {
        const url = new URL(captured['googleRedirectUrl']);

        delete extras['redirect_uri'];
        url.searchParams.set('redirect_uri', this.apiConfig.user_authentication.redirectUrl);
        delete extras['error_callback'];
        url.searchParams.set('error_callback', this.apiConfig.user_authentication.redirectUrl);

        Object.keys(extras).forEach(key => url.searchParams.set(key, extras[key]));

        return url;
    }

    protected buildPasswordSessionProvider(dsl, forCase) {
        return dsl.capture({
            host: forCase.when.host,
            path: forCase.when.path,
            params: forCase.when.params
        }).then(() =>
            dsl.closeWebview()
        ).then(() =>
            dsl.success()
        ).then((captured) => {
            return this.resolvePasswordSession(captured);
        });
    }

    protected buildStateSessionProvider(dsl, forCase) {
        return dsl.capture({
            host: forCase.when.host,
            path: forCase.when.path,
            params: forCase.when.params
        }).then(() =>
            dsl.closeWebview()
        ).then(() =>
            dsl.success()
        ).then((captured) => {
            return this.resolveStateSession(captured);
        });
    }

    protected buildGoogleSessionProvider(dsl, forCase, customBrowserConfig?) {
        return dsl.capture({
            host: forCase.when.host,
            path: forCase.when.path,
            params: forCase.when.params
        }).then(() =>
            dsl.closeWebview()
        ).then(() =>
            dsl.success()
        ).then((captured) =>
            dsl.getCaptureExtras().then((extras) => {
                const url = this.buildGoogleTargetUrl(captured, extras);

                return dsl.launchCustomTab({
                    host: url.origin,
                    path: url.pathname,
                    params: qs.parse(url.searchParams.toString(), {ignoreQueryPrefix: true}),
                    extraParams: customBrowserConfig.get('extraParam')
                }).then(() =>
                    dsl.success()
                ).then((cap) => {
                    return this.resolveGoogleSession(cap);
                });
            })
        );
    }

    private resolvePasswordSession(captured: {[key: string]: string}): Promise<OAuthSession> {
        const apiRequest: Request = new Request.Builder()
            .withType(HttpRequestType.POST)
            .withPath(this.apiConfig.user_authentication.authUrl + '/token')
            .withBody({
                redirect_uri: this.apiConfig.host + '/oauth2callback',
                code: captured['code'],
                grant_type: 'authorization_code',
                client_id: 'android'
            })
            .withHeaders({
                'Content-Type': 'application/x-www-form-urlencoded'
            })
            .withSerializer(HttpSerializer.URLENCODED)
            .withBearerToken(false)
            .withUserToken(false)
            .build();

        return this.apiService.fetch(apiRequest)
            .toPromise()
            .then(async (response: Response<{ access_token: string, refresh_token: string }>) => {
                if (response.body.access_token && response.body.refresh_token) {
                    const {userToken, accessTokenExpiresOn} = await WebviewBaseSessionProvider.parseAccessToken(response.body.access_token);

                    return {
                        access_token: response.body.access_token,
                        refresh_token: response.body.refresh_token,
                        accessTokenExpiresOn,
                        userToken
                    };
                }

                throw new SignInError('Server Error');
            }).catch(() => {
                throw new SignInError('Server Error');
            });
    }

    private resolveStateSession(captured: {[key: string]: string}): Promise<OAuthSession> {
        const apiUrl="/v1/sso/create/session?id="
        let params = window.device.platform.toLowerCase() ==='ios' ? encodeURIComponent(captured.id) :captured['id'];
        const completeUrl = apiUrl + params;
        const apiRequest: Request = new Request.Builder()
            .withType(HttpRequestType.GET)
            .withPath(completeUrl)
            .withUserToken(false)
            .withBearerToken(false)
            .build();

        return this.apiService.fetch(apiRequest)
            .toPromise()
            .then(async (response: Response<{ access_token: string, refresh_token: string }>) => {
                if (response.body.access_token && response.body.refresh_token) {
                    const {userToken, accessTokenExpiresOn} = await WebviewBaseSessionProvider.parseAccessToken(response.body.access_token);

                    return {
                        access_token: response.body.access_token,
                        refresh_token: response.body.refresh_token,
                        accessTokenExpiresOn,
                        userToken
                    };
                }

                throw new SignInError('Server Error');
            })
            .catch(() => {
                throw new SignInError('Server Error');
            });
    }

    private async resolveGoogleSession(captured: {[key: string]: string}): Promise<OAuthSession> {
        if (captured['access_token'] && captured['refresh_token']) {
            const {userToken, accessTokenExpiresOn} = await WebviewBaseSessionProvider.parseAccessToken(captured['access_token']);

            return {
                access_token: captured['access_token'],
                refresh_token: captured['refresh_token'],
                accessTokenExpiresOn,
                userToken
            };
        } else if (captured['error_message']) {
            throw new SignInError(captured['error_message']);
        }

        throw new SignInError('Server Error');
    }
}
