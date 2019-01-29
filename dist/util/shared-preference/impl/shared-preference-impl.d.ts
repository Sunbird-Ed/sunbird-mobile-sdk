import { SharedPreference } from '../def/shared-preference';
export declare class SharedPreferenceImpl implements SharedPreference {
    getString(key: string): Promise<string | null>;
    /**
     * @Deprecated
     * */
    getStringWithoutPrefix(key: string): Promise<string>;
    putString(key: string, value: string): void;
}
