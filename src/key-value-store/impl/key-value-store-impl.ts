import {KeyValueStore} from '..';
import {Observable} from 'rxjs';
import {DbService} from '../../db';
import {KeyValueStoreEntry} from '../db/schema';
import {Response} from '../../api';
import {ServiceConstants} from '../../sdk-constants';

export class KeyValueStoreImpl implements KeyValueStore {
    constructor(private dbService: DbService) {
    }

    getValue(key: string): Observable<Response> {
        return this.dbService.read({
            table: '',
            columns: [KeyValueStoreEntry._ID, KeyValueStoreEntry.KEY, KeyValueStoreEntry.VALUE],
            selection: `${KeyValueStoreEntry.KEY} = ?`,
            selectionArgs: [key]
        }).map((rows) => {
            const response = new Response();

            if (rows[0]) {
                response.body = rows[0];
                return response;
            }

            response.errorMesg = ServiceConstants.ErrorMessage.UNABLE_TO_FIND_KEY;
            return response;
        });
    }

    setValue(key: string, value: string): Observable<Response<boolean>> {
        return this.getValue(key)
            .mergeMap((response: Response) => {
                if (response.errorMesg && response.errorMesg === ServiceConstants.ErrorMessage.UNABLE_TO_FIND_KEY) {
                    return this.dbService.insert({
                        table: KeyValueStoreEntry.TABLE_NAME,
                        modelJson: {
                            value
                        }
                    }).map(() => {
                        const res = new Response<boolean>();
                        res.body = true;
                        return res;
                    });
                } else {
                    return this.dbService.update({
                        table: KeyValueStoreEntry.TABLE_NAME,
                        selection: `${KeyValueStoreEntry.KEY} = ?`,
                        selectionArgs: [key],
                        modelJson: {
                            key,
                            value
                        }
                    }).map(() => {
                        const res = new Response<boolean>();
                        res.body = true;
                        return res;
                    });
                }
            });
    }
}

