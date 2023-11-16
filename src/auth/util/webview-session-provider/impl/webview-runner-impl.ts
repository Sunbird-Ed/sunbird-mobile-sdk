import {WebviewRunner} from '../def/webview-runner';
import * as qs from 'qs';
import {zip, race} from 'rxjs';
import {NoInappbrowserSessionAssertionFailError} from '../errors/no-inappbrowser-session-assertion-fail-error';
import {ParamNotCapturedError} from '../errors/param-not-captured-error';
import { take, mapTo } from 'rxjs/operators';

export class WebviewRunnerImpl implements WebviewRunner {
    private extras: {[key: string]: string} = {};
    private captured: {[key: string]: string} = {};
    // private inAppBrowser?: {
    //     ref: InAppBrowserSession;
    //     listeners: {
    //         loadstart: Set<any>;
    //         exit: Set<any>;
    //     };
    // };

    static buildUrl(host: string, path: string, params: { [p: string]: string }) {
        return `${host}${path}?${qs.stringify(params)}`;
    }

    public resetInAppBrowserEventListeners() {
        // if (!this.inAppBrowser) {
        //     throw new NoInappbrowserSessionAssertionFailError('InAppBrowser Session not found when resetInAppBrowserEventListeners()');
        // }
        window['capacitor']['plugins'].Browser.removeAllListeners()
        // for (const key in this.inAppBrowser.listeners) {
        //     if (this.inAppBrowser.listeners.hasOwnProperty(key)) {
        //         (this.inAppBrowser.listeners[key] as Set<any>).forEach((listener) => {
        //             this.inAppBrowser!.ref.removeEventListener(key as any, listener);
        //         });

        //         (this.inAppBrowser.listeners[key] as Set<any>).clear();
        //     }
        // }
    }

    async launchWebview({ host, path, params }: { host: string; path: string; params: { [p: string]: string } }): Promise<void> {
        // this.inAppBrowser = {
            window['capacitor']['plugins'].Browser.open(
                WebviewRunnerImpl.buildUrl(host, path, params),
                '_blank',
                'zoom=no,clearcache=yes,clearsessioncache=yes,cleardata=yes'
            )
            // listeners: {
            //     loadstart: new Set(),
            //     exit: new Set()
            // }
        // };

        const onExit = () => {
            this.resetInAppBrowserEventListeners();
            // this.inAppBrowser = undefined;
        };

        // this.inAppBrowser.listeners.exit.add(onExit);
        // this.inAppBrowser.ref.addEventListener('exit', onExit);
        window['capacitor']['plugins'].Browser.addEventListener('browserFinished', onExit);
    }

    async closeWebview(): Promise<void> {
        // if (!this.inAppBrowser) {
        //     throw new NoInappbrowserSessionAssertionFailError('InAppBrowser Session not found');
        // }

        // this.inAppBrowser.ref.close();
        window['capacitor']['plugins'].Browser.close();
    }

    any<T>(...args: Promise<T>[]): Promise<T> {
        return race(
            ...args
        ).pipe(
            take(1)
        ).toPromise();
    }

    all(...args: Promise<any>[]): Promise<void> {
        return zip(
            ...args
        ).pipe(
            take(1),
            mapTo(undefined)
        ).toPromise();
    }

    launchCustomTab({host, path, params, extraParams}: { host: string; path: string; params: { [p: string]: string }; extraParams: string }): Promise<void> {
        const url = WebviewRunnerImpl.buildUrl(host, path, params);

        return new Promise<void>((resolve, reject) => {
            customtabs.isAvailable(() => {
                // customTabs available
                customtabs.launch(url, resolved => {
                    this.captured = {
                        ...this.captured,
                        ...qs.parse(resolved)
                    };
                    resolve();
                }, error => {
                    reject(error);
                });
            }, () => {
                customtabs.launchInBrowser(url, extraParams, resolved => {
                    this.captured = {
                        ...this.captured,
                        ...qs.parse(resolved)
                    };
                    resolve();
                }, error => {
                    reject(error);
                });
            });
        });
    }

    capture({host, path, params}: { host: string; path: string; params: { key: string; resolveTo: string, match?: string, exists?: 'true' | 'false' }[] }): Promise<void> {
        // if (!this.inAppBrowser) {
        //     throw new NoInappbrowserSessionAssertionFailError('InAppBrowser Session not found');
        // }

        const isHostMatching = (url: URL) => url.origin === host;
        const isPathMatching = (url: URL) => url.pathname === path;
        const areParamsMatching = (url: URL) => params.map(p => p).every(param => {
            if (param.exists === 'false') {
                return !url.searchParams.has(param.key);
            } else {
                if (param.match) {
                    return url.searchParams.has(param.key) && url.searchParams.get(param.key) === param.match;
                }

                return url.searchParams.has(param.key);
            }
        });

        return new Promise((resolve) => {
            const onLoadStart = (event) => {
                if (event.url) {
                    const url = new URL(event.url);

                    if (
                        isHostMatching(url) &&
                        isPathMatching(url) &&
                        areParamsMatching(url)
                    ) {
                        this.captured = {
                            ...this.captured,
                            ...params.reduce<{ [key: string]: string }>((acc, p) => {
                                acc[p.resolveTo] = url.searchParams.get(p.key)!;
                                return acc;
                            }, {}),
                        };

                        this.extras = {};
                        params.map(p => p.key).forEach(param => url.searchParams.delete(param));
                        url.searchParams['forEach']((value, key) => {
                           this.extras[key] = value;
                        });

                        // if (this.inAppBrowser) {
                        //     this.inAppBrowser.listeners.loadstart.delete(onLoadStart);
                        //     this.inAppBrowser.ref.removeEventListener('loadstart', onLoadStart);
                        // }

                        window['capacitor']['plugins'].Browser.removeAllListeners();
                        resolve();
                    }
                }
            };

            // if (this.inAppBrowser) {
                // this.inAppBrowser.listeners.loadstart.add(onLoadStart);
                // this.inAppBrowser.ref.addEventListener('loadstart', onLoadStart);
            // }
            window['capacitor']['plugins'].Browser.removeAllListeners();
        });
    }

    async resolveCaptured(param: string): Promise<string> {
        if (!this.captured[param]) {
            throw new ParamNotCapturedError(`${param} was not captured`);
        }

        return this.captured[param];
    }

    async clearCapture(): Promise<void> {
        this.captured = {};
    }

    async redirectTo({host, path, params}: { host: string; path: string; params: { [p: string]: string } }): Promise<void> {
        // if (!this.inAppBrowser) {
        //     throw new NoInappbrowserSessionAssertionFailError('InAppBrowser Session not found');
        // }

        // this.inAppBrowser.ref.executeScript({
        //     code: `(() => {
        //                 window.location.href = ` + '`' + `${WebviewRunnerImpl.buildUrl(host, path, params)}` + '`' + `;
        //             })()`
        // });
    }

    async success(): Promise<{ [p: string]: string }> {
        return {...this.captured};
    }

    async fail(): Promise<{ [p: string]: string }> {
        throw {...this.captured};
    }

    async getCaptureExtras(): Promise<{ [p: string]: string }> {
        return {...this.extras};
    }
}
