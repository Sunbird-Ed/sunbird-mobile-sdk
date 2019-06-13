import { NetworkInfoService, NetworkStatus } from '..';
import { Observable } from 'rxjs';
export declare class NetworkInfoServiceImpl implements NetworkInfoService {
    networkStatus$: Observable<NetworkStatus>;
    private networkStatusSource;
    constructor();
}
