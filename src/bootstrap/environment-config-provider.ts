import {Observable} from 'rxjs';
import {BootstrapConfig} from './bootstrap-config';

export interface EnvironmentConfigProvider {
    provide(bootstrapConfig: BootstrapConfig): Observable<{ [key: string]: string }>;
}
