import {SharedPreferences} from '..';
import {defer, Observable, of} from 'rxjs';
import {injectable} from 'inversify';
import {map, mapTo} from 'rxjs/operators';

@injectable()
export class SharedPreferencesLocalStorage implements SharedPreferences {
    private listeners: Map<string, ((v: any) => void)[]> = new Map();

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
