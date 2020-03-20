import { OAuthSession } from '../../..';
import { WebviewSessionProviderConfig } from '../../..';
import { WebviewRunner } from '../def/webview-runner';
import { WebviewBaseSessionProvider } from './webview-base-session-provider';
export declare class WebviewLoginSessionProvider extends WebviewBaseSessionProvider {
    private loginConfig;
    private autoMergeConfig;
    private readonly webviewRunner;
    private readonly telemetryService;
    private resetParams;
    constructor(loginConfig: WebviewSessionProviderConfig, autoMergeConfig: WebviewSessionProviderConfig, webviewRunner?: WebviewRunner);
    provide(): Promise<OAuthSession>;
}
