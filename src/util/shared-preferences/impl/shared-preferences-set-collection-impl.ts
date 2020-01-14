import {SharedPreferencesSetCollection} from '../def/shared-preferences-set-collection';
import {SharedPreferences} from '..';
import {BehaviorSubject, Observable, Subject} from 'rxjs';
import Set from 'typescript-collections/dist/lib/Set';
import {map, mapTo, mergeMap, tap} from 'rxjs/operators';

export class SharedPreferencesSetCollectionImpl<T> implements SharedPreferencesSetCollection<T> {
    private changes: Subject<undefined> = new BehaviorSubject<undefined>(undefined);

    constructor(private sharedPreferences: SharedPreferences, private key: string, private toStringFunction?: (item: T) => string) {
    }

    addAll(items: T[]): Observable<void> {
        return this.asSet()
            .pipe(
                mergeMap((set: Set<T>) => {
                    items.forEach((item) => set.add(item));

                    return this.sharedPreferences.putString(this.key, JSON.stringify(set.toArray())).pipe(
                        mapTo(undefined)
                    );
                }),
                tap(() => this.changes.next(undefined))
            );
    }

    add(item: T): Observable<void> {
        return this.asSet()
            .pipe(
                mergeMap((set: Set<T>) => {
                    set.add(item);

                    return this.sharedPreferences.putString(this.key, JSON.stringify(set.toArray())).pipe(
                        mapTo(undefined)
                    );
                }),
                tap(() => this.changes.next(undefined))
            );
    }

    clear(): Observable<void> {
        return this.sharedPreferences.putString(this.key, '[]')
            .pipe(
                mapTo(undefined),
                tap(() => this.changes.next(undefined))
            );
    }

    remove(item: T): Observable<boolean> {
        return this.asSet()
            .pipe(
                mergeMap((set: Set<T>) => {
                    const hasRemoved = set.remove(item);

                    return this.sharedPreferences.putString(this.key, JSON.stringify(set.toArray())).pipe(
                        mapTo(hasRemoved)
                    );
                }),
                tap(() => this.changes.next(undefined))
            );
    }

    contains(item: T): Observable<boolean> {
        return this.asSet()
            .pipe(
                map((set) => {
                    return set.contains(item);
                })
            );
    }

    asList(): Observable<T[]> {
        return this.sharedPreferences.getString(this.key)
            .pipe(
                map((downloadListStringified?) => {
                    if (!downloadListStringified) {
                        return [];
                    }

                    return JSON.parse(downloadListStringified);
                })
            );
    }

    asSet(): Observable<Set<T>> {
        return this.asList()
            .pipe(
                map((items: T[]) => {
                    return items.reduce((acc, item) => {
                        acc.add(item);
                        return acc;
                    }, new Set<T>(this.toStringFunction));
                })
            );
    }

    asListChanges(): Observable<T[]> {
        return this.changes.asObservable()
            .pipe(
                mergeMap(() => {
                    return this.asList();
                })
            );
    }
}
