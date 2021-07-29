import { ResponseInterceptor } from './response-interceptor';
import { RequestInterceptor } from './request-interceptor';
import { Authenticator } from './authenticator';
export declare enum HttpSerializer {
    JSON = "json",
    URLENCODED = "urlencoded",
    UTF8 = "utf8",
    RAW = "raw"
}
export declare enum HttpRequestType {
    GET = "GET",
    POST = "POST",
    PATCH = "PATCH"
}
export declare class Request {
    static Builder: any;
    private _host?;
    private _serializer;
    private _responseInterceptors;
    private _withApiToken;
    private _path;
    private _type;
    private _authenticators;
    serializer: HttpSerializer;
    withApiToken: boolean;
    private _headers?;
    private _body?;
    private _parameters?;
    body: {};
    protected constructor();
    private _withSessionToken;
    path: string;
    type: HttpRequestType;
    responseInterceptors: Array<ResponseInterceptor>;
    headers: {
        [p: string]: string;
    };
    parameters: {
        [key: string]: string;
    };
    withSessionToken: boolean;
    private _requestInterceptors;
    readonly requestInterceptors: RequestInterceptor[];
    authenticators: Authenticator[];
    readonly host: string | undefined;
}
