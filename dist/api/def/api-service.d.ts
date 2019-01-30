import { Request } from './request';
import { Observable } from 'rxjs';
import { Response } from './response';
export interface ApiService {
    fetch<T = any>(request: Request): Observable<Response<T>>;
}
