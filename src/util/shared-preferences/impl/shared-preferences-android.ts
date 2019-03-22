import {SharedPreferences} from '..';
import {Observable} from 'rxjs';

export class SharedPreferencesAndroid implements SharedPreferences {

    private static readonly sharedPreferncesName = 'org.ekstep.genieservices.preference_file';

    private sharedPreferences = plugins.SharedPreferences.getInstance(SharedPreferencesAndroid.sharedPreferncesName);

    public getString(key: string): Observable<string | undefined> {
        return Observable.create((observer) => {
            this.sharedPreferences.getString(key, '', (value) => {
                observer.next(value);
                observer.complete();
            }, (e) => {
                observer.error(e);
            });
        });
    }

    public putString(key: string, value: string): Observable<undefined> {
        return Observable.create((observer) => {
            this.sharedPreferences.putString(key, value, () => {
                observer.next(undefined);
                observer.complete();
            }, (e) => {
                observer.error(e);
            });
        });
    }

    public putBoolean(key: string, value: boolean): Observable<boolean> {
        return Observable.create((observer) => {
            this.sharedPreferences.putBoolean(key, value, () => {
                observer.next(true);
                observer.complete();
            }, (e) => {
                observer.error(false);
            });
        });
    }

    public getBoolean(key: string): Observable<boolean> {
        return Observable.create((observer) => {
            this.sharedPreferences.getBoolean(key, false, (value) => {
                observer.next(value);
                observer.complete();
            }, (e) => {
                observer.error(e);
            });
        });
    }
}
