import { Observable } from 'rxjs';
export interface KeyValueStore {
    setValue(key: string, value: string): Observable<boolean>;
    getValue(key: string): Observable<string | undefined>;
}
