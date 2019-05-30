import {SharedPreferences} from '..';
import {Observable} from 'rxjs';
import { injectable } from 'inversify';

@injectable()
export class SharedPreferencesLocalStorage implements SharedPreferences {
    public getString(key: string): Observable<string | undefined> {
        return Observable.defer(() => Observable.of(localStorage.getItem(key))
            .map((v) => v || undefined));
    }

    public putString(key: string, value: string): Observable<undefined> {
        return Observable.defer(() => Observable.of(localStorage.setItem(key, value))
            .mapTo(undefined));
    }

    public putBoolean(key: string, value: boolean): Observable<boolean> {
        return Observable.defer(() => Observable.of(localStorage.setItem(key, value + ''))
            .mapTo(true));
    }

    public getBoolean(key: string): Observable<boolean> {
        return Observable.defer(() => Observable.of(Boolean(localStorage.getItem(key))));
    }
}
