import {Observable} from 'rxjs';

export interface AppInfo {
    init();

    getAppName(): string;

    getVersionName(): string;

    getFirstAccessTimestamp(): Observable<string>;
}
