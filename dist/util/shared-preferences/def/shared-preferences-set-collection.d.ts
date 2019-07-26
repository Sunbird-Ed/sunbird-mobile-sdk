import { Observable } from 'rxjs';
import * as Collections from 'typescript-collections';
export interface SharedPreferencesSetCollection<T> {
    addAll(items: T[]): Observable<void>;
    add(item: T): Observable<void>;
    remove(item: T): Observable<boolean>;
    clear(): Observable<void>;
    contains(item: T): Observable<boolean>;
    asList(): Observable<T[]>;
    asSet(): Observable<Collections.Set<T>>;
    asListChanges(): Observable<T[]>;
}
