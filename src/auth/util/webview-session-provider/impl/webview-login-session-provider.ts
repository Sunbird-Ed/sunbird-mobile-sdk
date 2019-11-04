import {OAuthSession} from '../../..';
import {WebviewSessionProviderConfig} from '../def/webview-session-provider-config';
import {WebviewRunner} from '../def/webview-runner';
import {WebviewRunnerImpl} from './webview-runner-impl';
import {SunbirdSdk} from '../../../../sdk';
import {WebviewAutoMergeSessionProvider} from './webview-auto-merge-session-provider';
import {WebviewBaseSessionProvider} from './webview-base-session-provider';

export class WebviewLoginSessionProvider extends WebviewBaseSessionProvider {
    private readonly webviewRunner: WebviewRunner;

    constructor(
        private loginConfig: WebviewSessionProviderConfig,
        private autoMergeConfig: WebviewSessionProviderConfig,
        webviewRunner?: WebviewRunner
    ) {
        super(
            SunbirdSdk.instance.sdkConfig.apiConfig,
            SunbirdSdk.instance.apiService,
            SunbirdSdk.instance.eventsBusService
        );

        this.webviewRunner = webviewRunner || new WebviewRunnerImpl();
    }

    public async provide(): Promise<OAuthSession> {
        const dsl = this.webviewRunner;

        return dsl.launchWebview({
            host: this.loginConfig.target.host,
            path: this.loginConfig.target.path,
            params: this.loginConfig.target.params.reduce((acc, p) => {
                acc[p.key] = p.value;
                return acc;
            }, {})
        }).then(() => {
            return dsl.any<OAuthSession>(
                ...this.loginConfig.return.reduce<Promise<OAuthSession>[]>((acc, forCase) => {
                    switch (forCase.type) {
                        case 'password': acc.push(
                            this.buildPasswordSessionProvider(dsl, forCase)
                        ); break;

                        case 'state': acc.push(
                            this.buildStateSessionProvider(dsl, forCase)
                        ); break;

                        case 'google': acc.push(
                            this.buildGoogleSessionProvider(dsl, forCase)
                        ); break;

                        case 'migrate': acc.push(dsl.capture({
                            host: forCase.when.host,
                            path: forCase.when.path,
                            params: forCase.when.params
                        }).then(() =>
                            dsl.resolveCaptured('payload')
                        ).then((payload) =>
                            dsl.clearCapture().then(() =>
                                new WebviewAutoMergeSessionProvider(
                                    this.autoMergeConfig,
                                    this.webviewRunner,
                                    payload
                                ).provide()
                            )
                        )); break;
                    }

                    return acc;
                }, []),
            );
        });
    }
}
