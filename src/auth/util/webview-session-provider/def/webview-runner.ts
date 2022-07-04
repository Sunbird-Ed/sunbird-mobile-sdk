export interface WebviewRunner {
    resetInAppBrowserEventListeners();

    launchWebview(args: { host: string, path: string, params: {[key: string]: string} }): Promise<void>;

    launchCustomTab(args: { host: string, path: string, params: {[key: string]: string}, extraParams: string}): Promise<void>;

    capture(args: { host: string, path: string, params: { key: string, resolveTo: string, match?: string, exists?: 'true' | 'false' }[] }): Promise<void>;

    resolveCaptured(param: string): Promise<string>;

    clearCapture(): Promise<void>;

    getCaptureExtras(): Promise<{[key: string]: string}>;

    any<T>(...args: Promise<T>[]): Promise<T>;

    all(...args: Promise<any>[]): Promise<void>;

    redirectTo(args: { host: string, path: string, params: {[key: string]: string} }): Promise<void>;

    closeWebview(): Promise<void>;

    success(): Promise<{[key: string]: string}>;

    fail(): Promise<{[key: string]: string}>;
}
