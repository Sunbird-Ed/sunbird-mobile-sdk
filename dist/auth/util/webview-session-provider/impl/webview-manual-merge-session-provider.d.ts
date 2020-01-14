import { WebviewBaseSessionProvider } from './webview-base-session-provider';
import { WebviewRunner } from '../def/webview-runner';
import { WebviewSessionProviderConfig } from '../../..';
import { OAuthSession } from '../../..';
export declare class WebviewManualMergeSessionProvider extends WebviewBaseSessionProvider {
    private manualMergeConfig;
    private readonly webviewRunner;
    private readonly telemetryService;
    constructor(manualMergeConfig: WebviewSessionProviderConfig, webviewRunner?: WebviewRunner);
    provide(): Promise<OAuthSession>;
}
