import {Observable} from 'rxjs';
import {NetworkStatus} from './network-status';

export interface NetworkInfoService {
    networkStatus$: Observable<NetworkStatus>;
}
