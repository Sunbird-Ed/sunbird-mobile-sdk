import {Observable} from 'rxjs';
import {Response} from '../../api';

export interface KeyValueStore {
    setValue(key: string, value: string): Observable<boolean>;

    getValue(key: string): Observable<string | undefined>;
}
