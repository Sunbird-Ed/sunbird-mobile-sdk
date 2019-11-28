import {KeyValueStore} from '..';
import {DbService} from '../../db';
import {KeyValueStoreEntry} from '../db/schema';
import {injectable, inject} from 'inversify';
import {InjectionTokens} from '../../injection-tokens';
import {Observable} from 'rxjs';
import {map, mergeMap} from 'rxjs/operators';

@injectable()
export class KeyValueStoreImpl implements KeyValueStore {
    constructor(@inject(InjectionTokens.DB_SERVICE) private dbService: DbService) {
    }

    getValue(key: string): Observable<string | undefined> {
        return this.dbService.read({
            table: KeyValueStoreEntry.TABLE_NAME,
            columns: [],
            selection: `${KeyValueStoreEntry.COLUMN_NAME_KEY} = ?`,
            selectionArgs: [key]
        }).pipe(
            map((res: { key: string, value: string }[]) => res[0] && res[0].value)
        );
    }

    setValue(key: string, value: string): Observable<boolean> {
        return this.getValue(key).pipe(
            mergeMap((response: string | undefined) => {
                if (response) {
                    return this.dbService.update({
                        table: KeyValueStoreEntry.TABLE_NAME,
                        selection: `${KeyValueStoreEntry.COLUMN_NAME_KEY} = ?`,
                        selectionArgs: [key],
                        modelJson: {
                            [KeyValueStoreEntry.COLUMN_NAME_KEY]: key,
                            [KeyValueStoreEntry.COLUMN_NAME_VALUE]: value
                        }
                    }).pipe(
                        map(v => v > 0)
                    );

                } else {
                    return this.dbService.insert({
                        table: KeyValueStoreEntry.TABLE_NAME,
                        modelJson: {
                            [KeyValueStoreEntry.COLUMN_NAME_KEY]: key,
                            [KeyValueStoreEntry.COLUMN_NAME_VALUE]: value
                        }
                    }).pipe(
                        map(v => v > 0)
                    );
                }
            })
        );
    }
}

