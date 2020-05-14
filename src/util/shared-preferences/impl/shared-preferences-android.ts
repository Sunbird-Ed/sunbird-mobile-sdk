import {SharedPreferences} from '..';
import {Observable} from 'rxjs';
import {injectable} from 'inversify';
import {mapTo} from 'rxjs/operators';

@injectable()
export class SharedPreferencesAndroid implements SharedPreferences {
    private static readonly sharedPreferncesName = 'org.ekstep.genieservices.preference_file';

    private listeners: Map<string, ((v: any) => void)[]> = new Map();

    private sharedPreferences = plugins.SharedPreferences.getInstance(SharedPreferencesAndroid.sharedPreferncesName);

    public getString(key: string): Observable<string | undefined> {
        const value = localStorage.getItem(key);

        if (value) {
            localStorage.removeItem(key);

            return this.putString(key, value).pipe(
                mapTo(value)
            );
        } else {
            return new Observable((observer) => {
                this.sharedPreferences.getString(key, '', (v) => {
                    observer.next(v);
                    observer.complete();
                }, (e) => {
                    observer.error(e);
                });
            });
        }
    }

    public putString(key: string, value: string): Observable<undefined> {
        return new Observable((observer) => {
            this.sharedPreferences.putString(key, value, () => {
                (this.listeners.get(key) || []).forEach((listener) => listener(value));
                observer.next(undefined);
                observer.complete();
            }, (e) => {
                observer.error(e);
            });
        });
    }

    public putBoolean(key: string, value: boolean): Observable<boolean> {
        return new Observable((observer) => {
            this.sharedPreferences.putBoolean(key, value, () => {
                (this.listeners.get(key) || []).forEach((listener) => listener(value));
                observer.next(true);
                observer.complete();
            }, (e) => {
                observer.error(e);
            });
        });
    }

    public getBoolean(key: string): Observable<boolean> {
        const value = localStorage.getItem(key);

        if (value) {
            localStorage.removeItem(key);

            return this.putBoolean(key, value === 'true').pipe(
                mapTo(value === 'true')
            );
        } else {
            return new Observable((observer) => {
                this.sharedPreferences.getBoolean(key, false, (v) => {
                    observer.next(v);
                    observer.complete();
                }, (e) => {
                    observer.error(e);
                });
            });
        }
    }

    addListener(key: string, listener: (value: any) => void) {
        const keyListeners: ((v: any) => void)[] = this.listeners.get(key) || [];
        keyListeners.push(listener);
        this.listeners.set(key, keyListeners);
    }

    removeListener(key: string, listener: (value: any) => void) {
        const keyListeners: ((v: any) => void)[] = this.listeners.get(key) || [];
        this.listeners.set(key, keyListeners.filter((l) => l !== listener));
    }
}
