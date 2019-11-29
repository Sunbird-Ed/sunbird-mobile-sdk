import { KeyValueStore } from '..';
import { DbService } from '../../db';
import { Observable } from 'rxjs';
export declare class KeyValueStoreImpl implements KeyValueStore {
    private dbService;
    constructor(dbService: DbService);
    getValue(key: string): Observable<string | undefined>;
    setValue(key: string, value: string): Observable<boolean>;
}
