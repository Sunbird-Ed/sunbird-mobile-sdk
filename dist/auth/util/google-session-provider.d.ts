import { OAuthSession, SessionProvider } from '..';
import { ApiConfig } from '../../api';
import { StepOneCallbackType } from './o-auth-delegate';
export declare class GoogleSessionProvider implements SessionProvider {
    private paramsObj;
    private apiConfig;
    private inAppBrowserRef;
    constructor(paramsObj: StepOneCallbackType, apiConfig: ApiConfig, inAppBrowserRef: InAppBrowserSession);
    private static parseResolvedParams;
    provide(): Promise<OAuthSession>;
    private openInCustomTabs;
}
