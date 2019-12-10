interface InAppBrowserSession {
    addEventListener(eventname: 'loadstart' | 'loadstop' | 'loaderror' | 'exit' | 'beforeload' | 'message', callback: (event) => void);

    removeEventListener(eventname: 'loadstart' | 'loadstop' | 'loaderror' | 'exit' | 'beforeload' | 'message', callback: (event) => void);

    executeScript(body: any);

    close();

    show();

    hide();
}

interface Cordova {
    InAppBrowser: {
        open(location: string, target: string, options: string): InAppBrowserSession;
    };
}
