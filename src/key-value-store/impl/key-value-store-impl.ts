import {KeyValueStore} from '..';
import {Observable} from 'rxjs';
import {DbService} from '../../db';
import {KeyValueStoreEntry} from '../db/schema';

export class KeyValueStoreImpl implements KeyValueStore {
    constructor(private dbService: DbService) {
    }

    getValue(key: string): Observable<string | undefined> {
        return this.dbService.read({
            table: '',
            columns: [KeyValueStoreEntry._ID, KeyValueStoreEntry.KEY, KeyValueStoreEntry.VALUE],
            selection: `${KeyValueStoreEntry.KEY} = ?`,
            selectionArgs: [key]
        }).map(value => value[0]);
    }

    setValue(key: string, value: string): Observable<boolean> {
        return this.getValue(key)
            .mergeMap((response: string | undefined) => {
                if (response) {
                    return this.dbService.update({
                        table: KeyValueStoreEntry.TABLE_NAME,
                        selection: `${KeyValueStoreEntry.KEY} = ?`,
                        selectionArgs: [key],
                        modelJson: {
                            [KeyValueStoreEntry.KEY]: key,
                            [KeyValueStoreEntry.VALUE]: value
                        }
                    });

                } else {
                    return this.dbService.insert({
                        table: KeyValueStoreEntry.TABLE_NAME,
                        modelJson: {
                            [KeyValueStoreEntry.VALUE]: value
                        }
                    }).map(v => v > 0);
                }
            });
    }
}

