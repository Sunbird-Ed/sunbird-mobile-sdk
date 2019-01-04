import {KeyValueStore} from '..';
import {Observable} from 'rxjs';
import {DbService} from '../../db';
import {KeyValueStoreEntry} from '../db/schema';

class NoResultError extends Error {
    constructor(m: string) {
        super(m);

        // Set the prototype explicitly.
        Object.setPrototypeOf(this, NoResultError.prototype);
    }
}

export class KeyValueStoreImpl implements KeyValueStore {
    constructor(private dbService: DbService) {
    }

    getValue(key: string): Observable<string> {
        return this.dbService.read({
            table: '',
            columns: [KeyValueStoreEntry._ID, KeyValueStoreEntry.KEY, KeyValueStoreEntry.VALUE],
            selection: `${KeyValueStoreEntry.KEY} = ?`,
            selectionArgs: [key]
        }).map((rows) => {
            if (rows[0]) {
                return JSON.stringify(rows[0]);
            }

            throw new NoResultError(`No Record for ${key} found`);
        });
    }

    setValue(key: string, value: string): Observable<boolean> {
        return this.getValue(key)
            .mergeMap((result: string) => {
                return this.dbService.update({
                    table: KeyValueStoreEntry.TABLE_NAME,
                    selection: `${KeyValueStoreEntry.KEY} = ?`,
                    selectionArgs: [key],
                    modelJson: {
                        key,
                        value
                    }
                });
            })
            .catch((e) => {
                if (e instanceof NoResultError) {
                    return this.dbService.insert({
                        table: KeyValueStoreEntry.TABLE_NAME,
                        modelJson: {
                            value
                        }
                    }).map(() => true);
                }

                throw e;
            });
    }
}
