import {HttpClient, HttpSerializer, NetworkError, Response as SunbirdApiResponse,  ResponseCode, HttpServerError} from '..';
import {Observable, from} from 'rxjs';
import * as qs from 'qs';

export class HttpClientBrowser implements HttpClient {
    private headers: { [key: string]: string } = {};
    private serializer?: HttpSerializer;

    private static async mapError(url: string, e: any): Promise<SunbirdApiResponse> {
        if (e instanceof HttpServerError || e instanceof NetworkError) {
            throw e;
        }

        throw new NetworkError(`
            ${url} -
            ${e || ''}
        `);
    }

    private static async mapResponse(response: Response): Promise<SunbirdApiResponse> {
        const sunbirdApiResponse = new SunbirdApiResponse<any>();
        sunbirdApiResponse.responseCode = response.status;

        sunbirdApiResponse.body = await response.json();

        if (typeof sunbirdApiResponse.body !== 'object') {
            throw new NetworkError(`
                ${response.url} -
                ${sunbirdApiResponse.body || ''}
            `);
        }

        if (response.ok) {
            return sunbirdApiResponse;
        }

        sunbirdApiResponse.errorMesg = 'SERVER_ERROR';

        if (
            response.status === ResponseCode.HTTP_UNAUTHORISED ||
            response.status === ResponseCode.HTTP_FORBIDDEN
        ) {
            return sunbirdApiResponse;
        }

        throw new HttpServerError(`
            ${response.url}
        `, sunbirdApiResponse);
    }

    constructor() {}

    setSerializer(httpSerializer: HttpSerializer) {
        this.serializer = httpSerializer;
    }

    addHeader(key: string, value: string) {
        this.headers[key] = value;
    }

    addHeaders(headers: { [p: string]: string }) {
        this.headers = {...this.headers, ...headers};
    }

    get(baseUrl: string, path: string, headers: any, parameters: any): Observable<SunbirdApiResponse> {
        const url = new URL(baseUrl + path);

        if (typeof parameters === 'object') {
            Object.keys(parameters).forEach((key) => {
                url.searchParams.append(key, parameters[key]);
            });
        }

        return from(
            window.fetch(url.toString(), {
                method: 'GET',
                headers: new Headers({...this.headers, ...headers}),
            }).then(HttpClientBrowser.mapResponse)
                .catch((e) => HttpClientBrowser.mapError(url.toString(), e))
        );
    }

    patch(baseUrl: string, path: string, headers: any, body: any): Observable<SunbirdApiResponse> {
        const url = new URL(baseUrl + path);

        if (this.serializer === HttpSerializer.URLENCODED && typeof body === 'object') {
            this.addHeader('content-type', 'application/x-www-form-urlencoded');
            body = qs.stringify(body);
        } else if (typeof body === 'object') {
            this.addHeader('content-type', 'application/x-www-form-urlencoded');
            body = JSON.stringify(body);
        }

        return from(
            window.fetch(url.toString(), {
                method: 'PATCH',
                headers: new Headers({...this.headers, ...headers}),
                body
            }).then(HttpClientBrowser.mapResponse)
                .catch((e) => HttpClientBrowser.mapError(url.toString(), e))
        );
    }

    post(baseUrl: string, path: string, headers: any, body: any): Observable<SunbirdApiResponse> {
        const url = new URL(baseUrl + path);

        if (this.serializer === HttpSerializer.URLENCODED && typeof body === 'object') {
            this.addHeader('content-type', 'application/x-www-form-urlencoded');
            body = qs.stringify(body);
        } else if (typeof body === 'object') {
            this.addHeader('content-type', 'application/x-www-form-urlencoded');
            body = JSON.stringify(body);
        }

        return from(
            window.fetch(url.toString(), {
                method: 'POST',
                headers: new Headers({...this.headers, ...headers}),
                body
            }).then(HttpClientBrowser.mapResponse)
                .catch((e) => HttpClientBrowser.mapError(url.toString(), e))
        );
    }
}
