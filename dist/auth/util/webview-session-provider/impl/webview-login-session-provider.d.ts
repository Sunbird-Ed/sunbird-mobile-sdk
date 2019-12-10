import { OAuthSession } from '../../..';
import { WebviewSessionProviderConfig } from '../def/webview-session-provider-config';
import { WebviewRunner } from '../def/webview-runner';
import { WebviewBaseSessionProvider } from './webview-base-session-provider';
export declare class WebviewLoginSessionProvider extends WebviewBaseSessionProvider {
    private loginConfig;
    private autoMergeConfig;
    private readonly webviewRunner;
    constructor(loginConfig: WebviewSessionProviderConfig, autoMergeConfig: WebviewSessionProviderConfig, webviewRunner?: WebviewRunner);
    provide(): Promise<OAuthSession>;
}
