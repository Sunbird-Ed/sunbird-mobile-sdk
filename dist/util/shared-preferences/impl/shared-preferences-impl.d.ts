import { SharedPreferences } from '..';
export declare class SharedPreferencesImpl implements SharedPreferences {
    getString(key: string): Promise<string | null>;
    putString(key: string, value: string): void;
}
