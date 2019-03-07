import {SharedPreferences} from '..';
import {Observable} from 'rxjs';

export class SharedPreferencesAndroid implements SharedPreferences {

    private static readonly sharedPreferncesName = 'org.ekstep.genieservices.preference_file';

    private sharedPreferences = plugins.SharedPreferences.getInstance(SharedPreferencesAndroid.sharedPreferncesName);

    public getString(key: string): Observable<string | undefined> {
        return Observable.create((observer) => {
            this.sharedPreferences.getString(key, undefined, (value) => {
                observer.next(value);
                observer.complete();
            }, (error) => {
                observer.next(undefined);
                observer.complete();
            });
        });
    }

    public putString(key: string, value: string): Observable<undefined> {
        return Observable.create((observer) => {
            this.sharedPreferences.putString(key, value, (val) => {
                observer.next(undefined);
                observer.complete();
            }, (error) => {
                observer.next(undefined);
                observer.complete();
            });
        });
    }
}
