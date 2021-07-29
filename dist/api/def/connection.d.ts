import { Request } from './request';
import { Response } from './response';
import { Observable } from 'rxjs';
export interface Connection {
    invoke(request: Request): Observable<Response>;
}
