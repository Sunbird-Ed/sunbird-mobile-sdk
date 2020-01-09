import {WebviewBaseSessionProvider} from './webview-base-session-provider';
import {WebviewRunner} from '../def/webview-runner';
import {WebviewSessionProviderConfig} from '../../..';
import {SunbirdSdk} from '../../../../sdk';
import {WebviewRunnerImpl} from './webview-runner-impl';
import {OAuthSession} from '../../..';
import {InterruptError} from '../../..';
import {TelemetryService} from '../../../../telemetry';

export class WebviewManualMergeSessionProvider extends WebviewBaseSessionProvider {
    private readonly webviewRunner: WebviewRunner;
    private readonly telemetryService: TelemetryService;

    constructor(
        private manualMergeConfig: WebviewSessionProviderConfig,
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

        const telemetryContext = await this.telemetryService.buildContext().toPromise();

        this.manualMergeConfig.target.params.push({
            key: 'pdata',
            value: JSON.stringify(telemetryContext.pdata)
        });

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
