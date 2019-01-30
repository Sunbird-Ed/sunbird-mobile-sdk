import { Observable } from 'rxjs';
export interface ApiRequestHandler<Req, Res> {
    handle(request: Req): Observable<Res>;
}
