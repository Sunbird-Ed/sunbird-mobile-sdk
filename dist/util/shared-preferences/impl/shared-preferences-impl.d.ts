import { SharedPreferences } from '..';
import { Observable } from 'rxjs';
export declare class SharedPreferencesImpl implements SharedPreferences {
    getString(key: string): Observable<string | undefined>;
    putString(key: string, value: string): Observable<undefined>;
}
