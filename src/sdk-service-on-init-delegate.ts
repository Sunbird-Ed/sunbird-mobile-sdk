import {Observable} from 'rxjs';

export interface SdkServiceOnInitDelegate {
    /** @internal */
    onInit(): Observable<undefined>;
}
