import { RequestInterceptor } from './request-interceptor';
import { ResponseInterceptor } from './response-interceptor';
export interface Authenticator extends RequestInterceptor, ResponseInterceptor {
}
