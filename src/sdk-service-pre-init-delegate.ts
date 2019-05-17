import {Observable} from 'rxjs';

export interface SdkServicePreInitDelegate {
    /** @internal */
    preInit(): Observable<undefined>;
}
