import { SharedPreferences } from '..';
import { Observable } from 'rxjs';
export declare class SharedPreferencesAndroid implements SharedPreferences {
    private static readonly sharedPreferncesName;
    private listeners;
    private sharedPreferences;
    getString(key: string): Observable<string | undefined>;
    putString(key: string, value: string): Observable<undefined>;
    putBoolean(key: string, value: boolean): Observable<boolean>;
    getBoolean(key: string): Observable<boolean>;
    addListener(key: string, listener: (value: any) => void): void;
    removeListener(key: string, listener: (value: any) => void): void;
}
