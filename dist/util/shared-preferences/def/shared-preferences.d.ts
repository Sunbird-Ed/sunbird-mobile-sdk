import { Observable } from 'rxjs';
export interface SharedPreferences {
    getString(key: string): Observable<string | undefined>;
    putString(key: string, value: string): Observable<undefined>;
}
