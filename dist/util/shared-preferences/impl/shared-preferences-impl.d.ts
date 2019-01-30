import { SharedPreferences } from '..';
export declare class SharedPreferencesImpl implements SharedPreferences {
    getString(key: string): Promise<string | null>;
    /**
     * @Deprecated
     * */
    getStringWithoutPrefix(key: string): Promise<string>;
    putString(key: string, value: string): void;
}
