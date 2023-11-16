interface InAppBrowserSession {
    addEventListener(eventname: 'loadstart' | 'loadstop' | 'loaderror' | 'exit' | 'beforeload' | 'message', callback: (event) => void);

    removeEventListener(eventname: 'loadstart' | 'loadstop' | 'loaderror' | 'exit' | 'beforeload' | 'message', callback: (event) => void);

    executeScript(body: any);

    close();

    show();

    hide();
}

interface Capacitor {
    Plugins: {
        Browser: {
            open(options: OpenOptions): Promise<void>;
          
            close(): Promise<void>;
          
            addListener(
              eventName: 'browserFinished',
              listenerFunc: () => void,
            ): Promise<PluginListenerHandle>;
          
            addListener(
              eventName: 'browserPageLoaded',
              listenerFunc: () => void,
            ): Promise<PluginListenerHandle>;
          
            removeAllListeners(): Promise<void>;
        }
        
    }
}
export interface OpenOptions {
    /**
     * The URL to which the browser is opened.
     *
     * @since 1.0.0
     */
    url: string;

    /**
     * Web only: Optional target for browser open. Follows
     * the `target` property for window.open. Defaults
     * to _blank.
     *
     * Ignored on other platforms.
     *
     * @since 1.0.0
     */
    windowName?: string;

    /**
     * A hex color to which the toolbar color is set.
     *
     * @since 1.0.0
     */
    toolbarColor?: string;

    /**
     * iOS only: The presentation style of the browser. Defaults to fullscreen.
     *
     * Ignored on other platforms.
     *
     * @since 1.0.0
     */
    presentationStyle?: 'fullscreen' | 'popover';

    /**
     * iOS only: The width the browser when using presentationStyle 'popover' on iPads.
     *
     * Ignored on other platforms.
     *
     * @since 4.0.0
     */
    width?: number;

    /**
     * iOS only: The height the browser when using presentationStyle 'popover' on iPads.
     *
     * Ignored on other platforms.
     *
     * @since 4.0.0
     */
    height?: number;
}
interface Cordova {
    InAppBrowser: {
        open(location: string, target: string, options: string): InAppBrowserSession;
    };
}
