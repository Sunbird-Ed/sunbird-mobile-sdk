import {Observable} from 'rxjs';
import {Framework} from '..';
import {GetSuggestedFramworksRequest} from './requests';

export interface FrameworkUtilService {
    getSuggestedFrameworkList(getSuggestedFrameworksRequest: GetSuggestedFramworksRequest): Observable<Framework[]>;
}
