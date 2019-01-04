import {Observable} from 'rxjs';

export class KeyValueStore {

    static setValue(key: string, value: string): Observable<boolean> {
        return Observable.of(true);
    }

    static getValue(key: string): Observable<string> {
        return Observable.of('{}');
    }
}
