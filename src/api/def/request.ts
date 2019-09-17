import {ResponseInterceptor} from './response-interceptor';
import {RequestInterceptor} from './request-interceptor';
import {Authenticator} from './authenticator';
import {RequestBuildError} from '../errors/request-build-error';

export enum HttpSerializer {
    JSON = 'json',
    URLENCODED = 'urlencoded',
    UTF8 = 'utf8'
}

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

        withHost(host: string) {
            this.request._host = host;
            return this;
        }

        withPath(path: string) {
            this.request._path = path;
            return this;
        }

        withType(type: HttpRequestType) {
            this.request._type = type;
            return this;
        }

        withAuthenticator(authenticator: Authenticator) {
            this.request._authenticators.push(authenticator);
            return this;
        }

        withResponseInterceptor(responseInterceptor: ResponseInterceptor) {
            this.request._responseInterceptors.push(responseInterceptor);
            return this;
        }

        withRequestInterceptor(requestInterceptor: RequestInterceptor) {
            this.request._requestInterceptors.push(requestInterceptor);
            return this;
        }

        withHeaders(headers: { [key: string]: string }) {
            this.request._headers = headers;
            return this;
        }

        withBody(body: {}) {
            this.request._body = body;
            return this;
        }

        withParameters(parameters: { [key: string]: string }) {
            this.request._parameters = parameters;
            return this;
        }

        withApiToken(required: boolean) {
            this.request.withApiToken = required;
            return this;
        }

        withSessionToken(required: boolean) {
            this.request.withSessionToken = required;
            return this;
        }

        withSerializer(serializer: HttpSerializer) {
            this.request._serializer = serializer;
            return this;
        }

        build(): Request {
            if (!this.request._path) {
                throw new RequestBuildError('withPath() is required');
            }

            if (!this.request._type) {
                throw new RequestBuildError('withType() is required');
            }

            return this.request;
        }

    };

    private _host?: string;
    private _serializer: HttpSerializer = HttpSerializer.JSON;
    private _responseInterceptors: ResponseInterceptor[] = [];
    private _withApiToken = false;
    private _path: string;
    private _type: HttpRequestType;
    private _authenticators: Authenticator[] = [];

    get serializer(): HttpSerializer {
        return this._serializer;
    }

    set serializer(value: HttpSerializer) {
        this._serializer = value;
    }

    get withApiToken(): boolean {
        return this._withApiToken;
    }

    set withApiToken(value: boolean) {
        this._withApiToken = value;
    }
    private _headers?: { [key: string]: string } = {};
    private _body?: {} = {};
    private _parameters?: { [key: string]: string } = {};

    get body(): {} {
        return this._body!;
    }

    protected constructor() {

    }

    private _withSessionToken = false;

    set path(value: string) {
        this._path = value;
    }

    get type(): HttpRequestType {
        return this._type;
    }

    set responseInterceptors(value: Array<ResponseInterceptor>) {
        this._responseInterceptors = value;
    }

    set headers(value: { [p: string]: string }) {
        this._headers = value;
    }

    set body(value: {}) {
        this._body = value;
    }

    get path(): string {
        return this._path;
    }

    set type(value: HttpRequestType) {
        this._type = value;
    }

    get responseInterceptors(): Array<ResponseInterceptor> {
        return this._responseInterceptors;
    }

    get headers(): { [p: string]: string } {
        return this._headers!;
    }

    get parameters(): { [key: string]: string } {
        return this._parameters!;
    }

    set parameters(value: { [key: string]: string }) {
        this._parameters = value;
    }

    get withSessionToken(): boolean {
        return this._withSessionToken;
    }

    set withSessionToken(value: boolean) {
        this._withSessionToken = value;
    }

    private _requestInterceptors: RequestInterceptor[] = [];

    get requestInterceptors(): RequestInterceptor[] {
        return this._requestInterceptors;
    }

    get authenticators(): Authenticator[] {
        return this._authenticators;
    }

    set authenticators(value: Authenticator[]) {
        this._authenticators = value;
    }

    get host(): string | undefined {
        return this._host;
    }
}
