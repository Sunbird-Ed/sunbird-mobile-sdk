import { SessionProvider } from '../../../def/session-provider';
import { JWTUtil, ApiConfig} from '../../../../api';
import { SunbirdSdk } from '../../../../sdk';
import { WebviewSessionProviderConfig } from '../../webview-session-provider/def/webview-session-provider-config';
import { WebviewRunner } from '../../webview-session-provider/def/webview-runner';
import { WebviewRunnerImpl } from '../../webview-session-provider/impl/webview-runner-impl';
import { TelemetryService } from 'src/telemetry/def/telemetry-service';
import * as qs from 'qs';

export class NativeCustomBrowserSessionProvider implements SessionProvider {
    private static readonly LOGIN_API_ENDPOINT = '/google/auth';
    private readonly webviewRunner: WebviewRunner;
    private readonly telemetryService: TelemetryService;
    private apiConfig: ApiConfig;

    private static parseAccessToken(accessToken: string): {
        userToken: string;
        accessTokenExpiresOn: number;
    } {
        const payload: { sub: string, exp: number } = JWTUtil.getJWTPayload(accessToken);
        return {
            userToken: payload.sub.split(':').length === 3 ? <string>payload.sub.split(':').pop() : payload.sub,
            accessTokenExpiresOn: payload.exp * 1000
        };
    }
    constructor(
        private loginConfig: WebviewSessionProviderConfig,
        private customWebViewConfig?: any,
        webviewRunner?: WebviewRunner
    ) {
        this.apiConfig = SunbirdSdk.instance.sdkConfig.apiConfig;
        this.telemetryService = SunbirdSdk.instance.telemetryService;
        this.webviewRunner = webviewRunner || new WebviewRunnerImpl();
    }

    protected buildGoogleTargetUrl(redirecturl: {[key: string]: string}, extras: {[key: string]: string}): URL {
        const url = new URL(redirecturl['googleRedirectUrl']);

        delete extras['redirect_uri'];
        url.searchParams.set('redirect_uri', this.apiConfig.user_authentication.redirectUrl);
        delete extras['error_callback'];
        url.searchParams.set('error_callback', this.apiConfig.user_authentication.redirectUrl);

        Object.keys(extras).forEach(key => url.searchParams.set(key, extras[key]));

        return url;
    }

    async provide(): Promise<any> {
        const dsl = this.webviewRunner;
        const telemetryContext = await this.telemetryService.buildContext().toPromise();
        this.loginConfig.target.params.push({
           key: 'pdata',
           value: JSON.stringify(telemetryContext.pdata)
        });
        let redirectUrl = "";
        let obj = {};
        (this.loginConfig.target.params).forEach(item => {
        if (item['key'] == 'redirect_uri') {
            redirectUrl = item['value'];
        }
            obj[item.key] = item.value;
        });
        const url = this.buildGoogleTargetUrl({"googleRedirectUrl": `${this.loginConfig.target.host}/${NativeCustomBrowserSessionProvider.LOGIN_API_ENDPOINT}?redirect_uri=${redirectUrl}`}, obj);
        return dsl.launchCustomTab({
            host: url.origin,
            path: url.pathname,
            params: qs.parse(url.searchParams.toString(), {ignoreQueryPrefix: true}),
            extraParams: this.customWebViewConfig.get('extraParam')
        }).then(() =>
            dsl.success()
        ).then((success) => {
            return {
                access_token: success.access_token,
                refresh_token: success.refresh_token,
                userToken: NativeCustomBrowserSessionProvider.parseAccessToken(success.access_token).userToken
            };
        });
    }
}
