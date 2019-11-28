import { Observable } from 'rxjs';
export interface AppInfo {
    init(): any;
    getVersionName(): string;
    getFirstAccessTimestamp(): Observable<string>;
}
