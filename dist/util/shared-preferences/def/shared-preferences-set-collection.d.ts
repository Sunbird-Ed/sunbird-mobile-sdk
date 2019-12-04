import { Observable } from 'rxjs';
import Set from 'typescript-collections/dist/lib/Set';
export interface SharedPreferencesSetCollection<T> {
    addAll(items: T[]): Observable<void>;
    add(item: T): Observable<void>;
    remove(item: T): Observable<boolean>;
    clear(): Observable<void>;
    contains(item: T): Observable<boolean>;
    asList(): Observable<T[]>;
    asSet(): Observable<Set<T>>;
    asListChanges(): Observable<T[]>;
}
