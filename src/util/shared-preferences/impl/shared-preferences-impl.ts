import {SharedPreferences} from '..';
import {Observable} from 'rxjs';

export class SharedPreferencesImpl implements SharedPreferences {
    public getString(key: string): Observable<string | undefined> {
        return Observable.defer(() => Observable.of(localStorage.getItem(key))
            .map((v) => v || undefined));
    }

    public putString(key: string, value: string): Observable<undefined> {
        return Observable.defer(() => Observable.of(localStorage.setItem(key, value))
            .mapTo(undefined));
    }
}
