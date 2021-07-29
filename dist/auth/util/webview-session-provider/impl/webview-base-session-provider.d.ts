import { ApiConfig, ApiService } from '../../../../api';
import { EventsBusService } from '../../../../events-bus';
import { SessionProvider } from '../../../def/session-provider';
import { OAuthSession } from '../../../def/o-auth-session';
export declare abstract class WebviewBaseSessionProvider implements SessionProvider {
    protected apiConfig: ApiConfig;
    protected apiService: ApiService;
    protected eventsBusService: EventsBusService;
    private static parseUserTokenFromAccessToken;
    protected constructor(apiConfig: ApiConfig, apiService: ApiService, eventsBusService: EventsBusService);
    abstract provide(): Promise<OAuthSession>;
    protected buildGoogleTargetUrl(captured: {
        [key: string]: string;
    }, extras: {
        [key: string]: string;
    }): URL;
    protected buildPasswordSessionProvider(dsl: any, forCase: any): any;
    protected buildStateSessionProvider(dsl: any, forCase: any): any;
    protected buildGoogleSessionProvider(dsl: any, forCase: any): any;
    private resolvePasswordSession;
    private resolveStateSession;
    private resolveGoogleSession;
}
