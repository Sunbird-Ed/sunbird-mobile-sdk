interface SharedPreferences {
    getString: (key: string,
                defaultValue: any,
                successCallback: (response: string) => void,
                errorCallback: (response: string) => void) => void;
    putString: (key: string, value: string,
                successCallback: (response: string) => void,
                errorCallback: (response: string) => void) => void;

    putBoolean: (key: string, value: boolean,
                 successCallback: (response: string) => void,
                 errorCallback: (response: string) => void) => void;

    getBoolean: (key: string, defaultValue: boolean,
                 successCallback: (response: boolean) => void,
                 errorCallback: (response: string) => void) => void;
}

declare var plugins: {
    SharedPreferences: {
        getInstance: (name: string) => SharedPreferences
    }
};
