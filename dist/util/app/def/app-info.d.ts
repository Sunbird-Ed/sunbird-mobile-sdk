import { Observable } from 'rxjs';
export interface AppInfo {
    init(): any;
    getAppName(): string;
    getVersionName(): string;
    getFirstAccessTimestamp(): Observable<string>;
}
