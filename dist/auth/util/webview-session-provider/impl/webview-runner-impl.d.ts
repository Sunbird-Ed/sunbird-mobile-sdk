import { WebviewRunner } from '../def/webview-runner';
export declare class WebviewRunnerImpl implements WebviewRunner {
    private extras;
    private captured;
    private inAppBrowser?;
    static buildUrl(host: string, path: string, params: {
        [p: string]: string;
    }): string;
    resetInAppBrowserEventListeners(): void;
    launchWebview({ host, path, params }: {
        host: string;
        path: string;
        params: {
            [p: string]: string;
        };
    }): Promise<void>;
    closeWebview(): Promise<void>;
    any<T>(...args: Promise<T>[]): Promise<T>;
    all(...args: Promise<any>[]): Promise<void>;
    launchCustomTab({ host, path, params }: {
        host: string;
        path: string;
        params: {
            [p: string]: string;
        };
    }): Promise<void>;
    capture({ host, path, params }: {
        host: string;
        path: string;
        params: {
            key: string;
            resolveTo: string;
            match?: string;
            exists?: 'true' | 'false';
        }[];
    }): Promise<void>;
    resolveCaptured(param: string): Promise<string>;
    clearCapture(): Promise<void>;
    redirectTo({ host, path, params }: {
        host: string;
        path: string;
        params: {
            [p: string]: string;
        };
    }): Promise<void>;
    success(): Promise<{
        [p: string]: string;
    }>;
    fail(): Promise<{
        [p: string]: string;
    }>;
    getCaptureExtras(): Promise<{
        [p: string]: string;
    }>;
}
