import {WebviewBaseSessionProvider} from './webview-base-session-provider';
import {WebviewRunner} from '../def/webview-runner';
import {WebviewSessionProviderConfig} from '../../..';
import {SunbirdSdk} from '../../../../sdk';
import {WebviewRunnerImpl} from './webview-runner-impl';
import {OAuthSession} from '../../..';
import {InterruptError} from '../../..';

export class WebviewManualMergeSessionProvider extends WebviewBaseSessionProvider {
    private readonly webviewRunner: WebviewRunner;

    constructor(
        private manualMergeConfig: WebviewSessionProviderConfig,
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
            host: this.manualMergeConfig.target.host,
            path: this.manualMergeConfig.target.path,
            params: this.manualMergeConfig.target.params.reduce((acc, p) => {
                acc[p.key] = p.value;
                return acc;
            }, {})
        }).then(() => {
            return dsl.any<OAuthSession>(
                ...this.manualMergeConfig.return.reduce<Promise<OAuthSession>[]>((acc, forCase) => {
                    switch (forCase.type) {
                        case 'password': acc.push(
                            this.buildPasswordSessionProvider(dsl, forCase)
                        ); break;

                        case 'google': acc.push(
                            this.buildGoogleSessionProvider(dsl, forCase)
                        ); break;

                        case 'exit': acc.push(
                            dsl.capture({
                                host: forCase.when.host,
                                path: forCase.when.path,
                                params: forCase.when.params
                            }).then(() =>
                                dsl.closeWebview().then(() =>
                                    dsl.clearCapture().then(async () => {
                                        throw new InterruptError('EXIT param found');
                                    })
                                )
                            )
                        ); break;
                    }

                    return acc;
                }, []),
            );
        });
    }
}
