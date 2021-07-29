import { Request } from './request';
import { Observable } from 'rxjs';
import { Response } from './response';
import { Authenticator } from './authenticator';
import { SdkServiceOnInitDelegate } from '../../sdk-service-on-init-delegate';
export interface ApiService extends SdkServiceOnInitDelegate {
    fetch<T = any>(request: Request): Observable<Response<T>>;
    setDefaultApiAuthenticators(authenticators: Authenticator[]): void;
    setDefaultSessionAuthenticators(authenticators: Authenticator[]): void;
}
