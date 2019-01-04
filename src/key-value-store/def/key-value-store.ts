import {Observable} from 'rxjs';
import {Response} from '../../api';

export interface KeyValueStore {
    setValue(key: string, value: string): Observable<Response<boolean>>;

    getValue(key: string): Observable<Response<string>>;
}
