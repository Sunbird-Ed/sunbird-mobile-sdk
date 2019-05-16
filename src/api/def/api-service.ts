import {Request} from './request';
import {Observable} from 'rxjs';
import {Response} from './response';
import {Authenticator} from './authenticator';

export interface ApiService {
    fetch<T = any>(request: Request): Observable<Response<T>>;

    setDefaultApiAuthenticators(authenticators: Authenticator[]): void;

    setDefaultSessionAuthenticators(authenticators: Authenticator[]): void;
}
