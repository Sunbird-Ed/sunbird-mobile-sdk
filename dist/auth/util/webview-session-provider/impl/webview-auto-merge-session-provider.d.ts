import { OAuthSession } from '../../..';
import { WebviewRunner } from '../def/webview-runner';
import { WebviewSessionProviderConfig } from '../../..';
import { WebviewBaseSessionProvider } from './webview-base-session-provider';
export declare class WebviewAutoMergeSessionProvider extends WebviewBaseSessionProvider {
    private autoMergeConfig;
    private webviewRunner;
    private captured;
    private readonly telemetryService;
    constructor(autoMergeConfig: WebviewSessionProviderConfig, webviewRunner: WebviewRunner, captured: {
        [key: string]: string;
    });
    provide(): Promise<OAuthSession>;
    private performAutoMerge;
}
