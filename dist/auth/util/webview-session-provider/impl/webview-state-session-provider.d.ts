import { WebviewBaseSessionProvider } from './webview-base-session-provider';
import { OAuthSession } from '../../../def/o-auth-session';
import { WebviewRunner } from '../def/webview-runner';
import { WebviewStateSessionProviderConfig } from '../def/webview-state-session-provider-config';
import { WebviewSessionProviderConfig } from '../def/webview-session-provider-config';
export declare class WebviewStateSessionProvider extends WebviewBaseSessionProvider {
    private stateSessionConfig;
    private autoMergeConfig;
    private readonly webViewRunner;
    private readonly telemetryService;
    private resetParams;
    constructor(stateSessionConfig: WebviewStateSessionProviderConfig, autoMergeConfig: WebviewSessionProviderConfig, webviewRunner?: WebviewRunner);
    provide(): Promise<OAuthSession>;
}
