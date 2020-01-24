interface Cordova {
    getAppVersion: {
        getAppName: (cb: (name: string) => void) => void;
    };
}
