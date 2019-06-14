import {NetworkInfoService, NetworkStatus} from '..';
import {BehaviorSubject, Observable} from 'rxjs';
import {injectable} from 'inversify';

@injectable()
export class NetworkInfoServiceImpl implements NetworkInfoService {
    networkStatus$: Observable<NetworkStatus>;
    private networkStatusSource: BehaviorSubject<NetworkStatus>;

    constructor() {
        if (navigator.connection.type === Connection.NONE) {
            this.networkStatusSource = new BehaviorSubject<NetworkStatus>(NetworkStatus.OFFLINE);
        } else {
            this.networkStatusSource = new BehaviorSubject<NetworkStatus>(NetworkStatus.ONLINE);
        }

        window.addEventListener('online', () => {
            this.networkStatusSource.next(NetworkStatus.ONLINE);
        }, false);

        window.addEventListener('offline', () => {
            this.networkStatusSource.next(NetworkStatus.OFFLINE);
        }, false);

        this.networkStatus$ = this.networkStatusSource.asObservable();
    }
}
