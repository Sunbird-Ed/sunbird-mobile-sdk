import {AuthEventType, OAuthSession} from '../../..';
import {WebviewRunner} from '../def/webview-runner';
import {WebviewSessionProviderConfig} from '../../..';
import {WebviewBaseSessionProvider} from './webview-base-session-provider';
import {SunbirdSdk} from '../../../../sdk';
import {HttpRequestType, Request} from '../../../../api';
import {EventNamespace} from '../../../../events-bus';
import { mapTo } from 'rxjs/operators';
import {TelemetryService} from '../../../../telemetry';

export class WebviewAutoMergeSessionProvider extends WebviewBaseSessionProvider {
    private readonly telemetryService: TelemetryService;

    constructor(
        private autoMergeConfig: WebviewSessionProviderConfig,
        private webviewRunner: WebviewRunner,
        private captured: { [key: string]: string }
    ) {
        super(
            SunbirdSdk.instance.sdkConfig.apiConfig,
            SunbirdSdk.instance.apiService,
            SunbirdSdk.instance.eventsBusService
        );

        this.telemetryService = SunbirdSdk.instance.telemetryService;
    }

    public async provide(): Promise<OAuthSession> {
        const dsl = this.webviewRunner;

        const telemetryContext = await this.telemetryService.buildContext().toPromise();

        this.autoMergeConfig.target.params.push({
            key: 'pdata',
            value: JSON.stringify(telemetryContext.pdata)
        });

        Object.keys(this.captured).forEach(p => {
            this.autoMergeConfig.target.params.push({
                key: p,
                value: this.captured[p]
            });
        });

        return dsl.redirectTo({
            host: this.autoMergeConfig.target.host,
            path: this.autoMergeConfig.target.path,
            params: this.autoMergeConfig.target.params.reduce((acc, p) => {
                acc[p.key] = p.value;
                return acc;
            }, {})
        }).then(() => {
            return dsl.any<OAuthSession>(
                ...this.autoMergeConfig.return.reduce<Promise<OAuthSession>[]>((acc, forCase) => {
                    switch (forCase.type) {
                        case 'password':
                            acc.push(
                                this.buildPasswordSessionProvider(dsl, forCase).then((session) =>
                                    this.performAutoMerge({payload: this.captured['payload'], session})
                                )
                            );
                            break;

                        case 'state':
                            acc.push(
                                this.buildStateSessionProvider(dsl, forCase)
                            );
                            break;

                        case 'google':
                            acc.push(
                                this.buildGoogleSessionProvider(dsl, forCase)
                                    .then((session) =>
                                        this.performAutoMerge({payload: this.captured['payload'], session})
                                    )
                            );
                            break;
                    }

                    return acc;
                }, []),
            );
        });
    }

    private performAutoMerge({payload, session}: { payload: string, session: OAuthSession }): Promise<OAuthSession> {
        const apiRequest = new Request.Builder()
            .withType(HttpRequestType.GET)
            .withPath(this.apiConfig.user_authentication.autoMergeApiPath)
            .withParameters({
                client_id: 'android'
            })
            .withHeaders({
                'x-authenticated-user-token': session.access_token,
                'x-authenticated-user-data': payload
            })
            .build();

        return this.apiService.fetch(apiRequest).pipe(
            mapTo(undefined)
        ).toPromise().then(() => {
            this.eventsBusService.emit({
                namespace: EventNamespace.AUTH,
                event: {
                    type: AuthEventType.AUTO_MIGRATE_SUCCESS,
                    payload: undefined
                }
            });

            return session;
        }).catch((e) => {
            console.error(e);

            this.eventsBusService.emit({
                namespace: EventNamespace.AUTH,
                event: {
                    type: AuthEventType.AUTO_MIGRATE_FAIL,
                    payload: undefined
                }
            });

            return session;
        });
    }
}
