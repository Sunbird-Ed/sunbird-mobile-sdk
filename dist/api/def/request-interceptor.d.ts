import { Request } from './request';
import { Observable } from 'rxjs';
export interface RequestInterceptor {
    interceptRequest(request: Request): Observable<Request>;
}
