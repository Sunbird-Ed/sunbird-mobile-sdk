import { SharedPreferences } from '..';
import { Observable } from 'rxjs';
export declare class SharedPreferencesAndroid implements SharedPreferences {
    private static readonly sharedPreferncesName;
    private sharedPreferences;
    getString(key: string): Observable<string | undefined>;
    putString(key: string, value: string): Observable<undefined>;
}
