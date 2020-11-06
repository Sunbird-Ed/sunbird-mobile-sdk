import {NetworkInfoService, NetworkStatus} from '..';
import {BehaviorSubject, Observable, of} from 'rxjs';
import {inject, injectable} from 'inversify';
import {InjectionTokens} from '../../../injection-tokens';
import {SdkConfig} from '../../../sdk-config';

@injectable()
export class NetworkInfoServiceImpl implements NetworkInfoService {
    networkStatus$: Observable<NetworkStatus>;
    private networkStatusSource: BehaviorSubject<NetworkStatus>;

    constructor(
        @inject(InjectionTokens.SDK_CONFIG) private sdkConfig: SdkConfig
    ) {
        if (sdkConfig.platform !== 'android') {
            this.networkStatus$ = of(NetworkStatus.ONLINE);
            return;
        }

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
