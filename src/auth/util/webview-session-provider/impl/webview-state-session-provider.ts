import {WebviewBaseSessionProvider} from './webview-base-session-provider';
import {OAuthSession} from '../../../def/o-auth-session';
import {WebviewRunner} from '../def/webview-runner';
import {TelemetryService} from '../../../../telemetry';
import {SunbirdSdk} from '../../../../sdk';
import {WebviewRunnerImpl} from './webview-runner-impl';
import {WebviewStateSessionProviderConfig} from '../def/webview-state-session-provider-config';
import {SignInError} from '../../../errors/sign-in-error';
import {WebviewAutoMergeSessionProvider} from './webview-auto-merge-session-provider';
import {WebviewSessionProviderConfig} from '../def/webview-session-provider-config';

interface ParamMap {
    [key: string]: string;
}

export class WebviewStateSessionProvider extends WebviewBaseSessionProvider {
    private readonly webViewRunner: WebviewRunner;
    private readonly telemetryService: TelemetryService;
    private resetParams: ParamMap | undefined;

    constructor(
        private stateSessionConfig: WebviewStateSessionProviderConfig,
        private autoMergeConfig: WebviewSessionProviderConfig,
        webviewRunner?: WebviewRunner
    ) {
        super(
            SunbirdSdk.instance.sdkConfig.apiConfig,
            SunbirdSdk.instance.apiService,
            SunbirdSdk.instance.eventsBusService
        );
        this.telemetryService = SunbirdSdk.instance.telemetryService;
        this.webViewRunner = webviewRunner || new WebviewRunnerImpl();
    }

    public async provide(): Promise<OAuthSession> {
        const dsl = this.webViewRunner;
        const telemetryContext = await this.telemetryService.buildContext().toPromise();

        this.stateSessionConfig.target.params.push({
            key: 'pdata',
            value: JSON.stringify(telemetryContext.pdata)
        });

        return dsl.launchWebview({
            host: this.stateSessionConfig.target.host,
            path: this.stateSessionConfig.target.path,
            params: this.stateSessionConfig.target.params.reduce((acc, p) => {
                acc[p.key] = p.value;
                return acc;
            }, {...this.resetParams})
        }).then(() => {
            return dsl.any<OAuthSession>(
                ...this.stateSessionConfig.return.reduce<Promise<OAuthSession>[]>((acc, forCase) => {
                    switch (forCase.type) {
                        case 'state':
                            acc.push(
                                this.buildStateSessionProvider(dsl, forCase)
                            );
                            break;
                        case 'state-error':
                            acc.push(dsl.capture({
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
                            }));
                            break;

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
                                    this.webViewRunner,
                                    captured
                                ).provide()
                            );
                        })); break;
                    }
                    return acc;
                }, []),
            );
        });
    }

}
