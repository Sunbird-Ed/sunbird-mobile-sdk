import {ResponseInterceptor} from './response-interceptor';
import {Authenticator} from './authenticator';

export enum REQUEST_TYPE {
    GET = 'GET',
    POST = 'POST',
    PATCH = 'PATCH'
}

export class Request {
    static Builder = class Builder {

        protected request: Request;

        constructor() {
            this.request = new Request();
        }

        withPath(path: string) {
            this.request._path = path;
            return this;
        }

        withType(type: REQUEST_TYPE) {
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

        withBody(body: string) {
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
    private _type: REQUEST_TYPE;
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

    set type(value: REQUEST_TYPE) {
        this._type = value;
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

    get type(): REQUEST_TYPE {
        return this._type;
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
