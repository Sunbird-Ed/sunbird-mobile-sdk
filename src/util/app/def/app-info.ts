import {Observable} from 'rxjs';

export interface AppInfo {
    init();

    getVersionName(): string;

    getFirstAccessTimestamp(): Observable<string>;
}
