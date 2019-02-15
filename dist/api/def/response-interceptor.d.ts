import { Request } from './request';
import { Response } from './response';
import { Observable } from 'rxjs';
export interface ResponseInterceptor {
    interceptResponse(request: Request, response: Response): Observable<Response>;
}
