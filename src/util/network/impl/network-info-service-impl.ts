import {Connection, NetworkInfoService, NetworkStatus} from '..';
import {BehaviorSubject, Observable} from 'rxjs';
import {injectable} from 'inversify';

@injectable()
export class NetworkInfoServiceImpl implements NetworkInfoService {
    networkStatus$: Observable<NetworkStatus>;
    private networkStatusSource: BehaviorSubject<NetworkStatus>;

    constructor() {
        let networkType;
        window['Capacitor']['Plugins'].Network.getStatus().then(status => {
            networkType = status.connectionType
            console.log("connection ", Connection);
            if (networkType === 'none') {
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
        }).catch(err => {
            console.log("Error on network call")
        })
    }
}
