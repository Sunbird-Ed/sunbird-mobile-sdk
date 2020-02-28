import {SharedPreferences} from '..';
import {defer, Observable, of} from 'rxjs';
import {injectable} from 'inversify';
import {map, mapTo} from 'rxjs/operators';

@injectable()
export class SharedPreferencesLocalStorage implements SharedPreferences {
    public getString(key: string): Observable<string | undefined> {
        return defer(() => of(localStorage.getItem(key)).pipe(
            map((v) => v || undefined))
        );
    }

    public putString(key: string, value: string): Observable<undefined> {
        return defer(() => of(localStorage.setItem(key, value)).pipe(
            mapTo(undefined))
        );
    }

    public putBoolean(key: string, value: boolean): Observable<boolean> {
        return defer(() =>
            of(localStorage.setItem(key, value + '')).pipe(
                mapTo(true))
        );
    }

    public getBoolean(key: string): Observable<boolean> {
        return defer(() => of(
            localStorage.getItem(key) === 'true'
        ));
    }
}
