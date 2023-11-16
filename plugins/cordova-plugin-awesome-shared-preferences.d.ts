// interface SharedPreferences {
//     getString: (key: string,
//                 defaultValue: any,
//                 successCallback: (response: string) => void,
//                 errorCallback: (response: string) => void) => void;
//     putString: (key: string, value: string,
//                 successCallback: (response: string) => void,
//                 errorCallback: (response: string) => void) => void;

//     putBoolean: (key: string, value: boolean,
//                  successCallback: (response: string) => void,
//                  errorCallback: (response: string) => void) => void;

//     getBoolean: (key: string, defaultValue: boolean,
//                  successCallback: (response: boolean) => void,
//                  errorCallback: (response: string) => void) => void;
// }
export interface ConfigureOptions {
    group?: string;
}

export interface GetOptions {
    key: string;
}

export interface GetResult {
    value: string | null;
}

export interface SetOptions {
    key: string;
    value: string;
}

export interface RemoveOptions {
    key: string;
}

export interface KeysResult {
    key: string[];
}

export interface MigrateResult {
    migrated: string[];
    existing: string[];
}

interface Preferences {
    configure(options: ConfigureOptions): Promise<void>;
    get(options: GetOptions): Promise<GetResult>;
    set(options: SetOptions): Promise<void>;
    remove(options: RemoveOptions): Promise<void>;
    clear(): Promise<void>;
    keys(): Promise<KeysResult>;
    migrate(): Promise<MigrateResult>;
    removeOld(): Promise<void>;    
}

declare var Capacitor: {
    Plugins: {
        Preferences: {
            configure(options: ConfigureOptions): Promise<void>
        }
    }
};
