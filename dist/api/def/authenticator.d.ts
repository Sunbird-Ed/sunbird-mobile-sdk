import { Request } from './request';
import { ResponseInterceptor } from './response-interceptor';
export interface Authenticator extends ResponseInterceptor {
    interceptRequest(request: Request): Request;
}
