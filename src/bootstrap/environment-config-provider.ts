import {Observable} from 'rxjs';

export interface EnvironmentConfigProvider {
    provide(): Observable<{ [key: string]: string }>;
}
