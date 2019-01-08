import {Authenticator} from '../def/authenticator';
import {ApiTokenHandler} from '../handlers/api-token-handler';
import {ApiConfig, Connection, KEY_API_TOKEN, Request, Response, ResponseCode} from '..';
import {Observable, Subject} from 'rxjs';

export class ApiAuthenticator implements Authenticator {

    private apiTokenHandler: ApiTokenHandler;

    constructor(private apiConfig: ApiConfig) {
        this.apiTokenHandler = new ApiTokenHandler(this.apiConfig);
    }

    interceptRequest(request: Request): Request {
        const bearerToken = localStorage.getItem(KEY_API_TOKEN);

        if (bearerToken) {
            const existingHeaders = request.headers;
            existingHeaders['Authorization'] = `Bearer ${bearerToken}`;
            request.headers = existingHeaders;
        }
        return request;
    }

    onResponse(request: Request, response: Response, connection: Connection): Observable<Response> {

        const observable = new Subject<Response>();

        if (response.responseCode !== ResponseCode.HTTP_UNAUTHORISED) {
            observable.next(response);
            observable.complete();
        } else {
            this.apiTokenHandler.refreshAuthToken(connection)
                .subscribe((bearerToken: string) => {
                    localStorage.setItem(KEY_API_TOKEN, bearerToken);
                    connection.invoke(request).subscribe(v => {
                        observable.next(v);
                        observable.complete();
                    });
                });
        }


        return observable;
    }
}
