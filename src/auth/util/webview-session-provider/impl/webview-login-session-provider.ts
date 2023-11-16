import {OAuthSession, SignInError} from '../../..';
import {WebviewSessionProviderConfig} from '../../..';
import {WebviewRunner} from '../def/webview-runner';
import {WebviewRunnerImpl} from './webview-runner-impl';
import {SunbirdSdk} from '../../../../sdk';
import {WebviewAutoMergeSessionProvider} from './webview-auto-merge-session-provider';
import {WebviewBaseSessionProvider} from './webview-base-session-provider';
import {TelemetryService} from '../../../../telemetry';

interface ParamMap { [key: string]: string; }

export class WebviewLoginSessionProvider extends WebviewBaseSessionProvider {
    private readonly webviewRunner: WebviewRunner;
    private readonly telemetryService: TelemetryService;

    private resetParams: ParamMap | undefined;

    constructor(
        private loginConfig: WebviewSessionProviderConfig,
        private autoMergeConfig: WebviewSessionProviderConfig,
        private customWebViewConfig?: any,
        webviewRunner?: WebviewRunner
    ) {
        super(
            SunbirdSdk.instance.sdkConfig.apiConfig,
            SunbirdSdk.instance.apiService,
            SunbirdSdk.instance.eventsBusService
        );

        this.telemetryService = SunbirdSdk.instance.telemetryService;
        this.webviewRunner = webviewRunner || new WebviewRunnerImpl();
    }

    public async provide(): Promise<OAuthSession> {
        const dsl = this.webviewRunner;
        let devicePlatform = "";
        await window['Capacitor']['Plugins'].Device.getInfo().then((val) => {
            devicePlatform = val.platform
        })
        const telemetryContext = await this.telemetryService.buildContext().toPromise();
        if(this.loginConfig.context == "password") {
            this.loginConfig.target.path = "/recover/identify/account";
        }
        this.loginConfig.target.params.push({
           key: 'pdata',
           value: JSON.stringify(telemetryContext.pdata)
        });
        if(devicePlatform.toLowerCase() === 'ios' && this.loginConfig.context === "login") {
            await dsl.launchWebview({
                host: this.loginConfig.target.host,
                path: 'logoff',
                params: this.loginConfig.target.params.reduce((acc, p) => {
                    acc[p.key] = p.value;
                    return acc;
                }, {...this.resetParams})
            });
        }
        return dsl.launchWebview({
            host: this.loginConfig.target.host,
            path: this.loginConfig.target.path,
            params: this.loginConfig.target.params.reduce((acc, p) => {
                acc[p.key] = p.value;
                return acc;
            }, {...this.resetParams})
        }).then(() => {
            return dsl.any<OAuthSession>(
                ...this.loginConfig.return.reduce<Promise<OAuthSession>[]>((acc, forCase) => {
                    switch (forCase.type) {
                        case 'password': acc.push(
                            this.buildPasswordSessionProvider(dsl, forCase)
                        );
                        if (this.resetParams && this.loginConfig.context == "password") {
                            dsl.closeWebview()
                        } 
                        break;

                        case 'state': acc.push(
                            this.buildStateSessionProvider(dsl, forCase)
                        ); break;

                        case 'google': acc.push(
                            this.buildGoogleSessionProvider(dsl, forCase, this.customWebViewConfig)
                        ); break;

                        case 'state-error': acc.push(dsl.capture({
                            host: forCase.when.host,
                            path: forCase.when.path,
                            params: forCase.when.params
                        }).then(() => {
                            return dsl.closeWebview().then(() => {
                                return dsl.resolveCaptured('error_message').catch(() => {
                                    throw new SignInError('Server Error');
                                }).then((param) => {
                                    throw new SignInError(param);
                                });
                            });
                        })); break;

                        case 'migrate': acc.push(dsl.capture({
                            host: forCase.when.host,
                            path: forCase.when.path,
                            params: forCase.when.params
                        }).then(() =>
                            dsl.success()
                        ).then((captured) => {
                            dsl.resetInAppBrowserEventListeners();

                            return dsl.clearCapture().then(() =>
                                new WebviewAutoMergeSessionProvider(
                                    this.autoMergeConfig,
                                    this.webviewRunner,
                                    captured
                                ).provide()
                            );
                        })); break;

                        case 'reset': acc.push(dsl.capture({
                            host: forCase.when.host,
                            path: forCase.when.path,
                            params: [
                                ...forCase.when.params,
                                {
                                    key: 'client_id',
                                    resolveTo: 'client_id',
                                    match: 'portal'
                                },
                                {
                                    key: 'automerge',
                                    resolveTo: 'automerge',
                                    exists: 'false'
                                }
                            ]
                        }).then(() =>
                            dsl.getCaptureExtras().then((extras) => {
                                this.resetParams = extras;

                                return dsl.closeWebview().then(() =>
                                    new Promise((resolve) => setTimeout(resolve, 500))
                                        .then(() => this.provide())
                                );
                            })
                        )); break;
                    }

                    return acc;
                }, []),
            );
        });
    }
}
