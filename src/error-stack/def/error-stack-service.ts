
import {Observable} from 'rxjs';
import { ErrorStack} from '../def/error-stack';


export interface ErrorStackService {

    createErrorStack(errorStack: ErrorStack): Observable<ErrorStack>;

    deleteErrorStack(): Observable<undefined>;

    stackCount(): Observable<number>;

    getAllErrorStack(): Observable<ErrorStack[]>;


}
