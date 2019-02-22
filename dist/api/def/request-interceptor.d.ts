import { Request } from './request';
export interface RequestInterceptor {
    interceptRequest(request: Request): Request;
}
