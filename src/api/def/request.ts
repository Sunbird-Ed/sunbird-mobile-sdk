import {ResponseInterceptor} from './response-interceptor';
import {Authenticator} from './authenticator';

export enum HttpRequestType {
    GET = 'GET',
    POST = 'POST',
    PATCH = 'PATCH'
}

export class Request {
    static Builder: any = class Builder {

        protected request: Request;

        constructor() {
            this.request = new Request();
        }

        withPath(path: string) {
            this.request._path = path;
            return this;
        }

        withType(type: HttpRequestType) {
            this.request._type = type;
            return this;
        }

        withApiToken(requiredApiToken: boolean) {
            this.request._requiredApiToken = requiredApiToken;
            return this;
        }

        withInterceptors(responseInterceptors: Array<ResponseInterceptor>) {
            this.request._responseInterceptors = responseInterceptors;
            return this;
        }

        withAuthenticator(authenticator: Authenticator) {
            this.request._authenticators.push(authenticator);
            return this;
        }

        withHeaders(headers: { [key: string]: string }) {
            this.request._headers = headers;
            return this;
        }

        withBody(body: string | object) {
            if (typeof body === 'object') {
                body = JSON.stringify(body);
            }
            this.request._body = body;
            return this;
        }

        withParameters(parameters: string) {
            this.request._parameters = parameters;
            return this;
        }

        build(): Request {

            if (!this.request._path || !this.request._type) {
                throw new Error();
            }
            return this.request;
        }

    };

    private _path: string;
    private _type: HttpRequestType;
    private _requiredApiToken = true;
    private _responseInterceptors: ResponseInterceptor[] = [];
    private _authenticators: Authenticator[] = [];
    private _headers?: { [key: string]: string };
    private _body?: string;
    private _parameters?: string;

    protected constructor() {

    }

    addAuthenticator(authenticator: Authenticator) {
        this._authenticators.push(authenticator);
    }

    get authenticators(): Authenticator[] {
        return this._authenticators;
    }

    set path(value: string) {
        this._path = value;
    }

    get type(): HttpRequestType {
        return this._type;
    }

    set requiredApiToken(value: boolean) {
        this._requiredApiToken = value;
    }

    set responseInterceptors(value: Array<ResponseInterceptor>) {
        this._responseInterceptors = value;
    }

    set headers(value: { [p: string]: string }) {
        this._headers = value;
    }

    set body(value: string) {
        this._body = value;
    }

    set parameters(value: string) {
        this._parameters = value;
    }

    get path(): string {
        return this._path;
    }

    set type(value: HttpRequestType) {
        this._type = value;
    }

    get requiredApiToken(): boolean {
        return this._requiredApiToken;
    }

    get responseInterceptors(): Array<ResponseInterceptor> {
        return this._responseInterceptors;
    }

    get headers(): { [p: string]: string } {
        return this._headers!;
    }

    get body(): string {
        return this._body!;
    }

    get parameters(): string {
        return this._parameters!;
    }
}
