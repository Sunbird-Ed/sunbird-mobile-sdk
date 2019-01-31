import { KeyValueStore } from '..';
import { Observable } from 'rxjs';
import { DbService } from '../../db';
export declare class KeyValueStoreImpl implements KeyValueStore {
    private dbService;
    constructor(dbService: DbService);
    getValue(key: string): Observable<string | undefined>;
    setValue(key: string, value: string): Observable<boolean>;
}
