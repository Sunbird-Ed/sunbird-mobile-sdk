import {ApiConfig, ApiService, HttpRequestType, Request} from '../../api';
import {OAuthSession, SignInError} from '..';
import {SunbirdOAuthSessionProviderFactory} from './sunbird-o-auth-session-provider-factory';
import {SunbirdError} from '../../sunbird-error';
import * as qs from 'qs';
import {InAppBrowserExitError} from "../errors/in-app-browser-exit-error";
import {EventNamespace, EventsBusService} from "../../events-bus";
import {AuthEventType} from "..";
import {AuthEndPoints} from "../def/auth-end-points";

export interface StepOneCallbackType {
    code?: string;
    access_token?: string;
    refresh_token?: string;
    id?: string;
    googleRedirectUrl?: string;
    error_message?: string;
    automerge?: string;
    payload?: string;
}

export interface OAuthRedirectUrlQueryParams {
    redirect_uri: string;
    error_callback?: string;
    response_type: string;
    scope: string;
    client_id: string;
    version: string;
    goBackUrl?: string;
    merge_account_process?: string;
    mergeaccountprocess?: string;
}

export class ForgotPasswordFlowDetectedError extends SunbirdError {
    constructor(message: string) {
        super(message, 'FORGOT_PASSWORD_FLOW_DETECTED');

        Object.setPrototypeOf(this, ForgotPasswordFlowDetectedError.prototype);
    }
}

export class OAuthDelegate {
    private autoMergeContext?: { payload: { iv: string, encryptedData: string } };

    constructor(
        private apiConfig: ApiConfig,
        private apiService: ApiService,
        private eventsBusService: EventsBusService,
        private mode: 'default' | 'merge'
    ) {
    }

    get exitUrl(): string {
        return this.mode === 'merge' ?
            this.apiConfig.user_authentication.mergeUserHost + '/?exit=1' :
            this.apiConfig.host + '/?exit=1';
    }

    public buildLaunchUrl(): string {
        const oAuthRedirectUrlQueryParams: OAuthRedirectUrlQueryParams = {
            redirect_uri: this.apiConfig.host + '/oauth2callback',
            response_type: 'code',
            scope: 'offline_access',
            client_id: 'android',
            version: '4',
            ...( this.mode === 'merge' ? {
                merge_account_process: '1',
                mergeaccountprocess: '1',
                goBackUrl: this.exitUrl
            } : {} )
        };

        return (this.mode === 'default' ? this.apiConfig.host : this.apiConfig.user_authentication.mergeUserHost) +
          this.apiConfig.user_authentication.authUrl +
          AuthEndPoints.LOGIN + '?' +
          qs.stringify(oAuthRedirectUrlQueryParams, {encode: false})
    }

    public async doOAuthStepOne(): Promise<OAuthSession> {
        if (this.autoMergeContext) {
            this.autoMergeContext = undefined;
        }

        const launchUrl = this.buildLaunchUrl();
        const options = 'zoom=no,clearcache=yes,clearsessioncache=yes,cleardata=yes,beforeload=yes';
        const inAppBrowserRef = cordova.InAppBrowser.open(launchUrl, '_blank', options);

        return new Promise<OAuthSession>((resolve, reject) => {
            inAppBrowserRef.addEventListener('loadstart', (event) => {
                if (event.url) {
                    this.captureAutoMergeContext(inAppBrowserRef, event.url);

                    const sessionProvider = new SunbirdOAuthSessionProviderFactory(
                        this.apiConfig, this.apiService, inAppBrowserRef
                    ).fromUrl(event.url);

                    if ((event.url).indexOf('/sso/sign-in/error') !== -1) {
                        reject(new SignInError('Server Error'));
                    }

                    if (!this.autoMergeContext) {
                        if ((event.url).indexOf('/resources') !== -1 || (event.url).indexOf('client_id=portal') !== -1) {
                            reject(new ForgotPasswordFlowDetectedError('Detected "Forgot Password" flow completion'));
                        }
                    }

                    if (event.url === this.exitUrl) {
                        reject(new InAppBrowserExitError('EXIT'));
                    }

                    if (sessionProvider) {
                        if (this.autoMergeContext) {
                            return resolve(
                                sessionProvider.provide().then(async (session) => {
                                    try {
                                        await this.performAutoMerge({
                                            payload: this.autoMergeContext!.payload,
                                            nonStateUserToken: session.access_token
                                        });

                                        this.eventsBusService.emit({
                                            namespace: EventNamespace.AUTH,
                                            event: {
                                                type: AuthEventType.AUTO_MIGRATE_SUCCESS,
                                                payload: undefined
                                            }
                                        });
                                    } catch (e) {
                                        console.error(e);

                                        this.eventsBusService.emit({
                                            namespace: EventNamespace.AUTH,
                                            event: {
                                                type: AuthEventType.AUTO_MIGRATE_SUCCESS,
                                                payload: undefined
                                            }
                                        });
                                    }

                                    this.autoMergeContext = undefined;
                                    return session;
                                })
                            )
                        }

                        resolve(sessionProvider.provide());
                    }
                }
            });
        }).catch((e) => {
            if (e instanceof ForgotPasswordFlowDetectedError) {
                inAppBrowserRef.close();

                const delay = 500;

                return new Promise((resolve) => setTimeout(resolve, delay))
                  .then(() => this.doOAuthStepOne())
            }

            inAppBrowserRef.close();

            throw e;
        });
    }

    private captureAutoMergeContext(inAppBrowserRef: InAppBrowserSession, url: string) {
        const host = url.substring(0, url.indexOf('?'));
        const params = qs.parse(url.substring(url.indexOf('?') + 1));

        if (params.automerge === '1' && params.payload) {
            this.autoMergeContext = { payload: JSON.parse(params.payload) };

            if (params.client_id === 'portal') {
                params.client_id = 'android';
                params.redirect_uri = this.apiConfig.host + '/oauth2callback';

                inAppBrowserRef.executeScript({
                    code: `(() => {
                        window.location.href = ` + "`" + `${host + '?' + qs.stringify(params)}` + "`" + `;
                    })()`
                });
            }
        }
    }

    private performAutoMerge({ payload, nonStateUserToken }): Promise<undefined> {
        const apiRequest = new Request.Builder()
            .withType(HttpRequestType.GET)
            .withPath(this.apiConfig.user_authentication.autoMergeApiPath)
            .withParameters({
                client_id: 'android'
            })
            .withHeaders({
                'x-authenticated-user-token': nonStateUserToken,
                'x-authenticated-user-data': JSON.stringify(payload)
            })
            .build();

        return this.apiService.fetch(apiRequest).mapTo(undefined).toPromise();
    }
}

