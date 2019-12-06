import { SharedPreferencesSetCollection } from '../def/shared-preferences-set-collection';
import { SharedPreferences } from '..';
import { Observable } from 'rxjs';
import Set from 'typescript-collections/dist/lib/Set';
export declare class SharedPreferencesSetCollectionImpl<T> implements SharedPreferencesSetCollection<T> {
    private sharedPreferences;
    private key;
    private toStringFunction?;
    private changes;
    constructor(sharedPreferences: SharedPreferences, key: string, toStringFunction?: ((item: T) => string) | undefined);
    addAll(items: T[]): Observable<void>;
    add(item: T): Observable<void>;
    clear(): Observable<void>;
    remove(item: T): Observable<boolean>;
    contains(item: T): Observable<boolean>;
    asList(): Observable<T[]>;
    asSet(): Observable<Set<T>>;
    asListChanges(): Observable<T[]>;
}
