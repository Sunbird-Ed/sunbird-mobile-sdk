import {Observable} from 'rxjs';

export interface SharedPreferences {
    getString(key: string): Observable<string | undefined>;

    putString(key: string, value: string): Observable<undefined>;

    putBoolean(key: string, value: boolean): Observable<boolean>;

    getBoolean(key: string): Observable<boolean>;

    addListener(key: string, listener: (value: any) => void);

    removeListener(key: string, listener: (value: any) => void);
}
