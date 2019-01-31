import { ResponseInterceptor } from './response-interceptor';
import { Authenticator } from './authenticator';
export declare enum HttpRequestType {
    GET = "GET",
    POST = "POST",
    PATCH = "PATCH"
}
export declare class Request {
    static Builder: any;
    private _path;
    private _type;
    private _requiredApiToken;
    private _responseInterceptors;
    private _authenticators;
    private _headers?;
    private _body?;
    private _parameters?;
    protected constructor();
    addAuthenticator(authenticator: Authenticator): void;
    readonly authenticators: Authenticator[];
    path: string;
    type: HttpRequestType;
    requiredApiToken: boolean;
    responseInterceptors: Array<ResponseInterceptor>;
    headers: {
        [p: string]: string;
    };
    body: string;
    parameters: string;
}
