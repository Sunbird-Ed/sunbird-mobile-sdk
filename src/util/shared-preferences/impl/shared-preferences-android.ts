import {SharedPreferences} from '..';
import {Observable, from, of} from 'rxjs';
import {injectable} from 'inversify';
import {mapTo} from 'rxjs/operators';

@injectable()
export class SharedPreferencesAndroid implements SharedPreferences {
    private static readonly sharedPreferncesName = 'org.ekstep.genieservices.preference_file';

    private listeners: Map<string, ((v: any) => void)[]> = new Map();

    private sharedPreferences = window['Capacitor']['Plugins'].Preferences.configure({group: SharedPreferencesAndroid.sharedPreferncesName});

    public getString(key: string): Observable<string | undefined> {
        window['Capacitor']['Plugins'].Preferences.configure({group: SharedPreferencesAndroid.sharedPreferncesName})
        const value = localStorage.getItem(key);
        console.log('*** get string ', key, value);
        if (value) {
            localStorage.removeItem(key);

            return this.putString(key, value).pipe(
                mapTo(value)
            );
        } else {
            return new Observable((observer) => {
                window['Capacitor']['Plugins'].Preferences.get({key})
                .then(v => {observer.next(v.value);
                observer.complete()})
                .catch(e => observer.next(undefined))
            })
        }
    }

    public putString(key: string, value: string): Observable<undefined> {
        window['Capacitor']['Plugins'].Preferences.configure({group: SharedPreferencesAndroid.sharedPreferncesName})
        return new Observable((observer) => {
            console.log('key , value ', key, value);
            window['Capacitor']['Plugins'].Preferences.set({key, value}).then(() => {
                (this.listeners.get(key) || []).forEach((listener) => listener(value));
                observer.next(undefined);
                observer.complete();
            }).catch((e) => {
                observer.error(e);
            });
        });
    }

    public putBoolean(key: string, value: boolean): Observable<boolean> {
        window['Capacitor']['Plugins'].Preferences.configure({group: SharedPreferencesAndroid.sharedPreferncesName})
        return new Observable((observer) => {
            window['Capacitor']['Plugins'].Preferences.set({key, value}).then(() => {
                (this.listeners.get(key) || []).forEach((listener) => listener(value));
                observer.next(true);
                observer.complete();
            }).catch((e) => {
                observer.error(e);
            });
        });
    }

    public getBoolean(key: string): Observable<boolean> {
        window['Capacitor']['Plugins'].Preferences.configure({group: SharedPreferencesAndroid.sharedPreferncesName})
        const value = localStorage.getItem(key);
        if (value) {
            localStorage.removeItem(key);

            return this.putBoolean(key, value === 'true').pipe(
                mapTo(value === 'true')
            );
        } else {
            return new Observable((observer) => {
                window['Capacitor']['Plugins'].Preferences.get({key}).then((v) => {
                        observer.next(v.value);
                        observer.complete();
                }).catch((e) => {
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
